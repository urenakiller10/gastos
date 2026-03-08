import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function getWishlist() {
  const snapshot = await getDocs(collection(db, "wishlist"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function addWishlistItem(item) {
  await addDoc(collection(db, "wishlist"), item);
}

export async function updateWishlistItem(id, updatedData) {
  const ref = doc(db, "wishlist", id);
  await updateDoc(ref, updatedData);
}

export async function deleteWishlistItem(id) {
  const ref = doc(db, "wishlist", id);
  await deleteDoc(ref);
}