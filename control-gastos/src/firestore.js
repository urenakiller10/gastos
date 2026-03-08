import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getTransactions() {
  const querySnapshot = await getDocs(collection(db, "transactions"));

  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  return data;
}