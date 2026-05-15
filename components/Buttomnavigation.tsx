import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";

const accentRed = "#d25a58";
const softCard = "#FCFAF7";
const textMuted = "#8F8A83";

export default function BottomNavigation() {
  const { user, isLoading, isAdmin } = useAuth();
  const { count } = useCart();

  const goToProtectedPage = (path: string) => {
    if (isLoading) return;

    if (user) {
      router.push(path as any);
    } else {
      router.push("/Auth/login" as any);
    }
  };

  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)" as any)}
        >
          <Ionicons name="home-outline" size={24} color={textMuted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => goToProtectedPage("/Cart/AddToCartPage")}
        >
          <Ionicons name="cart-outline" size={24} color={textMuted} />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartFab}
          onPress={() => goToProtectedPage("/Cart/AddToCartPage")}
        >
          <Ionicons name="cart" size={28} color="#fff" />
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/(tabs)/admin/Dashboard" as any)}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={textMuted} />
            <Text style={styles.navText}>Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/profile" as any)}
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
    bottom: Platform.OS === "ios" ? 8 : 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    zIndex: 100,
  },

  bottomNav: {
    height: 62,
    borderRadius: 999,
    backgroundColor: softCard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    boxShadow: "0px 10px 20px rgba(0,0,0,0.09)",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    paddingVertical: 6,
  },

  navText: {
    marginTop: 3,
    fontSize: 11,
    color: textMuted,
    fontWeight: "500",
  },

  cartFab: {
    position: "absolute",
    alignSelf: "center",
    top: -26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: accentRed,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 8px 15px rgba(210,90,88,0.35)",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});