// api/hero.ts
import ApiBase from "./ApiBase";

interface HeroInput {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

// إضافة Hero Section جديد
export const createHero = async (hero: HeroInput) => {
  const payload = {
    fields: {
      title: { stringValue: hero.title },
      subtitle: { stringValue: hero.subtitle || "" },
      imageUrl: { stringValue: hero.imageUrl || "" },
      ctaText: { stringValue: hero.ctaText || "" },
      ctaLink: { stringValue: hero.ctaLink || "" },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  return await ApiBase.post("/hero", payload);
};

// جلب آخر Hero Section
export const getHero = async () => {
  const res = await ApiBase.get("/hero");

  if (!res.data.documents || res.data.documents.length === 0) return null;

  // نفترض أن آخر واحد هو آخر إضافة
  const doc = res.data.documents[res.data.documents.length - 1];

  return {
    id: doc.name.split("/").pop(),
    ...Object.fromEntries(
      Object.entries(doc.fields).map(([key, value]: any) => [key, Object.values(value)[0]])
    ),
  };
};