import { getProductsByCategory } from "@/api/Category";
import BackButton from "@/components/BackButton";
import SearchComponent from "@/components/SearchComponent";
import SortComponent, { SortOption } from "@/components/SortComponent";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import ProductCard from "../../components/ProductCard";

interface Product {
  id: string;
  name: string;
  title: string;
  price: number | string;
  image: string;
  rating?: number;
  categoryId?: string;
}

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("الفئة");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const numColumns =
    width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;

  const getPrice = (price: number | string) => {
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      const cleaned = price.replace(/[^0-9.]/g, "");
      return Number(cleaned) || 0;
    }
    return 0;
  };

  const fetchProducts = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      if (id) {
        const data = await getProductsByCategory(String(id));

        const normalizedData = (data || []).map((item: Product) => ({
          ...item,
          name: item.name || item.title || "",
          title: item.title || item.name || "",
          price: getPrice(item.price),
        }));

        setProducts(normalizedData);
      }

      if (name) {
        setCategoryName(String(name));
      }
    } catch (error) {
      console.log("Error fetching category products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id, name]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      result = result.filter((item) =>
        (item.name || item.title || "").toLowerCase().includes(searchText)
      );
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => getPrice(a.price) - getPrice(b.price));
        break;

      case "price_desc":
        result.sort((a, b) => getPrice(b.price) - getPrice(a.price));
        break;

      case "default":
      default:
        break;
    }

    return result;
  }, [products, search, sortBy]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d25a58" />
      </View>
    );
  }

  return (
    <FlatList<Product>
      key={`flatlist-${numColumns}`}
      data={filteredProducts}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <View
          style={[
            styles.cardWrapper,
            { width: `${100 / numColumns}%`, paddingHorizontal: 4 },
          ]}
        >
          <ProductCard
            product={{
              ...item,
              price: getPrice(item.price),
            }}
          />
        </View>
      )}
      contentContainerStyle={styles.container}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchProducts(true)}
          colors={["#d25a58"]}
          tintColor="#d25a58"
        />
      }
      ListHeaderComponent={
        <>
          <BackButton />
          <Text style={styles.header}>منتجات {categoryName}</Text>

          <SearchComponent
            value={search}
            onChangeText={setSearch}
            placeholder="...ابحث عن منتج"
          />

          <SortComponent sortBy={sortBy} setSortBy={setSortBy} />

          <Text style={styles.countText}>
            {filteredProducts.length} منتج
          </Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {filteredProducts.length === 0
              ? "لا يوجد نتائج أو لا يوجد منتجات في هذه الفئة"
              : ""}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row-reverse",
  },
  cardWrapper: {
    marginBottom: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  countText: {
    fontSize: 13,
    color: "#999",
    textAlign: "right",
    marginHorizontal: 8,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 17,
    color: "#999",
    marginTop: 80,
    lineHeight: 28,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});