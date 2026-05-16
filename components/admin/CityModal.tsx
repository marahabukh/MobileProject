import React from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  cityName: string;
  setCityName: (name: string) => void;
  deliveryPrice: string;
  setDeliveryPrice: (price: string) => void;
  isEditing: boolean;
  isSaving: boolean;
}

export default function CityModal({
  visible,
  onClose,
  onSave,
  cityName,
  setCityName,
  deliveryPrice,
  setDeliveryPrice,
  isEditing,
  isSaving
}: CityModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.cityModalContent}>
          <Text style={styles.modalTitle}>{isEditing ? "Edit City" : "Add New City"}</Text>
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
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={onSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
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
  cityModalContent: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1A1A1A",
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
    color: "#7C7C7C",
    fontWeight: "700",
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: "#E35D5B",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
