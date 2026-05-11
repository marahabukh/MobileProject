import { deleteCategory, getCategories } from "@/api/Category";
import { getOrders } from "@/api/Order";
import { deleteProduct, getProducts } from "@/api/Product";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInDown
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#E35D5B",
  secondary: "#1A1A1A",
  accent: "#4A90E2",
  background: "#F8F9FA",
  white: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.7)",
  textMain: "#1A1A1A",
  textMuted: "#7C7C7C",
  success: "#4CAF50",
  danger: "#FF5252",
  border: "rgba(0,0,0,0.05)",
};

type ViewType = "overview" | "categories" | "products" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<ViewType>("overview");

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(type);
    }
  }, []);

  const handleViewChange = (view: ViewType) => {
    triggerHaptic();
    setActiveView(view);
  };

  const { data: products = [], refetch: refetchProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getProducts,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
  });

  const { data: categories = [], refetch: refetchCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

  const handleDeleteProduct = async (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    const performDelete = async () => {
      try {
        console.log("Starting deletion for product ID:", id);
        await deleteProduct(id);
        await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        await refetchProducts();
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        if (Platform.OS === "web") {
          window.alert("Success: Product has been removed.");
        } else {
          Alert.alert("Success", "Product has been removed.");
        }
      } catch (e: any) {
        console.error("Delete Product Error:", e);
        const errorMsg = e.message || "Failed to delete product";
        if (Platform.OS === "web") {
          window.alert("Error: " + errorMsg);
        } else {
          Alert.alert("Error", errorMsg);
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete Product\nThis action cannot be undone. Are you sure?")) {
        await performDelete();
      }
      return;
    }

    Alert.alert("Delete Product", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: performDelete
      }
    ]);
  };

  const handleDeleteCategory = async (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    const performDelete = async () => {
      try {
        console.log("Starting deletion for category ID:", id);
        await deleteCategory(id);
        await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        await refetchCategories();
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        if (Platform.OS === "web") {
          window.alert("Success: Category has been removed.");
        } else {
          Alert.alert("Success", "Category has been removed.");
        }
      } catch (e: any) {
        console.error("Delete Category Error:", e);
        const errorMsg = e.message || "Failed to delete category";
        if (Platform.OS === "web") {
          window.alert("Error: " + errorMsg);
        } else {
          Alert.alert("Error", errorMsg);
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete Category\nAre you sure? This might affect products in this category.")) {
        await performDelete();
      }
      return;
    }

    Alert.alert("Delete Category", "Are you sure? This might affect products in this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: performDelete
      }
    ]);
  };

  const renderOverview = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.statsGrid}>
        <LinearGradient
          colors={[COLORS.secondary, "#333333"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <View style={styles.statIconHeader}>
            <Ionicons name="cube-outline" size={20} color={COLORS.white} />
            <Text style={styles.statLabelLight}>Products</Text>
          </View>
          <Text style={styles.statValueLight}>{products.length}</Text>
          <View style={styles.statTrend}>
            <Ionicons name="trending-up" size={12} color="#4CAF50" />
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </LinearGradient>

        <View style={[styles.statCard, { backgroundColor: COLORS.white }]}>
          <View style={styles.statIconHeader}>
            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statLabelDark}>Orders</Text>
          </View>
          <Text style={styles.statValueDark}>{orders.length}</Text>
          <View style={styles.statTrend}>
            <Ionicons name="trending-up" size={12} color="#4CAF50" />
            <Text style={[styles.trendText, { color: "#4CAF50" }]}>+5%</Text>
          </View>
        </View>

        <LinearGradient
          colors={[COLORS.primary, "#FF8E8B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.revenueCard}
        >
          <View>
            <Text style={[styles.statLabelLight, { marginBottom: 4 }]}>Total Revenue</Text>
            <Text style={[styles.revenueValue, { color: COLORS.white }]}>₪{totalRevenue.toFixed(2)}</Text>
          </View>
          <View style={styles.revenueIconContainerOverlay}>
            <Ionicons name="stats-chart" size={32} color="rgba(255,255,255,0.3)" />
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            router.push("/admin/Category/AddCategory");
          }}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F0F0F0"]}
            style={styles.actionButtonInner}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: "#FFF0F0" }]}>
              <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonTextDark}>New Category</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            router.push("/admin/AddProduct");
          }}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F0F0F0"]}
            style={styles.actionButtonInner}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: "#F0F5FF" }]}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.actionButtonTextDark}>Add Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );

  const renderCategories = () => (
    <Animated.View entering={FadeInDown} style={styles.listView}>
      <View style={styles.listHeader}>
        <Text style={styles.viewTitle}>Category Management</Text>
        <TouchableOpacity
          style={styles.addIconSmall}
          onPress={() => router.push("/admin/Category/AddCategory")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100)}>
            <View style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Image
                  source={{ uri: item.image || "https://via.placeholder.com/150" }}
                  style={styles.listImage}
                  contentFit="cover"
                  transition={500}
                />
                <View>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {products.filter((p: any) => p.categoryId === item.id).length} Products
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteCategory(item.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />
    </Animated.View>
  );

  const renderProducts = () => (
    <Animated.View entering={FadeInDown} style={styles.listView}>
      <View style={styles.listHeader}>
        <Text style={styles.viewTitle}>Product Management</Text>
        <TouchableOpacity
          style={styles.addIconSmall}
          onPress={() => router.push("/admin/AddProduct")}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)}>
            <View style={styles.productListItem}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/admin/EditProduct/${item.id}`)}
                style={styles.productInfoRow}
              >
                <Image
                  source={{ uri: item.image || "https://via.placeholder.com/150" }}
                  style={styles.productImage}
                  contentFit="cover"
                  transition={500}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.productSubInfo}>
                    <Text style={styles.productPrice}>₪{item.price}</Text>
                    <View style={[styles.stockBadge, { backgroundColor: (item.stock || 0) < 5 ? "#FFF0F0" : "#F0F9F0" }]}>
                      <Text style={[styles.stockText, { color: (item.stock || 0) < 5 ? COLORS.danger : COLORS.success }]}>
                        {item.stock || 0} in stock
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.productActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/admin/EditProduct/${item.id}`)}
                  style={styles.iconButton}
                >
                  <Ionicons name="pencil-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteProduct(item.id)}
                  style={[styles.iconButton, { backgroundColor: "#FFF0F0" }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <TouchableOpacity
          onPress={() => triggerHaptic()}
          style={styles.avatarContainer}
        >
          <Image
            source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Admin" }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.statusDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeView === "overview" && renderOverview()}
        {activeView === "categories" && (loadingCategories ? (
          <View style={styles.centeredContent}><Text>Loading categories...</Text></View>
        ) : renderCategories())}
        {activeView === "products" && (loadingProducts ? (
          <View style={styles.centeredContent}><Text>Loading products...</Text></View>
        ) : renderProducts())}
        {activeView === "settings" && (
          <View style={styles.centeredContent}>
            <Ionicons name="construct-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.comingSoonText}>Settings are under development</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomNavContainer}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]}
          style={styles.bottomNav}
        >
          <TouchableOpacity onPress={() => handleViewChange("overview")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "overview" && styles.navIconBgActive]}>
              <Ionicons name="grid-outline" size={20} color={activeView === "overview" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "overview" && styles.navTextActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("categories")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "categories" && styles.navIconBgActive]}>
              <Ionicons name="layers-outline" size={20} color={activeView === "categories" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "categories" && styles.navTextActive]}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("products")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "products" && styles.navIconBgActive]}>
              <Ionicons name="shirt-outline" size={20} color={activeView === "products" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "products" && styles.navTextActive]}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("settings")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "settings" && styles.navIconBgActive]}>
              <Ionicons name="settings-outline" size={20} color={activeView === "settings" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "settings" && styles.navTextActive]}>Settings</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerGreeting: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  statusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statValueLight: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabelLight: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  statValueDark: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabelDark: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  revenueCard: {
    width: "100%",
    padding: 24,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  revenueIconContainerOverlay: {
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonInner: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonTextDark: {
    color: COLORS.textMain,
    fontWeight: "700",
    fontSize: 13,
  },
  listView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  addIconSmall: {
    backgroundColor: COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  productListItem: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  productSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  productPrice: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: "700",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  navIconBgActive: {
    backgroundColor: "rgba(227, 93, 91, 0.1)",
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  navTextActive: {
    color: COLORS.primary,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  comingSoonText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
});
