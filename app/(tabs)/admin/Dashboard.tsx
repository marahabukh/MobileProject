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
import React, { useCallback, useState, useMemo } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";


import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import StatusDialog from "@/components/StatusDialog";
import StatCard from "@/components/admin/StatCard";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import CityModal from "@/components/admin/CityModal";

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

  const { data: products = [], isLoading: loadingProducts } = useQuery({ queryKey: ["admin-products"], queryFn: getProducts });
  const { data: orders = [], isLoading: loadingOrders } = useQuery({ queryKey: ["admin-orders"], queryFn: getOrders });
  const { data: categories = [], isLoading: loadingCategories } = useQuery({ queryKey: ["admin-categories"], queryFn: getCategories });
  const { data: cities = [], isLoading: loadingCities } = useQuery({ queryKey: ["cities"], queryFn: getCities });

  const totalRevenue = useMemo(() => orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0), [orders]);

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(type);
  }, []);

  const handleViewChange = (view: ViewType) => {
    triggerHaptic();
    setActiveView(view);
  };

  const confirmDelete = (id: string, type: "product" | "category" | "city") => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setItemToDelete({ id, type });
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
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["bestSellers"] });
      } else if (type === "category") {
        await deleteCategory(id);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else if (type === "city") {
        await deleteCity(id);
        queryClient.invalidateQueries({ queryKey: ["cities"] });
      }

      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      setDeleteModalVisible(false);
      setItemToDelete(null);
      setStatusConfig({ type: "success", title: "Success", message: `${type} deleted successfully.` });
      setStatusVisible(true);
    } catch (e: any) {
      setDeleteModalVisible(false);
      setStatusConfig({ type: "error", title: "Error", message: e.message || "Failed to delete item." });
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
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleSaveCity = async () => {
    if (!cityName || !deliveryPrice) return Alert.alert("Required", "Please fill all fields");
    setSavingCity(true);
    try {
      if (editingCity) await updateCity(editingCity.id!, { name: cityName, deliveryPrice: Number(deliveryPrice) });
      else await createCity({ name: cityName, deliveryPrice: Number(deliveryPrice) });
      
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return COLORS.warning;
      case "shipped": return COLORS.accent;
      case "delivered": return COLORS.success;
      case "cancelled": return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.statsGrid}>
        <StatCard title="Products" value={products.length} icon="cube-outline" colors={[COLORS.secondary, "#333333"]} isDark trend="+12%" />
        <StatCard title="Orders" value={orders.length} icon="cart-outline" onPress={() => handleViewChange("orders")} trend="+5%" />
        <StatCard title="Revenue" value={`\u20AA${totalRevenue.toFixed(2)}`} icon="stats-chart" colors={[COLORS.primary, "#FF8E8B"]} isDark />
        <StatCard title="Categories" value={categories.length} icon="layers" colors={["#4A90E2", "#7EB6FF"]} isDark />
      </Animated.View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <QuickActionButton label="New Category" icon="grid-outline" color={COLORS.primary} bgColor="#FFF0F0" onPress={() => router.push("/(tabs)/admin/Category/AddCategory")} />
        <QuickActionButton label="Add Product" icon="add-circle-outline" color={COLORS.accent} bgColor="#F0F5FF" onPress={() => router.push("/(tabs)/admin/Product/AddProduct")} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => handleViewChange("orders")}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
      </View>
      {orders.slice(0, 5).map((order: any) => (
        <OrderRow key={order.id} order={order} onPress={() => { setSelectedOrder(order); setOrderModalVisible(true); }} getStatusColor={getStatusColor} />
      ))}
    </ScrollView>
  );

  const renderCategories = () => (
    <View style={styles.listView}>
      <ListHeader title="Category Management" onAdd={() => router.push("/(tabs)/admin/Category/AddCategory")} />
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Image source={{ uri: item.image || "https://via.placeholder.com/150" }} style={styles.listImage} contentFit="cover" transition={500} />
              <View>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemSubtitle}>{products.filter((p: any) => p.categoryId === item.id).length} Products</Text>
              </View>
            </View>
            <View style={styles.listItemActions}>
              <IconButton icon="pencil-outline" onPress={() => router.push(`/(tabs)/admin/Category/EditCategory/${item.id}`)} />
              <IconButton icon="trash-outline" onPress={() => confirmDelete(item.id, "category")} color={COLORS.danger} bgColor="#FFF0F0" />
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderProducts = () => (
    <View style={styles.listView}>
      <ListHeader title="Product Management" onAdd={() => router.push("/(tabs)/admin/Product/AddProduct")} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productListItem}>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/admin/Product/EditProduct/${item.id}`)} style={styles.productInfoRow}>
              <Image source={{ uri: item.image || item.images?.[0] || "https://via.placeholder.com/150" }} style={styles.productImage} contentFit="cover" transition={500} />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <View style={styles.productSubInfo}>
                  <Text style={styles.productPrice}>\u20AA{item.price}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: (item.stock || 0) < 5 ? "#FFF0F0" : "#F0F9F0" }]}>
                    <Text style={[styles.stockText, { color: (item.stock || 0) < 5 ? COLORS.danger : COLORS.success }]}>{item.stock || 0} in stock</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.productActions}>
              <IconButton icon="pencil-outline" onPress={() => router.push(`/(tabs)/admin/Product/EditProduct/${item.id}`)} />
              <IconButton icon="trash-outline" onPress={() => confirmDelete(item.id, "product")} color={COLORS.danger} bgColor="#FFF0F0" />
            </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AdminHeader router={router} triggerHaptic={triggerHaptic} />
      <View style={styles.content}>
        {activeView === "overview" && renderOverview()}
        {activeView === "categories" && renderCategories()}
        {activeView === "products" && renderProducts()}
        {activeView === "orders" && <OrderList orders={orders} onSelect={(o) => { setSelectedOrder(o); setOrderModalVisible(true); }} getStatusColor={getStatusColor} />}
        {activeView === "settings" && (
          <SettingsView 
            cities={cities} 
            onAddCity={() => { setEditingCity(null); setCityName(""); setDeliveryPrice(""); setCityModalVisible(true); }}
            onEditCity={(city) => { setEditingCity(city); setCityName(city.name); setDeliveryPrice(String(city.deliveryPrice)); setCityModalVisible(true); }}
            onDeleteCity={(id) => confirmDelete(id, "city")}
          />
        )}
      </View>

      <AdminBottomNav activeView={activeView} handleViewChange={handleViewChange} />

      <DeleteConfirmModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} onConfirm={performDelete} title={`Delete ${itemToDelete?.type}`} message={`Are you sure? This cannot be undone.`} isLoading={isDeleting} />
      <StatusDialog visible={statusVisible} type={statusConfig.type} title={statusConfig.title} message={statusConfig.message} onClose={() => setStatusVisible(false)} />
      <OrderDetailsModal visible={orderModalVisible} onClose={() => setOrderModalVisible(false)} order={selectedOrder} onUpdateStatus={handleUpdateStatus} getStatusColor={getStatusColor} />
      <CityModal visible={cityModalVisible} onClose={() => setCityModalVisible(false)} onSave={handleSaveCity} cityName={cityName} setCityName={setCityName} deliveryPrice={deliveryPrice} setDeliveryPrice={setDeliveryPrice} isEditing={!!editingCity} isSaving={savingCity} />
    </View>
  );
}


interface QuickActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
}

const QuickActionButton = ({ label, icon, color, bgColor, onPress }: QuickActionButtonProps) => (
  <TouchableOpacity onPress={onPress} style={styles.actionButton}>
    <View style={styles.actionButtonInner}>
      <View style={[styles.actionIconContainer, { backgroundColor: bgColor }]}><Ionicons name={icon} size={24} color={color} /></View>
      <Text style={styles.actionButtonTextDark}>{label}</Text>
    </View>
  </TouchableOpacity>
);

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}

const IconButton = ({ icon, onPress, color = COLORS.textMuted, bgColor = COLORS.white }: IconButtonProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.iconButtonSmall, { backgroundColor: bgColor }]}>
    <Ionicons name={icon} size={18} color={color} />
  </TouchableOpacity>
);

interface ListHeaderProps {
  title: string;
  onAdd?: () => void;
}

const ListHeader = ({ title, onAdd }: ListHeaderProps) => (
  <View style={styles.listHeader}>
    <Text style={styles.viewTitle}>{title}</Text>
    {onAdd && (
      <TouchableOpacity style={styles.addIconSmall} onPress={onAdd}>
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    )}
  </View>
);

interface OrderRowProps {
  order: any;
  onPress: () => void;
  getStatusColor: (status: string) => string;
}

const OrderRow = ({ order, onPress, getStatusColor }: OrderRowProps) => (
  <TouchableOpacity style={styles.miniOrderCard} onPress={onPress}>
    <View style={styles.miniOrderLeft}>
      <Text style={styles.miniOrderId}>#{order.orderId || order.id.slice(0,6)}</Text>
      <Text style={styles.miniOrderName}>{order.customerName}</Text>
    </View>
    <View style={styles.miniOrderRight}>
      <Text style={styles.miniOrderTotal}>\u20AA{order.total}</Text>
      <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
        <Text style={[styles.miniStatusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface OrderListProps {
  orders: any[];
  onSelect: (order: any) => void;
  getStatusColor: (status: string) => string;
}

const OrderList = ({ orders, onSelect, getStatusColor }: OrderListProps) => (
  <View style={styles.listView}>
    <ListHeader title="Order Management" />
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.orderCard} onPress={() => onSelect(item)}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>#{item.orderId || item.id.slice(0,8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}><Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text></View>
          </View>
          <Text style={styles.orderCustomer}>{item.customerName}</Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.orderTotal}>\u20AA{item.total}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
);

interface SettingsViewProps {
  cities: City[];
  onAddCity: () => void;
  onEditCity: (city: City) => void;
  onDeleteCity: (id: string) => void;
}

const SettingsView = ({ cities, onAddCity, onEditCity, onDeleteCity }: SettingsViewProps) => (
  <ScrollView style={styles.settingsView} showsVerticalScrollIndicator={false}>
    <Text style={styles.viewTitle}>Store Settings</Text>
    <View style={styles.settingsSection}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsSectionTitle}>City & Delivery Management</Text>
        <TouchableOpacity style={styles.addCityBtn} onPress={onAddCity}>
          <Ionicons name="add" size={20} color={COLORS.white} /><Text style={styles.addCityBtnText}>Add City</Text>
        </TouchableOpacity>
      </View>
      {cities.map((city: City) => (
        <View key={city.id} style={styles.cityCard}>
          <View><Text style={styles.cityName}>{city.name}</Text><Text style={styles.cityPrice}>Delivery: \u20AA{city.deliveryPrice}</Text></View>
          <View style={styles.cityActions}>
            <IconButton icon="pencil-outline" onPress={() => onEditCity(city)} />
            <IconButton icon="trash-outline" onPress={() => onDeleteCity(city.id!)} color={COLORS.danger} bgColor="#FFF0F0" />
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

const AdminHeader = ({ router, triggerHaptic }: any) => (
  <View style={styles.header}>
    <View>
      <View style={styles.headerTitleRow}>
        <Text style={styles.headerGreeting}>Welcome back,</Text>
        <TouchableOpacity onPress={() => { triggerHaptic(); router.replace("/(tabs)"); }} style={styles.backToHomeBtn}>
          <Ionicons name="home-outline" size={16} color={COLORS.primary} /><Text style={styles.backToHomeText}>Store</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>Admin Panel</Text>
    </View>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Admin" }} style={styles.avatar} contentFit="cover" />
      <View style={styles.statusDot} />
    </View>
  </View>
);

const AdminBottomNav = ({ activeView, handleViewChange }: any) => (
  <View style={styles.bottomNavContainer}>
    <LinearGradient colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]} style={styles.bottomNav}>
      <NavItem view="overview" label="Home" icon="grid-outline" activeView={activeView} onPress={handleViewChange} />
      <NavItem view="categories" label="Cats" icon="layers-outline" activeView={activeView} onPress={handleViewChange} />
      <NavItem view="products" label="Items" icon="shirt-outline" activeView={activeView} onPress={handleViewChange} />
      <NavItem view="orders" label="Orders" icon="list-outline" activeView={activeView} onPress={handleViewChange} />
      <NavItem view="settings" label="Settings" icon="settings-outline" activeView={activeView} onPress={handleViewChange} />
    </LinearGradient>
  </View>
);

const NavItem = ({ view, label, icon, activeView, onPress }: any) => (
  <TouchableOpacity onPress={() => onPress(view)} style={styles.navItem}>
    <View style={[styles.navIconBg, activeView === view && styles.navIconBgActive]}>
      <Ionicons name={icon} size={20} color={activeView === view ? COLORS.primary : COLORS.textMuted} />
    </View>
    <Text style={[styles.navText, activeView === view && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);


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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backToHomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  backToHomeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerGreeting: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
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
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  statusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonInner: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonTextDark: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  listView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textMain,
  },
  addIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
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
    borderRadius: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  listItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productListItem: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  productSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  miniOrderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniOrderLeft: {
    gap: 2,
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
  bottomNavContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
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
    backgroundColor: "#FFF0F0",
  },
  navText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  navTextActive: {
    color: COLORS.primary,
  },
});