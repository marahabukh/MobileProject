import { getCategories } from "@/api/Category";
import BackButton from "@/components/BackButton";
import CategoryCard from "@/components/CategoryCard";
import SearchComponent from "@/components/SearchComponent";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");

  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const numColumns =
    width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;

  const filteredCategories = categories.filter((item) =>
    item.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d25a58" />
      </View>
    );
  }

  if (error instanceof Error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BackButton />

      <FlatList<Category>
        key={`flatlist-${numColumns}`}
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardWrapper,
              { width: `${100 / numColumns}%`, paddingHorizontal: 4 },
            ]}
          >
            <CategoryCard id={item.id} name={item.name} image={item.image} />
          </View>
        )}
        contentContainerStyle={styles.container}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#d25a58"]}
            tintColor="#d25a58"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Categories</Text>

            <Text style={styles.subtitle}>Browse all product categories</Text>

            <SearchComponent
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a category..."
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? "No search results found" : "No categories available"}
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
    marginBottom: 18,
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