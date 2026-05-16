import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  order: any;
  onUpdateStatus: (orderId: string, status: string) => void;
  getStatusColor: (status: string) => string;
}

export default function OrderDetailsModal({ visible, onClose, order, onUpdateStatus, getStatusColor }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.orderModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.orderDetailSection}>
              <Text style={styles.detailLabel}>Customer Information</Text>
              <Text style={styles.detailValue}>{order.customerName}</Text>
              <Text style={styles.detailValue}>{order.phone1}</Text>
              <Text style={styles.detailValue}>{order.address}, {order.city}</Text>
            </View>

            <View style={styles.orderDetailSection}>
              <Text style={styles.detailLabel}>Items</Text>
              {order.items.map((item: any, i: number) => (
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
                <Text>₪{order.subtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Shipping</Text>
                <Text>₪{order.shippingCost}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ fontWeight: "800" }}>Total</Text>
                <Text style={{ fontWeight: "800", color: "#E35D5B" }}>₪{order.total}</Text>
              </View>
            </View>

            <View style={styles.orderDetailSection}>
              <Text style={styles.detailLabel}>Update Status</Text>
              <View style={styles.statusButtons}>
                {["pending", "shipped", "delivered", "cancelled"].map((st) => (
                  <TouchableOpacity 
                    key={st}
                    onPress={() => onUpdateStatus(order.id, st)}
                    style={[
                      styles.statusBtn, 
                      order.status === st && { backgroundColor: getStatusColor(st) }
                    ]}
                  >
                    <Text style={[styles.statusBtnText, order.status === st && { color: "#fff" }]}>
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  orderModalContent: {
    backgroundColor: "#FFFFFF",
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
    color: "#1A1A1A",
  },
  orderDetailSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7C7C7C",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderItemText: {
    fontSize: 14,
    color: "#1A1A1A",
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
});
