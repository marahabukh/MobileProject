import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import React from "react";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#d25a58" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/Auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} 
      backBehavior="history"        
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="Product" options={{ title: "Product" }} />
      <Tabs.Screen name="CategotyPage" options={{ title: "Category" }} />
      <Tabs.Screen name="AddToCartPage" options={{ href: null }} />
      <Tabs.Screen name="productdetails" options={{ href: null }} />
      <Tabs.Screen name="ID" options={{ href: null }} />          
      <Tabs.Screen name="CategoryCard" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}