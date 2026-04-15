import ApiBase from "./ApiBase";

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

  return res.data.documents.map((doc: any) => ({
    id: doc.name.split("/").pop(),
    ...Object.fromEntries(
      Object.entries(doc.fields).map(([key, value]: any) => [
        key,
        Object.values(value)[0],
      ])
    ),
  }));
};

// ------------------------
// جلب منتج واحد حسب ID
// ------------------------
export const getProductById = async (id: string) => {
  const res = await ApiBase.get(`/products/${id}`);
  const doc = res.data;

  return {
    id: doc.name.split("/").pop(),
    ...Object.fromEntries(
      Object.entries(doc.fields).map(([key, value]: any) => [
        key,
        Object.values(value)[0],
      ])
    ),
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
  const res = await ApiBase.get("/products");
  if (!res.data.documents) return [];

  const allProducts = res.data.documents.map((doc: any) => {
    const fields = doc.fields;
    return {
      id: doc.name.split("/").pop(),
      title: fields.title?.stringValue,
      price: fields.price?.doubleValue || fields.price?.integerValue,
      image: fields.image?.stringValue,
      categoryId: fields.categoryId?.stringValue,
      bestSeller: fields.bestSeller?.booleanValue || false,
    };
  });

  return allProducts.filter((p: any) => p.categoryId === categoryId);
};

// ------------------------
// جلب المنتجات Best Seller
// ------------------------
export const getBestSellers = async () => {
  const products = await getProducts();
  return products.filter((p: any) => p.bestSeller === true);
};