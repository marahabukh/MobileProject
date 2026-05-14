import { deleteCategory, getCategories } from "@/api/Category";
import { getOrders, updateOrderStatus } from "@/api/Order";
import { deleteProduct, getProducts } from "@/api/Product";
import { getCities, createCity, updateCity, deleteCity, City } from "@/api/City";
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
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  ScaleInCenter,
  ScaleOutCenter
} from "react-native-reanimated";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import StatusDialog from "@/components/StatusDialog";

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
  warning: "#FFB800",
  border: "rgba(0,0,0,0.05)",
};

type ViewType = "overview" | "categories" | "products" | "orders" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<ViewType>("overview");

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "product" | "category" | "city" } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ type: "success" as "success" | "error", title: "", message: "" });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [savingCity, setSavingCity] = useState(false);

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

  const { data: orders = [], refetch: refetchOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
  });

  const { data: categories = [], refetch: refetchCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const { data: cities = [], refetch: refetchCities, isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

  const handleDeleteProduct = (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setItemToDelete({ id, type: "product" });
    setDeleteModalVisible(true);
  };

  const handleDeleteCategory = (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setItemToDelete({ id, type: "category" });
    setDeleteModalVisible(true);
  };

  const handleDeleteCity = (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setItemToDelete({ id, type: "city" });
    setDeleteModalVisible(true);
  };

  const performDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    const { id, type } = itemToDelete;

    try {
      if (type === "product") {
        await deleteProduct(id);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else if (type === "category") {
        await deleteCategory(id);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      } else if (type === "city") {
        await deleteCity(id);
        queryClient.invalidateQueries({ queryKey: ["cities"] });
      }

      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      setDeleteModalVisible(false);
      setItemToDelete(null);
      
      setStatusConfig({
        type: "success",
        title: "Success",
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} has been removed successfully.`
      });
      setStatusVisible(true);
    } catch (e: any) {
      console.error(`Delete ${type} Error:`, e);
      setDeleteModalVisible(false);
      setStatusConfig({
        type: "error",
        title: "Error",
        message: e.message || `Failed to delete ${type}`
      });
      setStatusVisible(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      await updateOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleSaveCity = async () => {
    if (!cityName || !deliveryPrice) {
      return Alert.alert("Required", "Please fill all fields");
    }
    setSavingCity(true);
    try {
      if (editingCity) {
        await updateCity(editingCity.id!, { name: cityName, deliveryPrice: Number(deliveryPrice) });
      } else {
        await createCity({ name: cityName, deliveryPrice: Number(deliveryPrice) });
      }
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setCityModalVisible(false);
      setEditingCity(null);
      setCityName("");
      setDeliveryPrice("");
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Alert.alert("Error", "Failed to save city");
    } finally {
      setSavingCity(false);
    }
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

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: COLORS.white }]}
          onPress={() => handleViewChange("orders")}
        >
          <View style={styles.statIconHeader}>
            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statLabelDark}>Orders</Text>
          </View>
          <Text style={styles.statValueDark}>{orders.length}</Text>
          <View style={styles.statTrend}>
            <Ionicons name="trending-up" size={12} color="#4CAF50" />
            <Text style={[styles.trendText, { color: "#4CAF50" }]}>+5%</Text>
          </View>
        </TouchableOpacity>

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

        <LinearGradient
          colors={["#4A90E2", "#7EB6FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.revenueCard, { marginTop: 16 }]}
        >
          <View>
            <Text style={[styles.statLabelLight, { marginBottom: 4 }]}>Total Categories</Text>
            <Text style={[styles.revenueValue, { color: COLORS.white }]}>{categories.length}</Text>
          </View>
          <View style={styles.revenueIconContainerOverlay}>
            <Ionicons name="layers" size={32} color="rgba(255,255,255,0.3)" />
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => setActiveView("orders")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {orders.slice(0, 5).map((order: any, idx: number) => (
        <TouchableOpacity 
          key={order.id} 
          style={styles.miniOrderCard}
          onPress={() => {
            setSelectedOrder(order);
            setOrderModalVisible(true);
          }}
        >
          <View style={styles.miniOrderLeft}>
            <Text style={styles.miniOrderId}>#{order.orderId || order.id.slice(0,6)}</Text>
            <Text style={styles.miniOrderName}>{order.customerName}</Text>
          </View>
          <View style={styles.miniOrderRight}>
            <Text style={styles.miniOrderTotal}>₪{order.total}</Text>
            <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
              <Text style={[styles.miniStatusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
              <View style={styles.listItemActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/admin/Category/EditCategory/${item.id}`)}
                  style={styles.iconButtonSmall}
                >
                  <Ionicons name="pencil-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(item.id)}
                  style={[styles.iconButtonSmall, { backgroundColor: "#FFF0F0" }]}
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

  const renderOrders = () => (
    <Animated.View entering={FadeInDown} style={styles.listView}>
      <View style={styles.listHeader}>
        <Text style={styles.viewTitle}>Order Management</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => {
              setSelectedOrder(item);
              setOrderModalVisible(true);
            }}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{item.orderId || item.id.slice(0,8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.orderCustomer}>{item.customerName}</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.orderTotal}>₪{item.total}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

  const renderSettings = () => (
    <ScrollView style={styles.settingsView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.viewTitle}>Store Settings</Text>
      
      <View style={styles.settingsSection}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsSectionTitle}>City & Delivery Management</Text>
          <TouchableOpacity 
            style={styles.addCityBtn}
            onPress={() => {
              setEditingCity(null);
              setCityName("");
              setDeliveryPrice("");
              setCityModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addCityBtnText}>Add City</Text>
          </TouchableOpacity>
        </View>

        {cities.map((city: City) => (
          <View key={city.id} style={styles.cityCard}>
            <View>
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={styles.cityPrice}>Delivery: ₪{city.deliveryPrice}</Text>
            </View>
            <View style={styles.cityActions}>
              <TouchableOpacity 
                style={styles.iconButtonSmall}
                onPress={() => {
                  setEditingCity(city);
                  setCityName(city.name);
                  setDeliveryPrice(String(city.deliveryPrice));
                  setCityModalVisible(true);
                }}
              >
                <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButtonSmall, { backgroundColor: "#FFF0F0" }]}
                onPress={() => handleDeleteCity(city.id!)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return COLORS.warning;
      case "shipped": return COLORS.accent;
      case "delivered": return COLORS.success;
      case "cancelled": return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.container}>
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
        {activeView === "categories" && renderCategories()}
        {activeView === "products" && renderProducts()}
        {activeView === "orders" && renderOrders()}
        {activeView === "settings" && renderSettings()}
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
            <Text style={[styles.navText, activeView === "categories" && styles.navTextActive]}>Cats</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("products")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "products" && styles.navIconBgActive]}>
              <Ionicons name="shirt-outline" size={20} color={activeView === "products" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "products" && styles.navTextActive]}>Items</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("orders")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "orders" && styles.navIconBgActive]}>
              <Ionicons name="list-outline" size={20} color={activeView === "orders" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "orders" && styles.navTextActive]}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewChange("settings")} style={styles.navItem}>
            <View style={[styles.navIconBg, activeView === "settings" && styles.navIconBgActive]}>
              <Ionicons name="settings-outline" size={20} color={activeView === "settings" ? COLORS.primary : COLORS.textMuted} />
            </View>
            <Text style={[styles.navText, activeView === "settings" && styles.navTextActive]}>Settings</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={performDelete}
        title={`Delete ${itemToDelete?.type}`}
        message={`Are you sure you want to remove this ${itemToDelete?.type}? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <StatusDialog
        visible={statusVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onClose={() => setStatusVisible(false)}
      />

      {/* Order Details Modal */}
      <Modal visible={orderModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.orderModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setOrderModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailLabel}>Customer Information</Text>
                  <Text style={styles.detailValue}>{selectedOrder.customerName}</Text>
                  <Text style={styles.detailValue}>{selectedOrder.phone1}</Text>
                  <Text style={styles.detailValue}>{selectedOrder.address}, {selectedOrder.city}</Text>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailLabel}>Items</Text>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <View key={i} style={styles.orderItemRow}>
                      <Text style={styles.orderItemText}>{item.quantity}x {item.title}</Text>
                      <Text style={styles.orderItemPrice}>₪{item.price * item.quantity}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailLabel}>Payment & Shipping</Text>
                  <View style={styles.summaryRow}>
                    <Text>Subtotal</Text>
                    <Text>₪{selectedOrder.subtotal}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Shipping</Text>
                    <Text>₪{selectedOrder.shippingCost}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={{ fontWeight: "800" }}>Total</Text>
                    <Text style={{ fontWeight: "800", color: COLORS.primary }}>₪{selectedOrder.total}</Text>
                  </View>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailLabel}>Update Status</Text>
                  <View style={styles.statusButtons}>
                    {["pending", "shipped", "delivered", "cancelled"].map((st) => (
                      <TouchableOpacity 
                        key={st}
                        onPress={() => handleUpdateStatus(selectedOrder.id, st)}
                        style={[
                          styles.statusBtn, 
                          selectedOrder.status === st && { backgroundColor: getStatusColor(st) }
                        ]}
                      >
                        <Text style={[styles.statusBtnText, selectedOrder.status === st && { color: "#fff" }]}>
                          {st.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* City Edit/Add Modal */}
      <Modal visible={cityModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cityModalContent}>
            <Text style={styles.modalTitle}>{editingCity ? "Edit City" : "Add New City"}</Text>
            <TextInput 
              placeholder="City Name"
              value={cityName}
              onChangeText={setCityName}
              style={styles.modalInput}
            />
            <TextInput 
              placeholder="Delivery Price (₪)"
              value={deliveryPrice}
              onChangeText={setDeliveryPrice}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCityModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveCity} disabled={savingCity}>
                {savingCity ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 22,
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
    padding: 16,
    borderRadius: 20,
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
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabelLight: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  statValueDark: {
    color: COLORS.textMain,
    fontSize: 20,
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
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  revenueValue: {
    fontSize: 24,
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
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
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
    paddingHorizontal: 24,
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
    padding: 12,
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
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 10,
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
  listItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
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
    width: 50,
    height: 50,
    borderRadius: 12,
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
    backgroundColor: "rgba(255,255,255,0.95)",
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
    backgroundColor: "transparent",
  },
  navIconBgActive: {
    backgroundColor: "#FFF0F0",
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
  },
  miniOrderCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniOrderLeft: {
    gap: 4,
  },
  miniOrderId: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  miniOrderName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  miniOrderRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  miniOrderTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  orderCustomer: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  settingsView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    flex: 1,
  },
  addCityBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addCityBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  cityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cityName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  cityPrice: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cityActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  orderModalContent: {
    backgroundColor: COLORS.white,
    width: "100%",
    maxHeight: "80%",
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textMain,
  },
  orderDetailSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 4,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderItemText: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  cityModalContent: {
    backgroundColor: COLORS.white,
    width: "90%",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalSaveBtnText: {
    color: COLORS.white,
    fontWeight: "800",
  },
});
