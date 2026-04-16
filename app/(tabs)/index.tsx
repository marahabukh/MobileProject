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
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { getCategories } from "@/api/Category";
import { getBestSellers } from "@/api/Product";
import { getHero } from "@/api/HereSection";
import CategoryCard from "@/components/CategoryCard";
import BottomNavigation from "@/components/Buttomnavigation";   

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       
        {heroLoading ? (
          <View style={[styles.hero, { justifyContent: "center" }]}>
            <Text style={styles.heroTitle}>Loading...</Text>
          </View>
        ) : hero && hero.imageUrl ? (
      <ImageBackground
  source={require("../../assets/images/hero.png")}
  style={styles.hero}
  resizeMode="cover"
>
  <View style={styles.heroOverlay}>
    <Text style={styles.heroTitle}>Welcome 👋</Text>
  </View>
</ImageBackground>
        ) : (
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome 👋</Text>
          </View>
        )}

        
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
  contentContainerStyle={{ paddingHorizontal: 16 }}
  renderItem={({ item }) => (
    <View
      style={{
        width: cardWidth,
        marginRight: 6, 
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
          
    
       
        <View style={{ height: 20 }} />
      </ScrollView>

    
      <BottomNavigation />
    </View>
  );
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 110,   
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