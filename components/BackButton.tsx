import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function BackButton() {
  const router = useRouter();

 const handlePress = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)");   
  }
};
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.btn} onPress={handlePress}>
        <Ionicons name="arrow-back" size={22} color="#050404" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  btn: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});