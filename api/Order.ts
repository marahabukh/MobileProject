import { db } from "./firebase";
import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc } from "firebase/firestore";


type OrderItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
};

type CreateOrderPayload = {
  orderId: string;
  firstName: string;
  lastName: string;
  phone1: string;
  phone2?: string;
  address: string;
  city: string;
  region: string;
  notes?: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: OrderItem[];
  status?: string;
  createdAt?: string;
};



export const createOrder = async (payload: CreateOrderPayload) => {
  try {
    const orderData = {
      ...payload,
      status: payload.status || "pending",
      createdAt: payload.createdAt || new Date().toISOString(),
      phone2: payload.phone2 || "",
      notes: payload.notes || "",
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("SDK Create Order Error:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        total: Number(data.total || 0),
        subtotal: Number(data.subtotal || 0),
        shippingCost: Number(data.shippingCost || 0),
        status: data.status || "pending",
        createdAt: data.createdAt || "",
        items: data.items || [],
        customerName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      };
    });
  } catch (error) {
    console.error("SDK Get Orders Error:", error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const docRef = doc(db, "orders", orderId);
  return await updateDoc(docRef, { status });
};