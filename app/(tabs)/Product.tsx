import React from "react";
import { View, Text, FlatList, StyleSheet, useWindowDimensions, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../api/Product"; // ← استدعاء من ملف API

export default function ProductsScreen() {
  const { width } = useWindowDimensions();

  const { data: products = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading && !isRefetching) return <Text style={styles.loading}>جاري التحميل...</Text>;
  if (error instanceof Error) return <Text style={styles.error}>خطأ: {error.message}</Text>;

  const numColumns = width > 1000 ? 4 : width > 700 ? 3 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>منتجاتنا</Text>
      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id}
renderItem={({ item }) => (
  <ProductCard
    id={item.id} // هاد مهم جداً
    title={item.title}
    price={item.price}
    image={item.image}
  />
)}       numColumns={numColumns}
        key={`flatlist-${numColumns}`}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: "flex-start", gap: 16, marginBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#000"]} tintColor="#000" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  title: { fontSize: 26, fontWeight: "700", color: "#1a1a1a", marginVertical: 24, textAlign: "center" },
  loading: { flex: 1, textAlign: "center", marginTop: 120, fontSize: 18, color: "#666" },
  error: { flex: 1, textAlign: "center", marginTop: 120, fontSize: 17, color: "red" },
})