import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} // إخفاء شريط التبويب
      backBehavior="history"        // حافظ عليه
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="Product" options={{ title: "Product" }} />
      <Tabs.Screen name="CategotyPage" options={{ title: "Category" }} />

      {/* إخفاء الصفحات الداخلية */}
      <Tabs.Screen name="AddToCartPage" options={{ href: null }} />
      <Tabs.Screen name="productdetails" options={{ href: null }} />
      <Tabs.Screen name="ID" options={{ href: null }} />           {/* أو CategoryById حسب اسم المجلد */}
      <Tabs.Screen name="CategoryCard" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}