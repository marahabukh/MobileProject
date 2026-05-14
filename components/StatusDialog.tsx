import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type StatusDialogProps = {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function StatusDialog({
  visible,
  type,
  title,
  message,
  buttonText = "OK",
  onClose,
}: StatusDialogProps) {
  const isSuccess = type === "success";
  const iconName = isSuccess ? "checkmark-circle" : "close-circle";
  const accentColor = isSuccess ? "#4CAF50" : "#FF5252";
  const iconBg = isSuccess ? "#E8F5E9" : "#FFEBEE";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Top accent band */}
          <View style={[styles.accentBand, { backgroundColor: accentColor }]} />

          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={40} color={accentColor} />
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    paddingBottom: 20,
    overflow: "hidden",
  },
  accentBand: {
    width: "100%",
    height: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
