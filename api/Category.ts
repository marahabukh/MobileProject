import ApiBase from "./ApiBase";

// إضافة كاتيغوري جديد
export const createCategory = async (category: { name: string; image?: string }) => {
  const payload = {
    fields: {
      name: { stringValue: category.name },
      image: { stringValue: category.image || "" },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };
  return await ApiBase.post("/categories", payload);
};

// جلب كل الكاتيغوري
export const getCategories = async () => {
    
  const res = await ApiBase.get("/categories");
  return res.data.documents.map((doc: any) => ({
    id: doc.name.split("/").pop(),
    ...Object.fromEntries(
      Object.entries(doc.fields).map(([key, value]: any) => [key, Object.values(value)[0]])
    ),
  }));

};
export const getProductsByCategory = async (categoryId: string) => {
    console.log("RAW DOCS:");
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
    };
  });

  return allProducts.filter(
    (p: any) => p.categoryId === categoryId
  );
};