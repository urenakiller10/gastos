import {
  writeBatch,
  doc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClosestFriday(year, month, targetDay) {
  const targetDate = new Date(year, month, targetDay);

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

function getQuincenaFromDate(inputDate = new Date()) {
  const date =
    inputDate instanceof Date
      ? new Date(
          inputDate.getFullYear(),
          inputDate.getMonth(),
          inputDate.getDate()
        )
      : new Date(`${inputDate}T00:00:00`);

  const payDates = getPayDatesAround(date);

  let inicio = null;
  let fin = null;

  for (let i = 0; i < payDates.length - 1; i++) {
    const currentPay = payDates[i];
    const nextPay = payDates[i + 1];

    if (date >= currentPay && date < nextPay) {
      inicio = currentPay;
      fin = new Date(nextPay);
      fin.setDate(fin.getDate() - 1);
      break;
    }
  }

  if (!inicio || !fin) {
    const first = payDates[0];
    const second = payDates[1];

    inicio = first;
    fin = new Date(second);
    fin.setDate(fin.getDate() - 1);
  }

  return {
    inicio,
    fin,
    periodo: `${formatDateLocal(inicio)}_${formatDateLocal(fin)}`,
    periodoInicio: formatDateLocal(inicio),
    periodoFin: formatDateLocal(fin),
  };
}

function normalizeTransaction(tx) {
  const quincena = getQuincenaFromDate(tx.fechaPago);

  return {
    ...tx,
    periodo: quincena.periodo,
    periodoInicio: quincena.periodoInicio,
    periodoFin: quincena.periodoFin,
  };
}

function makeId(tx, index) {
  const categoria = tx.categoria
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${tx.periodo}-${tx.fechaPago}-${categoria}-${index}`;
}

const rawTransactions = [
  { fechaPago: "2026-02-13", categoria: "Ahorro", monto: 0 },
  { fechaPago: "2026-02-13", categoria: "Visita Puriscal", monto: 4360 },
  { fechaPago: "2026-02-13", categoria: "Suscripciones", monto: 4885 },
  { fechaPago: "2026-02-13", categoria: "Deuda Allan", monto: 10000 },
  { fechaPago: "2026-02-13", categoria: "Pedidos Ya/Didi", monto: 18233 },
  { fechaPago: "2026-02-13", categoria: "Uber", monto: 20074 },
  { fechaPago: "2026-02-13", categoria: "Gimnasio", monto: 24000 },
  { fechaPago: "2026-02-13", categoria: "Mami", monto: 32000 },
  { fechaPago: "2026-02-13", categoria: "Walmart", monto: 44403 },
  { fechaPago: "2026-02-13", categoria: "Salidas", monto: 70766 },
  { fechaPago: "2026-02-13", categoria: "Regalos", monto: 61050 },
  { fechaPago: "2026-02-13", categoria: "Comedor", monto: 5150 },

  { fechaPago: "2026-02-27", categoria: "Suscripciones", monto: 1790 },
  { fechaPago: "2026-02-27", categoria: "Regalos", monto: 2000 },
  { fechaPago: "2026-02-27", categoria: "Uber", monto: 12000 },
  { fechaPago: "2026-02-27", categoria: "Pedidos Ya/Didi", monto: 3850 },
  { fechaPago: "2026-02-27", categoria: "Salidas/Comedor", monto: 22911 },
  { fechaPago: "2026-02-27", categoria: "Walmart", monto: 32288 },
  { fechaPago: "2026-02-27", categoria: "Alquiler", monto: 100000 },
  { fechaPago: "2026-02-27", categoria: "Ahorro", monto: 100000 },
  { fechaPago: "2026-02-27", categoria: "Comedor", monto: 9600 },
];

export async function resetAndSeedTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));

  for (const item of snapshot.docs) {
    await deleteDoc(doc(db, "transactions", item.id));
  }

  const batch = writeBatch(db);

  const transactions = rawTransactions.map(normalizeTransaction);

  transactions.forEach((tx, index) => {
    const id = makeId(tx, index);
    const ref = doc(db, "transactions", id);
    batch.set(ref, tx);
  });

  await batch.commit();
  console.log("Transactions reseteadas y cargadas con el nuevo formato");
}