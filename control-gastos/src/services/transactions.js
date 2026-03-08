import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function getTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function addTransaction(transaction) {
  await addDoc(collection(db, "transactions"), transaction);
}

export async function updateTransaction(id, updatedData) {
  const ref = doc(db, "transactions", id);
  await updateDoc(ref, updatedData);
}

export async function deleteTransaction(id) {
  const ref = doc(db, "transactions", id);
  await deleteDoc(ref);
}
