import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
};

type Props = {
  product?: Product;
  id?: string;
  title?: string;
  price?: number;
  image?: string;
};

export default function ProductCard({ product, id, title, price, image }: Props) {
  const finalProduct = product ?? {
    id: id!,
    title: title!,
    price: price!,
    image: image!,
  };

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: finalProduct.image || "https://via.placeholder.com/300x300?text=No+Image",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text numberOfLines={2} style={styles.title}>
        {finalProduct.title}
      </Text>
      <Text style={styles.price}>₪{finalProduct.price}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/productdetails/${finalProduct.id}`)}
      >
        <Text style={styles.buttonText}>عرض التفاصيل</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
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
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d25a58",
    textAlign: "right",
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