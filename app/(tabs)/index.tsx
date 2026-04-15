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
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getCategories } from "@/api/Category";
import { getBestSellers } from "@/api/Product";
import { getHero } from "@/api/HereSection";
import CategoryCard from "@/components/CategoryCard";
import BottomNavigation from "@/components/Buttomnavigation";   // ← صححنا الاسم

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.4;
  const cardMargin = width * 0.03;

  // 🔹 Queries
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
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔥 Hero Section */}
        {heroLoading ? (
          <View style={[styles.hero, { justifyContent: "center" }]}>
            <Text style={styles.heroTitle}>Loading...</Text>
          </View>
        ) : hero && hero.imageUrl ? (
          <ImageBackground
            source={{ uri: hero.imageUrl }}
            style={styles.hero}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{hero.title}</Text>
              {hero.subtitle && (
                <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
              )}
              {hero.ctaText && hero.ctaLink && (
                <TouchableOpacity
                  onPress={() => router.push(hero.ctaLink)}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>{hero.ctaText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome 👋</Text>
          </View>
        )}

        {/* 🗂 Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push("/CategoryPage")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth, marginRight: cardMargin, marginTop: 15 }}>
              <CategoryCard id={item.id} name={item.name} image={item.image} />
            </View>
          )}
        />

        {/* 🏆 Best Sellers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <TouchableOpacity onPress={() => router.push("/productdetails/")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={bestSellers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth, marginRight: cardMargin, marginTop: 15 }}>
              <CategoryCard id={item.id} name={item.title} image={item.image} />
            </View>
          )}
        />

        {/* مسافة إضافية في النهاية */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation - خارج الـ ScrollView */}
      <BottomNavigation />
    </View>
  );
}

// ====================
// 🔹 Styles
// ====================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 110,   // مسافة كافية تحت آخر محتوى
  },

  hero: {
    width: "100%",
    height: 250,
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

  heroSubtitle: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
  },

  ctaButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  ctaText: {
    color: "#d25a58",
    fontWeight: "600",
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