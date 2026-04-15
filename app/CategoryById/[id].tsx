import { getProductsByCategory } from "@/api/Category";
import BackButton from "@/components/BackButton";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import ProductCard from "../../components/ProductCard";

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [products, setProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>("الفئة");
  const [loading, setLoading] = useState(true);

  const numColumns =
    width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        if (id) {
          const data = await getProductsByCategory(id as string);
          console.log("Products for category:", data);
          setProducts(data);
        }

        if (name) {
          setCategoryName(name as string);
        }
      } catch (error) {
        console.log("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, name]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>لا توجد منتجات في هذه الفئة</Text>
      </View>
    );
  }

  return (
    <FlatList
      key={numColumns}
      data={products}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <View
          style={[
            styles.cardWrapper,
            { width: `${100 / numColumns}%`, paddingHorizontal: 4 },
          ]}
        >
          <ProductCard product={item} />
        </View>
      )}
      contentContainerStyle={styles.container}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <BackButton />
          <Text style={styles.header}>منتجات {categoryName}</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row-reverse",
  },
  cardWrapper: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
    writingDirection: "rtl",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    writingDirection: "rtl",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});