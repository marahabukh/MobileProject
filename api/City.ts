import { db } from "./firebase";
import { collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, orderBy, query } from "firebase/firestore";

export type City = {
  id?: string;
  name: string;
  deliveryPrice: number;
  createdAt?: string;
};

export const createCity = async (city: Omit<City, "id">) => {
  const payload = {
    ...city,
    createdAt: new Date().toISOString(),
  };
  return await addDoc(collection(db, "cities"), payload);
};

export const getCities = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "cities"));
    const cityList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as City));
    return cityList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("SDK Get Cities Error:", error);
    return [];
  }
};

export const updateCity = async (id: string, city: Partial<City>) => {
  const docRef = doc(db, "cities", id);
  return await updateDoc(docRef, city);
};

export const deleteCity = async (id: string) => {
  const docRef = doc(db, "cities", id);
  await deleteDoc(docRef);
  return true;
};
