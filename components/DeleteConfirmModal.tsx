import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}: DeleteConfirmModalProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={StyleSheet.absoluteFill}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }]} />
          )}
        </Animated.View>

        <Animated.View 
          entering={ZoomIn.duration(300)} 
          exiting={ZoomOut.duration(200)}
          style={styles.modalContainer}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={32} color="#FF5252" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>
                {isLoading ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#7C7C7C",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
  },
  cancelButtonText: {
    color: "#7C7C7C",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
