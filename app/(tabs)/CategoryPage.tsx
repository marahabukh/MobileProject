import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import CategoryCard from "../../components/CategoryCard";
import { getCategories } from "@/api/Category";

export default function CategoriesScreen() {
  const { width } = useWindowDimensions();

  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const numColumns = width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;

  if (isLoading && !isRefetching) {
    return <Text style={styles.loading}>جاري التحميل...</Text>;
  }

  if (error instanceof Error) {
    return <Text style={styles.error}>خطأ: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>كل الكاتيغوري</Text>

      <FlatList
        key={`flatlist-${numColumns}`}
        data={categories}
        keyExtractor={(item: any) => item.id.toString()}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardWrapper,
              { width: `${100 / numColumns}%` },
            ]}
          >
            <View style={styles.cardInner}>
              <CategoryCard
                id={item.id}
                name={item.name}
                image={item.image}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#000"]}
            tintColor="#000"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد فئات حالياً</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginVertical: 24,
    textAlign: "center",
    writingDirection: "rtl",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row-reverse",
  },
  cardWrapper: {
    marginBottom: 12,
  },
  cardInner: {
    paddingHorizontal: 6,
  },
  loading: {
    flex: 1,
    textAlign: "center",
    marginTop: 120,
    fontSize: 18,
    color: "#666",
    writingDirection: "rtl",
  },
  error: {
    flex: 1,
    textAlign: "center",
    marginTop: 120,
    fontSize: 17,
    color: "red",
    writingDirection: "rtl",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
    writingDirection: "rtl",
  },
});