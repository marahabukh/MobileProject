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
  const [categoryName, setCategoryName] = useState("Category");
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
    <View style={styles.screen}>
      <BackButton />

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
<<<<<<< Updated upstream
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{categoryName} Products</Text>

            <Text style={styles.subtitle}>
              Browse products in this category
            </Text>
=======
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
<<<<<<< Updated upstream

  <View style={{ marginTop: 50 }}>
=======
<View style={{ marginTop: 10, marginBottom: 20 }}>
>>>>>>> Stashed changes
  <BackButton />
</View>
        <Text style={styles.header}>منتجات {categoryName}</Text>
>>>>>>> Stashed changes

            <SearchComponent
              value={search}
              onChangeText={setSearch}
              placeholder="Search for products..."
            />

            <SortComponent sortBy={sortBy} setSortBy={setSortBy} />

            <Text style={styles.countText}>
              {filteredProducts.length} products
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No results found or no products in this category
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fcf8fb",
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 32,
  },

  headerContainer: {
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 5,
    marginBottom: 5,
  },

  cardWrapper: {
    marginBottom: 12,
  },

  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    marginBottom: 18,
    fontSize: 14,
    color: "#7a1d4e",
    textAlign: "center",
  },

  countText: {
    fontSize: 13,
    color: "#999",
    textAlign: "left",
    marginHorizontal: 4,
    marginTop: 4,
    marginBottom: 10,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 17,
    color: "#999",
    lineHeight: 28,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
});