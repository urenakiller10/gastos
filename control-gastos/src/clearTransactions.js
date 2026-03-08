import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export async function clearTransactions() {
  const snapshot = await getDocs(collection(db, "transactions"));

  for (const documentItem of snapshot.docs) {
    await deleteDoc(doc(db, "transactions", documentItem.id));
  }

  console.log("Colección transactions borrada");
}