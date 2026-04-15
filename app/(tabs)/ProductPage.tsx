import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import SortComponent, { SortOption } from "@/components/SortComponent";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/api/Product";
import SearchComponent from "@/components/SearchComponent";

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [search, setSearch] = useState("");

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const searchText = search.trim().toLowerCase();

      result = result.filter((item: any) =>
        (item.title || item.name || "").toLowerCase().includes(searchText)
      );
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a: any, b: any) => Number(a.price) - Number(b.price));
        break;

      case "price_desc":
        result.sort((a: any, b: any) => Number(b.price) - Number(a.price));
        break;

      case "default":
      default:
        break;
    }

    return result;
  }, [products, search, sortBy]);

  if (isLoading && !isRefetching) {
    return <Text style={styles.loading}>جاري التحميل...</Text>;
  }

  if (error instanceof Error) {
    return <Text style={styles.error}>error {error.message}</Text>;
  }

  const numColumns = width > 1000 ? 4 : width > 700 ? 3 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>منتجاتنا </Text>

      <SearchComponent
        value={search}
        onChangeText={setSearch}
        placeholder="...ابحث عن منتج"
      />

      <SortComponent sortBy={sortBy} setSortBy={setSortBy} />

      <FlatList
        data={filteredAndSortedProducts}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            title={item.title}
            price={item.price}
            image={item.image}
          />
        )}
        numColumns={numColumns}
        key={`flatlist-${numColumns}`}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#7a1d4e"]}
            tintColor="#7a1d4e"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf8fb",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 18,
    textAlign: "center",
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    textAlign: "center",
    marginTop: 120,
    fontSize: 18,
    color: "#666",
  },
  error: {
    flex: 1,
    textAlign: "center",
    marginTop: 120,
    fontSize: 17,
    color: "red",
  },
});