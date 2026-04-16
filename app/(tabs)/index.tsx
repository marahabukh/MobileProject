import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import BottomNavigation from "@/components/Buttomnavigation";

import { getCategories } from "@/api/Category";
import { getBestSellers } from "@/api/Product";
import { getHero } from "@/api/HereSection";

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const heroHeight = height * 0.32; // responsive height
  const cardWidth = width * 0.4;
  const cardMargin = width * 0.03;

  const { data: hero, isLoading: heroLoading } = useQuery({
    queryKey: ["hero"],
    queryFn: getHero,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: bestSellers = [] } = useQuery({
    queryKey: ["bestSellers"],
    queryFn: getBestSellers,
  });

  return (
    <View style={styles.mainContainer}>
      {/* Status Bar فوق الصورة */}
      <StatusBar style="light" translucent />

      {/* Safe Area فقط من الأسفل */}
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* HERO SECTION */}
          {heroLoading ? (
            <View style={[styles.hero, { height: heroHeight }]}>
              <Text style={styles.heroTitle}>Loading...</Text>
            </View>
          ) : (
            <ImageBackground
              source={require("../../assets/images/hero.png")}
              style={[styles.hero, { height: heroHeight }]}
              resizeMode="cover"
            >
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>Welcome 👋</Text>
              </View>
            </ImageBackground>
          )}

          {/* CATEGORIES */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push("/CategoryPage")}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <View
                style={{
                  width: cardWidth,
                  marginRight: cardMargin,
                  marginTop: 15,
                }}
              >
                <CategoryCard
                  id={item.id}
                  name={item.name}
                  image={item.image}
                />
              </View>
            )}
          />

          {/* BEST SELLERS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <TouchableOpacity
              onPress={() => router.push("/productdetails/")}
            >
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <View
                style={{
                  width: cardWidth,
                  marginRight: 10,
                  marginTop: 15,
                }}
              >
                <ProductCard
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.image}
                />
              </View>
            )}
          />
        </ScrollView>

        {/* Bottom Navigation ثابت */}
        <BottomNavigation />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  safeArea: {
    flex: 1,
  },

  hero: {
    width: "100%",
    justifyContent: "flex-end",
  },

  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  seeAll: {
    fontSize: 14,
    color: "#d25a58",
    fontWeight: "600",
  },
});