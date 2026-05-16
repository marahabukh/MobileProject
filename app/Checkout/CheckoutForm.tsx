import { getCartItems } from "@/api/AddToCart";
import { getCities, City } from "@/api/City";
import { createOrder } from "@/api/Order";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 1000;

  const [submittingOrder, setSubmittingOrder] = useState(false);

  const { data: cartItems = [], isLoading: loadingCart } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
  });

  const {
    data: cities = [],
    isLoading: loadingCities,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 0,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [agree, setAgree] = useState(false);
  const [coupon, setCoupon] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const subtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;

    return cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0,
    );
  }, [cartItems]);

  const shippingCost = selectedCity ? Number(selectedCity.deliveryPrice) : 0;
  const total = subtotal + shippingCost;

  const handleConfirmOrder = async () => {
    try {
      const missingFields: string[] = [];

      if (!firstName.trim()) {
        missingFields.push("First Name");
      }

      if (!lastName.trim()) {
        missingFields.push("Last Name");
      }

      if (!phone1.trim()) {
        missingFields.push("Phone Number");
      }

      if (!selectedCity) {
        missingFields.push("City");
      }

      if (missingFields.length > 0) {
        Alert.alert(
          "Missing Required Fields",
          `Please fill in: ${missingFields.join(", ")}`,
        );
        return;
      }
     const city = selectedCity as City;
      if (paymentMethod === "Visa") {
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
          Alert.alert("Alert", "Please fill in the credit card information");
          return;
        }

        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

        if (!expiryRegex.test(expiryDate)) {
          Alert.alert("Alert", "Please enter a valid expiry date (MM/YY)");
          return;
        }

        const [month, year] = expiryDate.split("/").map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (
          year < currentYear ||
          (year === currentYear && month <= currentMonth)
        ) {
          Alert.alert(
            "Alert",
            "The expiry date must be after the current date",
          );
          return;
        }
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        Alert.alert("Alert", "The cart is empty");
        return;
      }

      setSubmittingOrder(true);

      const generatedOrderId = String(
        Math.floor(100000 + Math.random() * 900000),
      );

      const orderItems = cartItems.map((item: any) => ({
        productId: String(item.productId || item.id),
        title: item.title || "",
        price: Number(item.price || 0),
        image: item.image || "",
        quantity: Number(item.quantity || 1),
        size: item.size || "",
      }));

     const orderPayload = {
  orderId: generatedOrderId,

  firstName: firstName.trim(),
  lastName: lastName.trim(),
  phone1: phone1.trim(),

  // Optional fields, but still sent with safe default values
  phone2: phone2.trim() || "Not provided",
  address: address.trim() || "Not provided",
  region: region.trim() || "Not provided",
  notes: notes.trim() || "No notes",

  city: city.name,
  cityId: String(city.id || ""),

  paymentMethod,
  subtotal,
  shippingCost,
  total,
  items: orderItems,
  status: "pending",
  createdAt: new Date().toISOString(),
};

await queryClient.invalidateQueries({ queryKey: ["orders"] });
await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
await queryClient.invalidateQueries({ queryKey: ["user-orders"] });

router.push({
  pathname: "/Checkout/orderSucess",
  params: {
    orderId: generatedOrderId,
    total: String(total.toFixed(2)),
  },
});
console.log("ORDER PAYLOAD:", orderPayload);

const createdOrder = await createOrder(orderPayload);

console.log("CREATED ORDER:", createdOrder);

      console.log("CREATED ORDER:", createdOrder);

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["user-orders"] });

      router.push({
        pathname: "/Checkout/orderSucess",
        params: {
          orderId: generatedOrderId,
          total: String(total.toFixed(2)),
        },
      });
    } catch (error: any) {
      console.log("Create order error:", error);
      console.log("Create order response:", error?.response?.data);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit order",
      );
    } finally {
      setSubmittingOrder(false);
    }
  };
  if (loadingCart) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={mainColor} />
        <Text style={styles.loadingText}>Loading cart data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackButton />

      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.container, isLargeScreen && styles.containerLarge]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Checkout</Text>
            <Text style={styles.subtitle}>Complete your order information</Text>
          </View>

          <View
            style={[
              styles.layout,
              isLargeScreen ? styles.layoutLarge : styles.layoutMobile,
            ]}
          >
            <View
              style={[
                styles.formColumn,
                isLargeScreen && styles.formColumnLarge,
              ]}
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Customer Information</Text>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      textAlign="left"
                    />
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      textAlign="left"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Phone Number (059 / 057) *</Text>
                  <TextInput
                    style={styles.input}
                    value={phone1}
                    onChangeText={setPhone1}
                    placeholder="0591234567 / 0571234567"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                    textAlign="left"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Alternate Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone2}
                    onChangeText={setPhone2}
                    placeholder="0591234567 / 0571234567"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                    textAlign="left"
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Shipping Information</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>City *</Text>
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => setCityModalVisible(true)}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        selectedCity && { color: "#111" },
                      ]}
                    >
                      {selectedCity ? selectedCity.name : "Select City"}
                    </Text>

                    <Ionicons name="chevron-down" size={18} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Region / Area </Text>
                  <TextInput
                    style={styles.input}
                    value={region}
                    onChangeText={setRegion}
                    placeholder="Region name or neighborhood"
                    placeholderTextColor="#aaa"
                    textAlign="left"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Detailed Address </Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Street name, building number, floor, etc."
                    placeholderTextColor="#aaa"
                    textAlign="left"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Order Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholderTextColor="#aaa"
                    textAlign="left"
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment Method</Text>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "Cash on Delivery" &&
                      styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("Cash on Delivery")}
                >
                  <Text style={styles.paymentText}>Cash on Delivery</Text>

                  <View style={styles.radioCircle}>
                    {paymentMethod === "Cash on Delivery" ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    { marginTop: 12 },
                    paymentMethod === "Visa" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("Visa")}
                >
                  <View style={styles.paymentTitleRow}>
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color="#111"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.paymentText}>Credit Card / Visa</Text>
                  </View>

                  <View style={styles.radioCircle}>
                    {paymentMethod === "Visa" ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>
                </TouchableOpacity>

                {paymentMethod === "Visa" && (
                  <View style={styles.visaForm}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Card Holder Name</Text>
                      <TextInput
                        style={styles.input}
                        value={cardHolder}
                        onChangeText={setCardHolder}
                        placeholder="John Doe"
                        placeholderTextColor="#aaa"
                        textAlign="left"
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Card Number</Text>
                      <TextInput
                        style={styles.input}
                        value={cardNumber}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/\D/g, "");
                          const formatted = cleaned
                            .replace(/(.{4})/g, "$1 ")
                            .trim();
                          setCardNumber(formatted.substring(0, 19));
                        }}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                        textAlign="left"
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={styles.halfField}>
                        <Text style={styles.label}>Expiry Date (MM/YY)</Text>
                        <TextInput
                          style={styles.input}
                          value={expiryDate}
                          onChangeText={(text) => {
                            let formatted = text.replace(/\D/g, "");
                            if (formatted.length > 2) {
                              formatted =
                                formatted.substring(0, 2) +
                                "/" +
                                formatted.substring(2, 4);
                            }
                            setExpiryDate(formatted.substring(0, 5));
                          }}
                          placeholder="MM/YY"
                          placeholderTextColor="#aaa"
                          keyboardType="numeric"
                          textAlign="left"
                        />
                      </View>

                      <View style={styles.halfField}>
                        <Text style={styles.label}>CVV</Text>
                        <TextInput
                          style={styles.input}
                          value={cvv}
                          onChangeText={setCvv}
                          placeholder="123"
                          placeholderTextColor="#aaa"
                          keyboardType="numeric"
                          maxLength={3}
                          secureTextEntry
                          textAlign="left"
                        />
                      </View>
                    </View>
                  </View>
                )}

                <Text style={styles.safePaymentText}>
                  Your payments are safe and encrypted in the store.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.policyBox}>
                  <Text style={styles.policyText}>
                    Payment and Delivery Policy
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgree(!agree)}
                >
                  <View
                    style={[styles.checkbox, agree && styles.checkboxActive]}
                  >
                    {agree ? <Text style={styles.checkboxMark}>✓</Text> : null}
                  </View>

                  <Text style={styles.checkboxText}>
                    I agree to the terms and conditions and privacy policy *
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmOrder}
                  disabled={submittingOrder}
                >
                  {submittingOrder ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Order</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.confirmNote}>
                  By pressing Confirm Order, you agree to receive the service
                  and a confirmation message for your order.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.summaryColumn,
                isLargeScreen && styles.summaryColumnLarge,
              ]}
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Order Summary</Text>

                {Array.isArray(cartItems) && cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item: any) => (
                      <View key={item.id} style={styles.summaryProductRow}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.summaryImage}
                        />

                        <View style={styles.summaryProductInfo}>
                          <Text
                            style={styles.summaryProductName}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>

                          <Text style={styles.summaryProductQty}>
                            Quantity: {item.quantity}
                            {item.size ? ` | Size: ${item.size}` : ""}
                          </Text>

                          <Text style={styles.summaryProductPrice}>
                            ₪
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={styles.emptyCartText}>
                    No products in the cart
                  </Text>
                )}

                <View style={styles.summaryLines}>
                  <View style={styles.summaryLine}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      ₪{subtotal.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.summaryLine}>
                    <Text style={styles.summaryLabel}>Delivery Cost</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        shippingCost > 0 && { color: "#2E7D32" },
                      ]}
                    >
                      {shippingCost === 0
                        ? "Determined by city"
                        : `₪${shippingCost.toFixed(2)}`}
                    </Text>
                  </View>

                  <View style={styles.summaryLine}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₪{total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  value={coupon}
                  onChangeText={setCoupon}
                  placeholder="Discount Code"
                  placeholderTextColor="#aaa"
                  textAlign="left"
                />

                <TouchableOpacity style={styles.couponButton}>
                  <Text style={styles.couponButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={cityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cityPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose City</Text>

              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingCities ? (
              <ActivityIndicator color={mainColor} style={{ padding: 20 }} />
            ) : citiesError ? (
              <View style={styles.modalMessageBox}>
                <Text style={styles.modalErrorText}>
                  Failed to load cities. Please try again later.
                </Text>
              </View>
            ) : cities.length === 0 ? (
              <View style={styles.modalMessageBox}>
                <Text style={styles.modalEmptyText}>
                  No cities available at the moment. Please contact support.
                </Text>
              </View>
            ) : (
              <FlatList
                data={cities}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => {
                      setSelectedCity(item);
                      setCityModalVisible(false);
                    }}
                  >
                    <Text style={styles.cityNameText}>{item.name}</Text>
                    <Text style={styles.cityPriceText}>
                      Delivery: ₪{item.deliveryPrice}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const mainColor = "#d25a58";
const pageBg = "#fcf8fb";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },

  page: {
    flex: 1,
    backgroundColor: pageBg,
  },

  pageContent: {
    paddingBottom: 50,
  },

  container: {
    width: "100%",
    paddingHorizontal: 16,
  },

  containerLarge: {
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: 24,
  },

  header: {
    paddingTop: 70,
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    marginBottom: 18,
    fontSize: 14,
    color: "#7a1d4e",
    textAlign: "center",
  },

  layout: {
    gap: 20,
  },

  layoutMobile: {
    flexDirection: "column",
  },

  layoutLarge: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  formColumn: {
    width: "100%",
    gap: 18,
  },

  formColumnLarge: {
    flex: 1,
    marginRight: 22,
  },

  summaryColumn: {
    width: "100%",
    gap: 16,
  },

  summaryColumnLarge: {
    width: 350,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    textAlign: "left",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  field: {
    marginTop: 16,
  },

  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "700",
    textAlign: "left",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
    color: "#111",
    fontSize: 15,
    textAlign: "left",
  },

  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  selectBox: {
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },

  selectText: {
    textAlign: "left",
    color: "#999",
    fontSize: 15,
    fontWeight: "600",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#eee",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },

  paymentOptionSelected: {
    borderColor: mainColor,
    backgroundColor: "#FFF9F9",
  },

  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  visaForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  paymentText: {
    fontSize: 17,
    color: "#111",
    fontWeight: "700",
    textAlign: "left",
  },

  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: mainColor,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: mainColor,
  },

  safePaymentText: {
    marginTop: 12,
    fontSize: 13,
    color: "#666",
    textAlign: "left",
  },

  policyBox: {
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  policyText: {
    color: "#777",
    fontSize: 14,
    fontWeight: "700",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#fff",
  },

  checkboxActive: {
    backgroundColor: mainColor,
    borderColor: mainColor,
  },

  checkboxMark: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  checkboxText: {
    flex: 1,
    textAlign: "left",
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
  },

  confirmButton: {
    backgroundColor: mainColor,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  confirmNote: {
    marginTop: 14,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },

  summaryProductRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },

  summaryImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginRight: 15,
  },

  summaryProductInfo: {
    flex: 1,
    alignItems: "flex-start",
  },

  summaryProductName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    textAlign: "left",
  },

  summaryProductQty: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
    textAlign: "left",
  },

  summaryProductPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    textAlign: "left",
  },

  emptyCartText: {
    textAlign: "left",
    color: "#999",
    fontSize: 15,
    marginBottom: 12,
  },

  summaryLines: {
    marginTop: 10,
  },

  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  summaryLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
  },

  totalLabel: {
    fontSize: 20,
    color: "#111",
    fontWeight: "800",
  },

  totalValue: {
    fontSize: 22,
    color: mainColor,
    fontWeight: "900",
  },

  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  couponInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    fontSize: 14,
    textAlign: "left",
  },

  couponButton: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  couponButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: pageBg,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  cityPickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: "50%",
    maxHeight: "85%",
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },

  modalMessageBox: {
    padding: 20,
    alignItems: "center",
  },

  modalErrorText: {
    color: "red",
    textAlign: "center",
  },

  modalEmptyText: {
    color: "#666",
    textAlign: "center",
  },

  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  cityNameText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  cityPriceText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "800",
  },
});
