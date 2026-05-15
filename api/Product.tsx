import { db } from "./firebase";
import { collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

<<<<<<< Updated upstream
=======
const parseFirestoreString = (field: any): string => {
  if (!field) return "";
  if ("stringValue" in field) return field.stringValue;
  return "";
};

const parseFirestoreNumber = (field: any): number => {
  if (!field) return 0;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("stringValue" in field) return Number(field.stringValue) || 0;
  return 0;
};

const parseFirestoreBoolean = (field: any): boolean => {
  if (!field) return false;
  if ("booleanValue" in field) return field.booleanValue;
  if ("stringValue" in field) return field.stringValue === "true";
  return false;
};

const shuffleArray = (array: any[]) => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
};


>>>>>>> Stashed changes
export const createProduct = async (product: {
  title: string;
  price: number;
  images: string[];
  categoryId: string;
  bestSeller: boolean;
  stock?: number;
}) => {
  if (!product.title || !product.images || product.images.length === 0 || !product.categoryId) {
    throw new Error("Title, at least one Image and Category are required");
  }

  const payload = {
    title: product.title,
    price: Number(product.price),
    image: product.images[0], 
    images: product.images,
    categoryId: product.categoryId,
    bestSeller: !!product.bestSeller,
    stock: Number(product.stock || 0),
    createdAt: new Date().toISOString(),
  };

  return await addDoc(collection(db, "products"), payload);
};

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
export const getProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as any));
};

<<<<<<< Updated upstream
export const deleteProduct = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("SDK Delete Product Error:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: any) => {
  const docRef = doc(db, "products", id);
  const cleanData: any = {};
  if (product.title) cleanData.title = product.title;
  if (product.price !== undefined) cleanData.price = Number(product.price);
  if (product.images && product.images.length > 0) {
    cleanData.images = product.images;
    cleanData.image = product.images[0]; 
  } else if (product.image) {
    cleanData.image = product.image;
  }
  if (product.categoryId) cleanData.categoryId = product.categoryId;
  if (product.bestSeller !== undefined) cleanData.bestSeller = !!product.bestSeller;
  if (product.stock !== undefined) cleanData.stock = Number(product.stock);

  return await updateDoc(docRef, cleanData);
};

=======

export const getRandomProducts = async (
  currentProductId?: string,
  limit: number = 4
) => {
  const allProducts = await getProducts();

  const filteredProducts = currentProductId
    ? allProducts.filter(
        (item: any) => String(item.id) !== String(currentProductId)
      )
    : allProducts;

  return shuffleArray(filteredProducts).slice(0, limit);
};


>>>>>>> Stashed changes
export const getProductById = async (id: string) => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  throw new Error("Product not found");
};

<<<<<<< Updated upstream
export const getRandomProducts = async (currentProductId?: string, limit: number = 4) => {
  const products = await getProducts();
  const filtered = currentProductId 
    ? products.filter(p => p.id !== currentProductId)
    : products;
  
  return filtered.sort(() => 0.5 - Math.random()).slice(0, limit);
};

=======

export const updateCartItem = async (id: string, quantity: number) => {
  if (quantity < 0) throw new Error("Quantity cannot be negative");

  const payload = {
    fields: { quantity: { integerValue: quantity } },
  };

  return await ApiBase.patch(`/cart/${id}`, payload);
};


export const removeFromCart = async (id: string) => {
  return await ApiBase.delete(`/cart/${id}`);
};


>>>>>>> Stashed changes
export const getProductsByCategory = async (categoryId: string) => {
  const products = await getProducts();
  return products.filter(p => p.categoryId === categoryId);
};

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
export const getBestSellers = async () => {
  const products = await getProducts();
  return products.filter(p => p.bestSeller === true);
};