import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
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

export default function ProductCard({
  product,
  id,
  title,
  price,
  image,
}: Props) {
  const { width } = useWindowDimensions();

  const finalProduct = product ?? {
    id: id!,
    title: title!,
    price: price!,
    image: image!,
  };

  const numColumns = width > 1000 ? 4 : width > 700 ? 3 : 2;

  let cardWidth =
    (width - 32 - 16 * (numColumns - 1)) / numColumns;

  if (width > 700) {
    cardWidth = Math.min(cardWidth, 260);
  }

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Image
        source={{
          uri:
            finalProduct.image ||
            "https://via.placeholder.com/300x300?text=No+Image",
        }}
        style={styles.image}
      />

      <Text numberOfLines={2} style={styles.title}>
        {finalProduct.title}
      </Text>

      <Text style={styles.price}>
        ₪{finalProduct.price}
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push(`/productdetails/${finalProduct.id}`)
        }
      >
        <Text style={styles.buttonText}>
          عرض التفاصيل
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
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
    height: 180,
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
