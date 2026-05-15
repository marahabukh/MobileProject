import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BackButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, { top: insets.top + 14 }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <Ionicons name="arrow-back" size={23} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    left: 16,
    zIndex: 999,

    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#d95b5b",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,

    borderWidth: 1,
    borderColor: "#eee",
  },
});