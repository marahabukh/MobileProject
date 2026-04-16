import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CategoryCard({ id, name, image }: any) {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            image && image.trim() !== ""
              ? image
              : "https://placehold.co/300x300/eeeeee/999999?text=No+Image",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text numberOfLines={2} style={styles.title}>
        {name}
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/CategoryById/${id}`)}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>عرض الفئة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16, // 👈 نفس ProductCard
    marginBottom: 20,

    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    flexDirection: "column",
  },

  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#eee",
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
    textAlign: "right",
    lineHeight: 20,
  },

  spacer: {
    flex: 1,
    minHeight: 12,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#d25a58",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});