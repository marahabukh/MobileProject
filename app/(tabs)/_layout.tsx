import { Tabs } from "expo-router";

export default function TabsLayout() {
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
    </Tabs>
  );
}