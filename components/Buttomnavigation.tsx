import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/api/firebase";

const accentRed = "#d25a58";
const softCard = "#FCFAF7";
const textMuted = "#8F8A83";

export default function BottomNavigation() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  const goToProtectedPage = (path: string) => {
    if (!authChecked) return;

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
        </TouchableOpacity>

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
});
