import { getCategories } from "@/api/Category";
import { getHero } from "@/api/HereSection";
import { getBestSellers } from "@/api/Product";
import {
  getBestSellersLocal,
  getCategoriesLocal,
  getHeroLocal,
  initDatabase,
  saveBestSellers,
  saveCategories,
  saveHero,
} from "@/database/db";
import { useEffect, useState } from "react";

export function useOfflineData() {
  const [hero, setHero] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    async function init() {
      initDatabase();

      const localHero = getHeroLocal();
      const localCats = getCategoriesLocal();
      const localBest = getBestSellersLocal();

      if (localHero) setHero(localHero);
      if (localCats.length) setCategories(localCats);
      if (localBest.length) setBestSellers(localBest);
      setHeroLoading(false);

      try {
        const [h, c, b] = await Promise.allSettled([
          getHero(),
          getCategories(),
          getBestSellers(),
        ]);

        if (h.status === "fulfilled" && h.value) {
          saveHero(h.value);
          setHero(h.value);
        }

        if (c.status === "fulfilled" && c.value?.length) {
          saveCategories(c.value);
          setCategories(c.value);
        }

        if (b.status === "fulfilled" && b.value?.length) {
          saveBestSellers(b.value);
          setBestSellers(b.value);
        }
      } catch (e) {
        console.log("Offline mode");
      }
    }

    init();
  }, []);

  return { hero, categories, bestSellers, heroLoading };
}