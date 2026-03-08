const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

function decodeBase64Url(data) {
  if (!data) return "";
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

function extractBody(payload) {
  if (!payload) return "";

  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }

    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }

    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }

  return "";
}

async function getEmailById(messageId) {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return response.data;
}

function cleanHtml(text) {
  return String(text || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&oacute;/gi, "ó")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBcrTransaction(emailText) {
  const text = cleanHtml(emailText);

  if (
    !text.includes("Transacciones en su tarjeta BCR") &&
    !text.includes("Detalle de Transacciones")
  ) {
    return null;
  }

  const regex =
    /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\s+(\d+)\s+(\d+)\s+([\d,]+\.\d{2})\s+(COLON COSTA RICA|DOLAR(?:ES)?(?:\s+USA)?|USD|CRC)\s+(.+?)\s+(Aprobada|Negada)/i;

  const match = text.match(regex);

  if (!match) {
    return null;
  }

  const [
    ,
    fechaHora,
    autorizacion,
    referencia,
    montoTexto,
    moneda,
    comercio,
    estado,
  ] = match;

  const monto = Number(montoTexto.replace(/,/g, ""));

  return {
    descripcion: comercio.trim(),
    monto: Number.isNaN(monto) ? montoTexto : monto,
    fecha: fechaHora,
    autorizacion,
    referencia,
    moneda: moneda.trim(),
    estado: estado.trim(),
    origen: "correo_bcr",
    rawText: text,
  };
}

async function listBcrEmails() {
  const response = await gmail.users.messages.list({
    userId: "me",
    q: 'from:bcrtarjestcta@bancobcr.com newer_than:30d',
    maxResults: 20,
  });

  return response.data.messages || [];
}

function formatFechaPago(fechaHora) {
  const [fecha] = fechaHora.split(" ");
  const [dd, mm, yyyy] = fecha.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClosestFriday(year, month, targetDay) {
  let bestDate = null;
  let bestDiff = Infinity;

  for (let offset = -3; offset <= 3; offset++) {
    const candidate = new Date(year, month, targetDay + offset);

    if (candidate.getDay() === 5) {
      const diff = Math.abs(offset);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestDate = candidate;
      }
    }
  }

  return bestDate;
}

function getPayDatesAround(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const candidates = [
    getClosestFriday(year, month - 1, 15),
    getClosestFriday(year, month - 1, 30),
    getClosestFriday(year, month, 15),
    getClosestFriday(year, month, 30),
    getClosestFriday(year, month + 1, 15),
    getClosestFriday(year, month + 1, 30),
  ];

  return candidates.filter(Boolean).sort((a, b) => a - b);
}

function calcularPeriodo(fechaPago) {
  if (!fechaPago) {
    return {
      periodo: "",
      periodoInicio: "",
      periodoFin: "",
    };
  }

  const fecha = new Date(`${fechaPago}T00:00:00`);
  const payDates = getPayDatesAround(fecha);

  let inicio = null;
  let fin = null;

  for (let i = 0; i < payDates.length - 1; i++) {
    const pagoActual = payDates[i];
    const siguientePago = payDates[i + 1];

    if (fecha >= pagoActual && fecha < siguientePago) {
      inicio = pagoActual;
      fin = new Date(siguientePago);
      fin.setDate(fin.getDate() - 1);
      break;
    }
  }

  if (!inicio || !fin) {
    const primerPago = payDates[0];
    const segundoPago = payDates[1];

    inicio = primerPago;
    fin = new Date(segundoPago);
    fin.setDate(fin.getDate() - 1);
  }

  const periodoInicio = formatDateLocal(inicio);
  const periodoFin = formatDateLocal(fin);

  return {
    periodo: `${periodoInicio}_${periodoFin}`,
    periodoInicio,
    periodoFin,
  };
}

function categorizarBcr(descripcion = "") {
  const text = descripcion.toLowerCase();

  if (text.includes("uber")) return "Uber";

  if (text.includes("didi") || text.includes("pedidosya")) {
    return "Pedidos Ya/Didi";
  }

  if (text.includes("walmart") || text.includes("minisuper") || text.includes("super")|| text.includes("pulpe")) {
    return "Supermercado";
  }

  if (text.includes("spotify") || text.includes("netflix") || text.includes("youtube")|| text.includes("Youtube")) {
    return "Suscripciones";
  }

  if (text.includes("gimnasio") || text.includes("gym")) {
    return "Gimnasio";
  }

  if (text.includes("alquiler")) {
    return "Alquiler";
  }

  if (text.includes("plan")|| text.includes("Liberty")) {
    return "Plan";
  }

  if (text.includes("regalo")) {
    return "Regalos";
  }

  if (text.includes("comedor")) {
    return "Comedor";
  }

  return "Salidas";
}

function mapBcrToAppTransaction(tx) {
  const fechaPago = formatFechaPago(tx.fecha);
  const periodoData = calcularPeriodo(fechaPago);

  return {
    fechaPago,
    categoria: categorizarBcr(tx.descripcion),
    monto: tx.monto,
    periodo: periodoData.periodo,
    periodoInicio: periodoData.periodoInicio,
    periodoFin: periodoData.periodoFin,
  };
}

function parseFechaHora(fechaHora) {
  const [fecha, hora] = fechaHora.split(" ");
  const [dd, mm, yyyy] = fecha.split("/");
  return new Date(`${yyyy}-${mm}-${dd}T${hora}`);
}

async function readBcrTransactions() {
  const messages = await listBcrEmails();
  console.log("Correos encontrados:", messages.length);

  const transactions = [];

  for (const message of messages) {
    try {
      console.log("Leyendo mensaje:", message.id);

      const detail = await getEmailById(message.id);
      const body = extractBody(detail.payload) || "";

      console.log("Contenido extraído:", String(body).slice(0, 500));

      const parsed = parseBcrTransaction(body);

      console.log("Resultado parseado:", parsed);

      if (parsed && parsed.estado === "Aprobada") {
        transactions.push({
          emailMessageId: message.id,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Error leyendo mensaje", message.id, error.message);
    }
  }

  transactions.sort((a, b) => parseFechaHora(b.fecha) - parseFechaHora(a.fecha));

  return transactions;
}

module.exports = {
  readBcrTransactions,
  mapBcrToAppTransaction,
};