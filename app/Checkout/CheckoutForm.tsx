import { getCartItems } from "@/api/AddToCart";
import { createOrder } from "@/api/Order";
import BackButton from "@/components/BackButton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
} from "react-native";

export default function CheckoutPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1000;
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("اختر مدينة");
  const [region, setRegion] = useState("اختر منطقة");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("الدفع عند الاستلام");
  const [agree, setAgree] = useState(false);
  const [coupon, setCoupon] = useState("");

  const subtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cartItems]);

  const shippingCost: number = 0;
  const total = subtotal + shippingCost;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d25a58" />
        <Text style={styles.loadingText}>جاري تحميل بيانات السلة...</Text>
      </View>
    );
  }

  if (error instanceof Error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>خطأ: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const handleConfirmOrder = async () => {
    try {
      if (!firstName || !lastName || !phone1 || !address) {
        Alert.alert("تنبيه", "يرجى تعبئة الحقول المطلوبة");
        return;
      }

      if (!agree) {
        Alert.alert("تنبيه", "يجب الموافقة على الشروط والأحكام");
        return;
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
        city,
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
        pathname: "/Checkout/orderSucess", // أو /order-success حسب اسم الملف عندك
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
  return (
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
                <Text style={styles.label}>المدينة *</Text>
                <TouchableOpacity style={styles.selectBox}>
                  <Text style={styles.selectText}>{city}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>المنطقة / الجهة *</Text>
                <TouchableOpacity style={styles.selectBox}>
                  <Text style={styles.selectText}>{region}</Text>
                </TouchableOpacity>
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
                style={styles.paymentOption}
                onPress={() => setPaymentMethod("الدفع عند الاستلام")}
              >
                <View style={styles.radioCircle}>
                  {paymentMethod === "الدفع عند الاستلام" ? (
                    <View style={styles.radioInner} />
                  ) : null}
                </View>

                <Text style={styles.paymentText}>الدفع عند الاستلام</Text>
              </TouchableOpacity>

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
                        <Text style={styles.summaryProductName}>
                          {item.title}
                        </Text>
                        <Text style={styles.summaryProductQty}>
                          الكمية: {item.quantity}
                        </Text>
                        <Text style={styles.summaryProductPrice}>
                          ₪{Number(item.price).toFixed(2)}
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
                  <Text style={styles.summaryValue}>
                    {shippingCost === 0 ? "تحسب لاحقاً" : `₪${shippingCost.toFixed(2)}`}
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
  );
}

const mainColor = "#d25a58";
const darkPink = "#d25a58";
const pageBg = "#faf7f8";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: pageBg,
  },
  pageContent: {
    paddingBottom: 30,
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
    width: 320,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0e6ea",
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: darkPink,
    textAlign: "right",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  field: {
    marginTop: 14,
  },
  label: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#222",
  },
  textArea: {
    minHeight: 90,
    paddingTop: 10,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  selectText: {
    textAlign: "right",
    color: "#666",
    fontSize: 15,
  },
  paymentOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#d25a58",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fff8fb",
  },
  paymentText: {
    fontSize: 17,
    color: "#222",
    fontWeight: "600",
    textAlign: "right",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: mainColor,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: mainColor,
  },
  safePaymentText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6f8b78",
    textAlign: "right",
  },
  policyBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  policyText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#bbb",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#fff",
  },
  checkboxActive: {
    backgroundColor: mainColor,
    borderColor: mainColor,
  },
  checkboxMark: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  checkboxText: {
    flex: 1,
    textAlign: "right",
    color: "#444",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: mainColor,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  confirmNote: {
    marginTop: 12,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },
  summaryProductRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  summaryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    marginLeft: 10,
  },
  summaryProductInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  summaryProductName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    textAlign: "right",
  },
  summaryProductQty: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  summaryProductPrice: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    textAlign: "right",
  },
  emptyCartText: {
    textAlign: "right",
    color: "#777",
    fontSize: 15,
    marginBottom: 12,
  },
  summaryLines: {
    marginTop: 6,
  },
  summaryLine: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 20,
    color: "#111",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 20,
    color: "#111",
    fontWeight: "700",
  },
  couponRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  couponButton: {
    backgroundColor: mainColor,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: mainColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});