import { getCartItems, removeFromCart, updateCartItem } from "@/api/AddToCart";
import BackButton from "@/components/BackButton";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const accentRed = "#d25a58";
const softBg = "#ffffff";
const softCard = "#ffffff";
const textDark = "#050404";
const textMuted = "#9E978F";
const greenFree = "#2E7D32";

export default function AddtoCartpage() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1000;
  const queryClient = useQueryClient();

  // 1. Fetch Cart Items
  const {
    data: cartItems = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    staleTime: 0,
    refetchInterval: 5000, // poll every 5 seconds while tab is open
  });

  // Refetch immediately every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 2. Update Quantity Mutation
  const mutationUpdate = useMutation({
    mutationFn: ({ id, quantity }: { id: string | number; quantity: number }) =>
      updateCartItem(String(id), quantity),

    onMutate: async (newVariable) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) =>
        old?.map((item: any) =>
          String(item.id) === String(newVariable.id)
            ? { ...item, quantity: newVariable.quantity }
            : item
        )
      );
      return { previousCart };
    },

    onError: (err, newVariable, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      Alert.alert("خطأ", "فشل تحديث الكمية");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // 3. DELETE Mutation - FIXED
  const mutationDelete = useMutation({
    mutationFn: (id: string | number) => removeFromCart(String(id)),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistic delete with better safety
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((item: any) => String(item.id) !== String(deletedId));
      });

      return { previousCart };
    },

    onSuccess: () => {
      console.log("Item deleted successfully from server");
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
      Alert.alert("خطأ", "لم يتمكن النظام من حذف المنتج");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const increaseQty = (id: string | number, qty: any) => {
    mutationUpdate.mutate({ id, quantity: Number(qty || 0) + 1 });
  };

  const decreaseQty = (id: string | number, qty: any) => {
    const newQty = Math.max(1, Number(qty || 1) - 1);
    mutationUpdate.mutate({ id, quantity: newQty });
  };

  const removeItem = (id: string | number) => {
    mutationDelete.mutate(id as string);
  };

  // Calculations
  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((sum: number, item: any) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0)
    : 0;

  const discount = subtotal * 0.2;
  const total = subtotal - discount;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accentRed} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
          <BackButton />
          <Text style={styles.heroTitle}>
            Your <Text style={styles.heroTitleAccent}>Cart</Text>.
          </Text>

          <View
            style={[
              styles.contentWrapper,
              isLargeScreen ? styles.contentWrapperLarge : styles.contentWrapperMobile,
            ]}
          >
            {/* PRODUCT LIST SECTION */}
            <View style={[styles.cartSection, isLargeScreen && styles.cartSectionLarge]}>
              {cartItems.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="cart-outline" size={60} color={textMuted} />
                  <Text style={styles.emptyText}>سلة المشتريات فارغة حالياً</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => router.push("/")}>
                    <Text style={styles.retryText}>تسوق الآن</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                cartItems.map((item: any) => (
                  <View key={item.id} style={styles.mobileCard}>
                    <View style={styles.mobileCardRow}>
                      <Image source={{ uri: item.image }} style={styles.mobileImage} />

                      <View style={styles.mobileContent}>
                        <View style={styles.mobileTopLine}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mobileTitle} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text style={styles.mobileMeta}>
                              {item.size ? `SIZE: ${item.size}` : "PREMIUM SELECTION"}
                            </Text>
                            <Text style={styles.mobilePinkPrice}>
                              ₪{Number(item.price || 0).toFixed(2)}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteBtnMobile}
                            onPress={() => removeItem(item.id)}
                          >
                            <Feather name="trash-2" size={18} color={accentRed} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.mobileBottomRow}>
                          <View style={styles.qtyCircleWrap}>
                            <TouchableOpacity
                              style={styles.qtyCircle}
                              onPress={() => decreaseQty(item.id, item.quantity)}
                            >
                              <Text style={styles.qtyCircleText}>−</Text>
                            </TouchableOpacity>

                            <Text style={styles.qtyValue}>{item.quantity || 1}</Text>

                            <TouchableOpacity
                              style={styles.qtyCircle}
                              onPress={() => increaseQty(item.id, item.quantity)}
                            >
                              <Text style={styles.qtyCircleText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* SUMMARY SECTION */}
            {cartItems.length > 0 && (
              <View style={[styles.summarySection, isLargeScreen && styles.summarySectionLarge]}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>ملخص الطلب</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>المجموع</Text>
                    <Text style={styles.summaryValue}>₪{subtotal.toFixed(2)}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>التوصيل</Text>
                    <Text style={styles.shippingFree}>مجاني</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>الخصم (20%)</Text>
                    <Text style={styles.summaryDiscount}>-₪{discount.toFixed(2)}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelBold}>الإجمالي</Text>
                    <Text style={styles.summaryValueBold}>₪{total.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => router.push("/Checkout/CheckoutForm")}
                  >
                    <Text style={styles.checkoutBtnText}>الدفع الآن</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... your styles remain unchanged
  screen: { flex: 1, backgroundColor: softBg },
  page: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  containerLarge: { maxWidth: 1100, width: "100%", alignSelf: "center" },
  heroTitle: { fontSize: 32, fontWeight: "300", color: textDark, marginBottom: 20, textAlign: 'right' },
  heroTitleAccent: { color: accentRed, fontWeight: "800" },
  contentWrapper: { gap: 20 },
  contentWrapperMobile: { flexDirection: "column" },
  contentWrapperLarge: { flexDirection: "row", alignItems: "flex-start" },
  cartSection: { width: "100%" },
  cartSectionLarge: { flex: 1.6 },
  mobileCard: {
    backgroundColor: softCard,
    borderRadius: 24,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f5f5f5",
  },
  mobileCardRow: { flexDirection: "row-reverse", alignItems: "center" },
  mobileImage: { width: 85, height: 85, borderRadius: 18, backgroundColor: "#f9f9f9", marginLeft: 15 },
  mobileContent: { flex: 1 },
  mobileTopLine: { flexDirection: "row-reverse", justifyContent: "space-between" },
  mobileTitle: { fontSize: 17, fontWeight: "700", color: textDark, textAlign: 'right' },
  mobileMeta: { fontSize: 11, color: textMuted, textAlign: 'right', marginTop: 2 },
  mobilePinkPrice: { fontSize: 18, color: accentRed, fontWeight: "700", textAlign: 'right', marginTop: 5 },
  deleteBtnMobile: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFF1F0", justifyContent: "center", alignItems: "center" },
  mobileBottomRow: { marginTop: 10, alignItems: 'flex-end' },
  qtyCircleWrap: { flexDirection: "row", alignItems: "center", gap: 15, backgroundColor: "#F7F7F7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50 },
  qtyCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 1 },
  qtyCircleText: { fontSize: 18, fontWeight: "700" },
  qtyValue: { fontSize: 16, fontWeight: "700", minWidth: 20, textAlign: "center" },
  summarySection: { width: "100%" },
  summarySectionLarge: { width: 350, marginLeft: 20 },
  summaryCard: { backgroundColor: softCard, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, elevation: 3, borderWidth: 1, borderColor: "#f5f5f5" },
  summaryTitle: { fontSize: 19, fontWeight: "800", color: textDark, marginBottom: 15, textAlign: 'right' },
  summaryRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: textMuted },
  summaryValue: { fontSize: 14, fontWeight: "700" },
  summaryDiscount: { fontSize: 14, color: accentRed, fontWeight: "700" },
  shippingFree: { fontSize: 14, color: greenFree, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  summaryLabelBold: { fontSize: 17, fontWeight: "800" },
  summaryValueBold: { fontSize: 19, fontWeight: "800", color: accentRed },
  checkoutBtn: { marginTop: 15, backgroundColor: accentRed, borderRadius: 15, paddingVertical: 16, alignItems: "center" },
  checkoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  emptyBox: { padding: 50, alignItems: 'center' },
  emptyText: { color: textMuted, fontSize: 16, marginTop: 10, marginBottom: 20 },
  retryBtn: { backgroundColor: accentRed, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});