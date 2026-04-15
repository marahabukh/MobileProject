import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function OrderSuccessPage() {
  const { orderId, total } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 900;

  return (
    <View style={styles.page}>
      <BackButton />
      <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={44} color="#111827" />
          </View>
        </View>

        <Text style={styles.title}>تم تأكيد الطلب!</Text>
        <Text style={styles.subtitle}>تم إرسال طلبك بنجاح.</Text>

        <View style={styles.card}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>رقم الطلب</Text>
            <Text style={styles.orderId}>#{String(orderId || "000000")}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>₪{String(total || "0.00")}</Text>
            <Text style={styles.totalLabel}>المبلغ الإجمالي</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/Cart/AddToCartPage")}
        >
          <Text style={styles.primaryButtonText}>تتبع الطلب</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.secondaryButtonText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FCFAF7",
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
    fontSize: 34,
    fontWeight: "300",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#9ca3af",
    marginBottom: 28,
    textAlign: "center",
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
    flexDirection: "row-reverse",
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
    color: " #333333",
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