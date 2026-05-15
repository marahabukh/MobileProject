import { db } from "./firebase";
import { collection, doc, addDoc, getDocs, deleteDoc, updateDoc, query, where } from "firebase/firestore";

type AddToCartPayload = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
};

export const addToCart = async (payload: AddToCartPayload) => {
  if (!payload.productId || !payload.title || !payload.price || !payload.quantity) {
    throw new Error("Missing required fields");
  }
  
  const cartRef = collection(db, "cart");
  const q = query(cartRef, where("productId", "==", payload.productId), where("size", "==", payload.size));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const newQuantity = (existingDoc.data().quantity || 0) + payload.quantity;
    return await updateCartItem(existingDoc.id, newQuantity);
  }

  const body = {
    productId: payload.productId,
    title: payload.title,
    price: Number(payload.price),
    image: payload.image,
    quantity: Number(payload.quantity),
    size: payload.size || "",
    createdAt: new Date().toISOString()
  };

  return await addDoc(cartRef, body);
};

export const getCartItems = async () => {
<<<<<<< Updated upstream
  const querySnapshot = await getDocs(collection(db, "cart"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as any));
=======
  const res = await axiosInstance.get("/cart");
  if (!res.data.documents) return [];

  return res.data.documents.map((doc: any) => {
    const parsedFields = Object.fromEntries(
      Object.entries(doc.fields || {}).map(([key, value]: any) => [key, Object.values(value)[0]])
    );

    return {
      ...parsedFields,
      id: doc.name.split("/").pop(), 
    };
  });
>>>>>>> Stashed changes
};

export const removeFromCart = async (id: string) => {
  return await deleteDoc(doc(db, "cart", id));
};

export const updateCartItem = async (id: string, quantity: number) => {
  return await updateDoc(doc(db, "cart", id), { quantity: Number(quantity) });
};
