// components/BottomNavigation.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const accentRed = "#d25a58";
const softCard = "#FCFAF7";
const textMuted = "#8F8A83";

export default function BottomNavigation() {
  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        
        {/* Home */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="home-outline" size={24} color={textMuted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/search")} // غيّر المسار لاحقًا حسب صفحتك
        >
          <Ionicons name="search-outline" size={24} color={textMuted} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>

        {/* Cart - الزر البارز في الوسط */}
        <TouchableOpacity 
          style={styles.cartFab} 
          onPress={() => router.push("/Cart/AddToCartPage")}
        >
          <Ionicons name="cart" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push("/Auth/login")}
        >
          <Ionicons name="person-outline" size={24} color={textMuted} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 8 : 12,   // أنزله أكثر للأسفل
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    zIndex: 100,
  },

  bottomNav: {
    height: 62,                    // أصغر من قبل (كان 76)
    borderRadius: 999,             // أكثر سلاسة (شبه دائري)
    backgroundColor: softCard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    paddingVertical: 6,
  },

  navText: {
    marginTop: 3,
    fontSize: 11,                  // أصغر
    color: textMuted,
    fontWeight: "500",
  },

  cartFab: {
    position: "absolute",
    alignSelf: "center",
    top: -26,                      // رفع الزر قليلاً للخارج
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: accentRed,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: accentRed,
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});