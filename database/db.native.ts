import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app.db");

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS hero (
      id INTEGER PRIMARY KEY,
      imageUrl TEXT,
      title TEXT,
      subtitle TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS best_sellers (
      id TEXT PRIMARY KEY,
      title TEXT,
      price REAL,
      image TEXT
    );
  `);
}

export function saveHero(hero: { imageUrl: string; title?: string; subtitle?: string }) {
  db.runSync(
    `INSERT OR REPLACE INTO hero (id, imageUrl, title, subtitle) VALUES (1, ?, ?, ?)`,
    [hero.imageUrl, hero.title ?? "", hero.subtitle ?? ""]
  );
}

export function getHeroLocal() {
  return db.getFirstSync<{ imageUrl: string; title: string; subtitle: string }>(
    `SELECT * FROM hero WHERE id = 1`
  );
}

export function saveCategories(categories: { id: string; name: string; image: string }[]) {
  db.runSync(`DELETE FROM categories`);
  for (const cat of categories) {
    db.runSync(
      `INSERT OR REPLACE INTO categories (id, name, image) VALUES (?, ?, ?)`,
      [cat.id, cat.name, cat.image]
    );
  }
}

export function getCategoriesLocal() {
  return db.getAllSync<{ id: string; name: string; image: string }>(
    `SELECT * FROM categories`
  );
}

export function saveBestSellers(products: { id: string; title: string; price: number; image: string }[]) {
  db.runSync(`DELETE FROM best_sellers`);
  for (const p of products) {
    db.runSync(
      `INSERT OR REPLACE INTO best_sellers (id, title, price, image) VALUES (?, ?, ?, ?)`,
      [p.id, p.title, p.price, p.image]
    );
  }
}

export function getBestSellersLocal() {
  return db.getAllSync<{ id: string; title: string; price: number; image: string }>(
    `SELECT * FROM best_sellers`
  );
}