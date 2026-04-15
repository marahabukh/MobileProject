import ApiBase from "./ApiBase";

// ------------------------
// Helpers لتحويل قيم Firestore
// ------------------------
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

// ------------------------
// إنشاء منتج جديد
// ------------------------
export const createProduct = async (product: {
  title: string;
  price: number;
  image: string;
  categoryId: string;
  bestSeller: boolean;
}) => {
  if (!product.title || !product.image || !product.categoryId) {
    throw new Error("Title, Image and Category are required");
  }

  if (isNaN(product.price) || product.price <= 0) {
    throw new Error("Price must be a positive number");
  }

  const payload = {
    fields: {
      title: { stringValue: product.title },
      price: { doubleValue: product.price },
      image: { stringValue: product.image },
      categoryId: { stringValue: product.categoryId },
      bestSeller: { booleanValue: product.bestSeller },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  return await ApiBase.post("/products", payload);
};

// ------------------------
// جلب كل المنتجات
// ------------------------
export const getProducts = async () => {
  const res = await ApiBase.get("/products");

  if (!res.data.documents) return [];

  return res.data.documents.map((doc: any) => {
    const fields = doc.fields || {};

    return {
      id: doc.name.split("/").pop(),
      title:
        parseFirestoreString(fields.title) ||
        parseFirestoreString(fields.name),
      name:
        parseFirestoreString(fields.name) ||
        parseFirestoreString(fields.title),
      price: parseFirestoreNumber(fields.price),
      image:
        parseFirestoreString(fields.image) ||
        parseFirestoreString(fields.imageURL),
      imageURL: parseFirestoreString(fields.imageURL),
      categoryId: parseFirestoreString(fields.categoryId),
      bestSeller: parseFirestoreBoolean(fields.bestSeller),
      rating: parseFirestoreNumber(fields.rating),
      sizes: fields.sizes?.arrayValue?.values
        ? fields.sizes.arrayValue.values.map((item: any) => item.stringValue)
        : [],
      createdAt: fields.createdAt?.timestampValue || "",
    };
  });
};

// ------------------------
// جلب منتجات عشوائية
// ------------------------
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

// ------------------------
// جلب منتج واحد حسب ID
// ------------------------
export const getProductById = async (id: string) => {
  const res = await ApiBase.get(`/products/${id}`);
  const doc = res.data;
  const fields = doc.fields || {};

  return {
    id: doc.name.split("/").pop(),
    title:
      parseFirestoreString(fields.title) ||
      parseFirestoreString(fields.name),
    name:
      parseFirestoreString(fields.name) ||
      parseFirestoreString(fields.title),
    price: parseFirestoreNumber(fields.price),
    image:
      parseFirestoreString(fields.image) ||
      parseFirestoreString(fields.imageURL),
    imageURL: parseFirestoreString(fields.imageURL),
    categoryId: parseFirestoreString(fields.categoryId),
    bestSeller: parseFirestoreBoolean(fields.bestSeller),
    rating: parseFirestoreNumber(fields.rating),
    sizes: fields.sizes?.arrayValue?.values
      ? fields.sizes.arrayValue.values.map((item: any) => item.stringValue)
      : [],
    createdAt: fields.createdAt?.timestampValue || "",
  };
};

// ------------------------
// تحديث كمية عنصر في العربة
// ------------------------
export const updateCartItem = async (id: string, quantity: number) => {
  if (quantity < 0) throw new Error("Quantity cannot be negative");

  const payload = {
    fields: { quantity: { integerValue: quantity } },
  };

  return await ApiBase.patch(`/cart/${id}`, payload);
};

// ------------------------
// حذف عنصر من العربة
// ------------------------
export const removeFromCart = async (id: string) => {
  return await ApiBase.delete(`/cart/${id}`);
};

// ------------------------
// جلب المنتجات حسب الكاتيغوري
// ------------------------
export const getProductsByCategory = async (categoryId: string) => {
  const products = await getProducts();

  return products.filter((p: any) => String(p.categoryId) === String(categoryId));
};

// ------------------------
// جلب المنتجات Best Seller
// ------------------------
export const getBestSellers = async () => {
  const products = await getProducts();

  return products.filter((p: any) => p.bestSeller === true);
};