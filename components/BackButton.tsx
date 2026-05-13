import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
    <View style={[styles.wrapper, { paddingTop: insets.top + 30 }]}>
      <TouchableOpacity style={styles.btn} onPress={handlePress}>
        <Ionicons name="arrow-back" size={22} color="#050404" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  btn: {
    width: 40,
    height: 20,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});