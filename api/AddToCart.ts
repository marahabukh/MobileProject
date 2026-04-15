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
  if (!payload.productId || !payload.title || !payload.price || !payload.quantity) {
    throw new Error("Missing required fields");
  }
  if (payload.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  
  const existingItemsRes = await axiosInstance.get("/cart");
  const existingItems = existingItemsRes.data.documents || [];
  const existingItem = existingItems.find((item: any) => {
    const fields = item.fields || {};
    return (
      fields.productId?.stringValue === payload.productId &&
      fields.size?.stringValue === payload.size
    );
  }
  );
  if (existingItem) {
    const existingQuantity = parseInt(existingItem.fields.quantity.integerValue, 10) || 0;
    const newQuantity = existingQuantity + payload.quantity;
    return await updateCartItem(existingItem.name.split("/").pop(), newQuantity);
  }     

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
