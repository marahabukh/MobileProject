import ApiBase from "./ApiBase";
export const createHero = async (hero: {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}) => {
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
}
export const getHero = async () => {
  const res = await ApiBase.get("/hero");

  if (!res.data.documents || res.data.documents.length === 0) return null;

  const doc = res.data.documents[res.data.documents.length - 1];

  const f = doc.fields;

  return {
    id: doc.name.split("/").pop(),
    title: f.title?.stringValue || "",
    subtitle: f.subtitle?.stringValue || "",
    imageUrl: f.imageUrl?.stringValue || "",
    ctaText: f.ctaText?.stringValue || "",
    ctaLink: f.ctaLink?.stringValue || "",
  };
};