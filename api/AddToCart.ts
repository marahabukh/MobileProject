import axiosInstance from "./ApiBase";

type AddToCartPayload = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
};

export const addToCart = async (payload: AddToCartPayload) => {
  const body = {
    fields: {
      productId: { stringValue: payload.productId },
      title: { stringValue: payload.title },
      price: { integerValue: payload.price },
      image: { stringValue: payload.image },
      quantity: { integerValue: payload.quantity },
      size: { stringValue: payload.size || "" },
    },
  };

  const response = await axiosInstance.post("/cart", body);
  return response.data;
};
export const getCartItems = async () => {
  const res = await axiosInstance.get("/cart");
  if (!res.data.documents) return [];

  return res.data.documents.map((doc: any) => {
    const parsedFields = Object.fromEntries(
      Object.entries(doc.fields || {}).map(([key, value]: any) => [key, Object.values(value)[0]])
    );

    return {
      ...parsedFields,
      id: doc.name.split("/").pop(), // Ensures id is strictly the Firestore Document ID
    };
  });
};

export const removeFromCart = async (id: string) => {
  return await axiosInstance.delete(`/cart/${id}`);
};

export const updateCartItem = async (id: string, quantity: number) => {
  return await axiosInstance.patch(`/cart/${id}?updateMask.fieldPaths=quantity`, {
    fields: {
      quantity: { integerValue: quantity }
    }
  });
};
