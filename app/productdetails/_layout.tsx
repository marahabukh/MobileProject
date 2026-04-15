import { Stack } from "expo-router";

export default function ProductDetailsLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // animation: 'slide_from_right' // اختياري لتحسين الإحساس
      }}
    />
  );
}