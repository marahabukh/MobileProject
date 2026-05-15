import { getCartItems } from "@/api/AddToCart";
import { createOrder } from "@/api/Order";
import { getCities, City } from "@/api/City";
import BackButton from "@/components/BackButton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1000;
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const {
    data: cartItems = [],
    isLoading: loadingCart,
    error: cartError,
  } = useQuery({
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
  const [paymentMethod, setPaymentMethod] = useState("الدفع عند الاستلام");
  const [agree, setAgree] = useState(false);
  const [coupon, setCoupon] = useState("");

  // Visa States
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const subtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cartItems]);

  const shippingCost = selectedCity ? Number(selectedCity.deliveryPrice) : 0;
  const total = subtotal + shippingCost;

  const handleConfirmOrder = async () => {
    try {
      if (!firstName || !lastName || !phone1 || !address || !selectedCity) {
        Alert.alert("تنبيه", "يرجى تعبئة الحقول المطلوبة واختيار المدينة");
        return;
      }

      if (!agree) {
        Alert.alert("تنبيه", "يجب الموافقة على الشروط والأحكام");
        return;
      }

      if (paymentMethod === "Visa") {
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
          Alert.alert("تنبيه", "يرجى تعبئة معلومات البطاقة الائتمانية");
          return;
        }

        // Validate Expiry Date (MM/YY)
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(expiryDate)) {
          Alert.alert("تنبيه", "يرجى إدخال تاريخ انتهاء صلاحية صحيح (MM/YY)");
          return;
        }

        const [month, year] = expiryDate.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month <= currentMonth)) {
          Alert.alert("تنبيه", "تاريخ انتهاء الصلاحية يجب أن يكون بعد تاريخ اليوم");
          return;
        }
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        Alert.alert("تنبيه", "السلة فارغة");
        return;
      }

      setSubmittingOrder(true);

      const generatedOrderId = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      const orderItems = cartItems.map((item: any) => ({
        productId: String(item.productId || item.id),
        title: item.title || "",
        price: Number(item.price || 0),
        image: item.image || "",
        quantity: Number(item.quantity || 1),
        size: item.size || "",
      }));

      await createOrder({
        orderId: generatedOrderId,
        firstName,
        lastName,
        phone1,
        phone2,
        address,
        city: selectedCity.name,
        region,
        notes,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        items: orderItems,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      router.push({
<<<<<<< Updated upstream
        pathname: "/Checkout/orderSucess",
=======
        pathname: "/Checkout/orderSucess", 
>>>>>>> Stashed changes
        params: {
          orderId: generatedOrderId,
          total: String(total.toFixed(2)),
        },
      });
    } catch (error) {
      console.log("Create order error:", error);
      Alert.alert("خطأ", "فشل إرسال الطلب");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loadingCart) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d25a58" />
        <Text style={styles.loadingText}>جاري تحميل بيانات السلة...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
          <View
            style={[
              styles.layout,
              isLargeScreen ? styles.layoutLarge : styles.layoutMobile,
            ]}
          >
            <View style={[styles.formColumn, isLargeScreen && styles.formColumnLarge]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>معلومات العميل</Text>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>الاسم الأخير *</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      textAlign="right"
                    />
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.label}>الاسم الأول *</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      textAlign="right"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>رقم الهاتف (059 / 057) *</Text>
                  <TextInput
                    style={styles.input}
                    value={phone1}
                    onChangeText={setPhone1}
                    placeholder="0591234567 / 0571234567"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>رقم الهاتف الاحتياطي</Text>
                  <TextInput
                    style={styles.input}
                    value={phone2}
                    onChangeText={setPhone2}
                    placeholder="0591234567 / 0571234567"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>معلومات الشحن</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>المدينة *</Text>
                  <TouchableOpacity 
                    style={styles.selectBox}
                    onPress={() => setCityModalVisible(true)}
                  >
                    <Text style={[styles.selectText, selectedCity && { color: "#111" }]}>
                      {selectedCity ? selectedCity.name : "اختر مدينة"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>المنطقة / الجهة (اختياري)</Text>
                  <TextInput
                    style={styles.input}
                    value={region}
                    onChangeText={setRegion}
                    placeholder="اسم المنطقة أو الحي"
                    textAlign="right"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>العنوان التفصيلي *</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="الشارع، رقم البناية، الطابق إلخ"
                    textAlign="right"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>ملاحظات الطلب (اختياري)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlign="right"
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>طريقة الدفع</Text>

                <TouchableOpacity
                  style={[
                    styles.paymentOption, 
                    paymentMethod === "الدفع عند الاستلام" && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentMethod("الدفع عند الاستلام")}
                >
                  <View style={styles.radioCircle}>
                    {paymentMethod === "الدفع عند الاستلام" ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>

                  <Text style={styles.paymentText}>الدفع عند الاستلام</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption, 
                    { marginTop: 12 },
                    paymentMethod === "Visa" && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentMethod("Visa")}
                >
                  <View style={styles.radioCircle}>
                    {paymentMethod === "Visa" ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="card-outline" size={20} color="#111" style={{ marginRight: 8 }} />
                    <Text style={styles.paymentText}>بطاقة ائتمانية / Visa</Text>
                  </View>
                </TouchableOpacity>

                {paymentMethod === "Visa" && (
                  <View style={styles.visaForm}>
                    <View style={styles.field}>
                      <Text style={styles.label}>اسم صاحب البطاقة</Text>
                      <TextInput
                        style={styles.input}
                        value={cardHolder}
                        onChangeText={setCardHolder}
                        placeholder="John Doe"
                        textAlign="right"
                      />
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>رقم البطاقة</Text>
                      <TextInput
                        style={styles.input}
                        value={cardNumber}
                        onChangeText={(text) => {
                          // Basic formatting for card number
                          const cleaned = text.replace(/\D/g, '');
                          const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(formatted.substring(0, 19));
                        }}
                        placeholder="0000 0000 0000 0000"
                        keyboardType="numeric"
                        textAlign="right"
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={styles.halfField}>
                        <Text style={styles.label}>CVV</Text>
                        <TextInput
                          style={styles.input}
                          value={cvv}
                          onChangeText={setCvv}
                          placeholder="123"
                          keyboardType="numeric"
                          maxLength={3}
                          secureTextEntry
                          textAlign="right"
                        />
                      </View>
                      <View style={styles.halfField}>
                        <Text style={styles.label}>تاريخ الانتهاء (MM/YY)</Text>
                        <TextInput
                          style={styles.input}
                          value={expiryDate}
                          onChangeText={(text) => {
                            let formatted = text.replace(/\D/g, '');
                            if (formatted.length > 2) {
                              formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
                            }
                            setExpiryDate(formatted.substring(0, 5));
                          }}
                          placeholder="MM/YY"
                          keyboardType="numeric"
                          textAlign="right"
                        />
                      </View>
                    </View>
                  </View>
                )}

                <Text style={styles.safePaymentText}>
                  مدفوعاتك آمنة ومشفرة في المتجر.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.policyBox}>
                  <Text style={styles.policyText}>سياسة الدفع والتوصيل</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgree(!agree)}
                >
                  <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                    {agree ? <Text style={styles.checkboxMark}>✓</Text> : null}
                  </View>

                  <Text style={styles.checkboxText}>
                    أوافق على الشروط والأحكام وسياسة الخصوصية *
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
                    <Text style={styles.confirmButtonText}>تأكيد الطلب</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.confirmNote}>
                  بالضغط على تأكيد الطلب، أنت توافق على تلقي الخدمة ورسالة تأكيدية للطلب.
                </Text>
              </View>
            </View>

            <View style={[styles.summaryColumn, isLargeScreen && styles.summaryColumnLarge]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>ملخص الطلب</Text>

                {Array.isArray(cartItems) && cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item: any) => (
                      <View key={item.id} style={styles.summaryProductRow}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.summaryImage}
                        />

                        <View style={styles.summaryProductInfo}>
                          <Text style={styles.summaryProductName} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.summaryProductQty}>
                            الكمية: {item.quantity} {item.size ? `| المقاس: ${item.size}` : ""}
                          </Text>
                          <Text style={styles.summaryProductPrice}>
                            ₪{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={styles.emptyCartText}>لا توجد منتجات في السلة</Text>
                )}

                <View style={styles.summaryLines}>
                  <View style={styles.summaryLine}>
                    <Text style={styles.summaryValue}>₪{subtotal.toFixed(2)}</Text>
                    <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
                  </View>

                  <View style={styles.summaryLine}>
                    <Text style={[styles.summaryValue, shippingCost > 0 && { color: "#2E7D32" }]}>
                      {shippingCost === 0 ? "يحدد حسب المدينة" : `₪${shippingCost.toFixed(2)}`}
                    </Text>
                    <Text style={styles.summaryLabel}>تكلفة التوصيل</Text>
                  </View>

                  <View style={styles.summaryLine}>
                    <Text style={styles.totalValue}>₪{total.toFixed(2)}</Text>
                    <Text style={styles.totalLabel}>المجموع الكلي</Text>
                  </View>
                </View>
              </View>

              <View style={styles.couponRow}>
                <TouchableOpacity style={styles.couponButton}>
                  <Text style={styles.couponButtonText}>تطبيق</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.couponInput}
                  value={coupon}
                  onChangeText={setCoupon}
                  placeholder="رمز الخصم"
                  textAlign="right"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* City Selection Modal */}
      <Modal visible={cityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cityPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر المدينة</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>
            
            {loadingCities ? (
              <ActivityIndicator color="#d25a58" style={{ padding: 20 }} />
            ) : citiesError ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>فشل تحميل المدن. يرجى المحاولة لاحقاً.</Text>
              </View>
            ) : cities.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666', textAlign: 'center' }}>لا توجد مدن متاحة حالياً. يرجى التواصل مع الدعم.</Text>
              </View>
            ) : (
              <FlatList
                data={cities}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.cityItem}
                    onPress={() => {
                      setSelectedCity(item);
                      setCityModalVisible(false);
                    }}
                  >
                    <Text style={styles.cityNameText}>{item.name}</Text>
                    <Text style={styles.cityPriceText}>التوصيل: ₪{item.deliveryPrice}</Text>
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
const pageBg = "#F6F6F6";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: pageBg,
  },
  pageContent: {
    paddingBottom: 50,
  },
  container: {
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 18,
  },
  containerLarge: {
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  layout: {
    gap: 20,
  },
  layoutMobile: {
    flexDirection: "column",
  },
  layoutLarge: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  formColumn: {
    width: "100%",
    gap: 18,
  },
  formColumnLarge: {
    flex: 1,
    marginLeft: 22,
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
    textAlign: "right",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row-reverse",
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
    textAlign: "right",
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
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  selectBox: {
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    minHeight: 52,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },
  selectText: {
    textAlign: "right",
    color: "#999",
    fontSize: 15,
    fontWeight: "600",
  },
  paymentOption: {
    flexDirection: "row-reverse",
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
    textAlign: "right",
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
    textAlign: "right",
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
    flexDirection: "row-reverse",
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
    marginLeft: 12,
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
    textAlign: "right",
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
    flexDirection: "row-reverse",
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
    marginLeft: 15,
  },
  summaryProductInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  summaryProductName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    textAlign: "right",
  },
  summaryProductQty: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
    textAlign: "right",
  },
  summaryProductPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    textAlign: "right",
  },
  emptyCartText: {
    textAlign: "right",
    color: "#999",
    fontSize: 15,
    marginBottom: 12,
  },
  summaryLines: {
    marginTop: 10,
  },
  summaryLine: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },
  cityItem: {
    flexDirection: "row-reverse",
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