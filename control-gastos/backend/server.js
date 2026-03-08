const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  limit,
} = require("firebase/firestore");
const { db } = require("./firebase");
const { readBcrTransactions, mapBcrToAppTransaction } = require("./gmail");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend de control de gastos funcionando");
});

app.get("/transactions", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "transactions"));

    const transactions = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    res.json(transactions);
  } catch (error) {
    console.error("ERROR EN /transactions:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post("/transactions", async (req, res) => {
  try {
    const nueva = req.body;

    const docRef = await addDoc(collection(db, "transactions"), nueva);

    res.status(201).json({
      id: docRef.id,
      ...nueva,
    });
  } catch (error) {
    console.error("ERROR EN POST /transactions:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.get("/approve-latest-bcr", async (req, res) => {
  try {
    const nuevas = await readBcrTransactions();

    if (!nuevas.length) {
      return res.status(404).json({
        ok: false,
        error: "No se encontraron transacciones BCR aprobadas",
      });
    }

    const ultima = nuevas[0];
    const payload = mapBcrToAppTransaction(ultima);

    const q = query(
      collection(db, "transactions"),
      where("fechaPago", "==", payload.fechaPago),
      where("categoria", "==", payload.categoria),
      where("monto", "==", payload.monto),
      limit(1)
    );

    const snapshot = await getDocs(q);
    const yaExiste = !snapshot.empty;

    if (yaExiste) {
      return res.json({
        ok: true,
        message: "La última transacción ya estaba guardada en Firebase",
        transaction: payload,
      });
    }

    const docRef = await addDoc(collection(db, "transactions"), payload);

    res.status(201).json({
      ok: true,
      message: "Última transacción agregada correctamente en Firebase",
      transaction: {
        id: docRef.id,
        ...payload,
      },
    });
  } catch (error) {
    console.error("ERROR EN /approve-latest-bcr:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

async function syncBcrToFirestore() {
  try {
    console.log("Sincronizando correos BCR...");

    const nuevas = await readBcrTransactions();
    let agregadas = 0;

    for (const tx of nuevas) {
      const payload = mapBcrToAppTransaction(tx);

      const q = query(
        collection(db, "transactions"),
        where("fechaPago", "==", payload.fechaPago),
        where("categoria", "==", payload.categoria),
        where("monto", "==", payload.monto),
        limit(1)
      );

      const snapshot = await getDocs(q);
      const yaExiste = !snapshot.empty;

      if (!yaExiste) {
        await addDoc(collection(db, "transactions"), payload);
        agregadas++;
        console.log("Agregada:", payload);
      }
    }

    console.log(`Sincronización terminada. Nuevas agregadas: ${agregadas}`);
  } catch (error) {
    console.error("Error en sincronización automática:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  syncBcrToFirestore();
  setInterval(syncBcrToFirestore, 60 * 1000);
});