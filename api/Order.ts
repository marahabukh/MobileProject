import { or } from "firebase/firestore";
import axiosInstance from "./ApiBase";

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

const toFirestoreValue = (value: any): any => {
  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: value }
      : { doubleValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }

  if (value && typeof value === "object") {
    const fields: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      fields[key] = toFirestoreValue(value[key]);
    });

    return {
      mapValue: {
        fields,
      },
    };
  }

  return { stringValue: "" };
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const firestoreBody = {
    fields: {
        orderId: toFirestoreValue(payload.orderId),
      firstName: toFirestoreValue(payload.firstName),
      lastName: toFirestoreValue(payload.lastName),
      phone1: toFirestoreValue(payload.phone1),
      phone2: toFirestoreValue(payload.phone2 || ""),
      address: toFirestoreValue(payload.address),
      city: toFirestoreValue(payload.city),
      region: toFirestoreValue(payload.region),
      notes: toFirestoreValue(payload.notes || ""),
      paymentMethod: toFirestoreValue(payload.paymentMethod),
      subtotal: toFirestoreValue(payload.subtotal),
      shippingCost: toFirestoreValue(payload.shippingCost),
      total: toFirestoreValue(payload.total),
      status: toFirestoreValue(payload.status || "pending"),
      createdAt: toFirestoreValue(payload.createdAt || new Date().toISOString()),
      items: toFirestoreValue(payload.items),
    },
  };

  const response = await axiosInstance.post("/orders", firestoreBody);
  return response.data;
};