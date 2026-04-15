// pages/admin/add-hero.tsx
import React, { useState, FormEvent } from "react";
import { createHero } from "@/api/HereSection";

export default function AddHeroPage() {
  const [hero, setHero] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHero({ ...hero, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createHero(hero);
      alert("Hero Section Added!");
      setHero({ title: "", subtitle: "", imageUrl: "", ctaText: "", ctaLink: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "auto" }}>
      <input name="title" placeholder="Title" value={hero.title} onChange={handleChange} required />
      <input name="subtitle" placeholder="Subtitle" value={hero.subtitle} onChange={handleChange} />
      <input name="imageUrl" placeholder="Image URL" value={hero.imageUrl} onChange={handleChange} />
      <input name="ctaText" placeholder="CTA Text" value={hero.ctaText} onChange={handleChange} />
      <input name="ctaLink" placeholder="CTA Link" value={hero.ctaLink} onChange={handleChange} />
      <button type="submit">Add Hero Section</button>
    </form>
  );
}