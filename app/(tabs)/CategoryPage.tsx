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
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (error instanceof Error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>خطأ: {error.message}</Text>
      </View>
    );
  }

  return (
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
          colors={["#000"]}
          tintColor="#000"
        />
      }
      ListHeaderComponent={
        <>
          <BackButton />
          <Text style={styles.header}>كل الفئات</Text>
         
          <SearchComponent
            value={search}
            onChangeText={setSearch}
            placeholder="...ابحث عن فئة"
          />
        </>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {search ? "لا توجد نتائج للبحث" : "لا توجد فئات حالياً"}
          </Text>
        </View>
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
  },

  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});