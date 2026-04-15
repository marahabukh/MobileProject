// components/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const accentRed = "#d25a58";

export default function Top({ title = "Boutique" }: { title?: string }) {
  return (
    <View style={styles.header}>
      {/* الدائرة الزرقاء اليسرى - زر رجوع */}
      <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* عنوان Boutique في الوسط */}
      <Text style={styles.title}>{title}</Text>

      {/* الجانب الأيمن */}
      <View style={styles.rightIcons}>
        {/* الدائرة الزرقاء اليمنى → شعار السلة (Cart) */}
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={() => router.push("/Cart/AddToCartPage")}
        >
          <Ionicons name="cart-outline" size={26} color="#ffffff" />
        </TouchableOpacity>

        {/* زر القائمة (Menu) */}
        <TouchableOpacity style={styles.menuBtn}>
          <Feather name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: accentRed,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  circleBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,           // جعلها دائرية أكثر
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});