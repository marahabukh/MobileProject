import { router } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategoryCard({ id, name, image }: any) {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: image && image.trim() !== ""
            ? image
            : "https://placehold.co/300x300/eeeeee/999999?text=No+Image",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text numberOfLines={2} style={styles.name}>
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
    borderRadius: 16,
    padding: 12,
    margin: 15,              
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: "column",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
    textAlign: "center",
  },
  spacer: { flex: 1 },
  button: {
    backgroundColor: "#d25a58",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 15,
    writingDirection: "rtl",
  },
});