import { db } from "./firebase";
import { collection, doc, addDoc, getDocs, deleteDoc, query, where, updateDoc, getDoc } from "firebase/firestore";

export const createCategory = async (category: { name: string; image?: string }) => {
  const payload = {
    name: category.name,
    image: category.image || "",
    createdAt: new Date().toISOString(),
  };
  return await addDoc(collection(db, "categories"), payload);
};

export const getCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map(doc => ({
    ...doc.data() as object,
    id: doc.id,
  } as any));
};

export const getCategoryById = async (id: string) => {
  const docRef = doc(db, "categories", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
};

export const updateCategory = async (id: string, category: { name: string; image?: string }) => {
  const docRef = doc(db, "categories", id);
  return await updateDoc(docRef, category);
};

export const deleteCategory = async (id: string) => {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("SDK Delete Category Error:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string) => {
  const q = query(collection(db, "products"), where("categoryId", "==", categoryId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as any));
};