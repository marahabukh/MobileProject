import { getCartItems, removeFromCart } from "@/api/AddToCart";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function OrderSuccessPage() {
  const { orderId, total } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();

  const [clearingCart, setClearingCart] = useState(false);

  const isLargeScreen = width >= 900;

  useEffect(() => {
    const clearCart = async () => {
      try {
        setClearingCart(true);

        const cartItems = await getCartItems();

        if (Array.isArray(cartItems) && cartItems.length > 0) {
          await Promise.all(
            cartItems.map((item: any) => removeFromCart(String(item.id)))
          );
        }

        queryClient.setQueryData(["cart"], []);
        await queryClient.invalidateQueries({ queryKey: ["cart"] });
      } catch (error) {
        console.log("Clear cart after order error:", error);
      } finally {
        setClearingCart(false);
      }
    };

    clearCart();
  }, [queryClient]);

  return (
    <View style={styles.page}>
      <BackButton />

      <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={44} color="#111827" />
          </View>
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>Your order has been placed successfully.</Text>

        {clearingCart ? (
          <View style={styles.clearingBox}>
            <ActivityIndicator size="small" color="#d25a58" />
            <Text style={styles.clearingText}>Clearing your cart...</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.orderId}>#{String(orderId || "000000")}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₪{String(total || "0.00")}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/Cart/AddToCartPage")}
        >
          <Text style={styles.primaryButtonText}>View Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fcf8fb",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  container: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
  },

  containerLarge: {
    maxWidth: 620,
  },

  iconWrapper: {
    marginBottom: 24,
  },

  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ececec",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    marginBottom: 18,
    fontSize: 14,
    color: "#7a1d4e",
    textAlign: "center",
  },

  clearingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  clearingText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 26,
    marginBottom: 22,
  },

  infoBlock: {
    alignItems: "flex-start",
  },

  label: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 1,
  },

  orderId: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
  },

  divider: {
    height: 1,
    backgroundColor: "#ececec",
    marginVertical: 22,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 18,
    color: "#9ca3af",
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333333",
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#d25a58",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 18,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
});