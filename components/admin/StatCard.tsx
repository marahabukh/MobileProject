import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  colors?: string[];
  onPress?: () => void;
  trend?: string;
  isDark?: boolean;
}

export default function StatCard({ title, value, icon, colors, onPress, trend, isDark = false }: StatCardProps) {
  const content = (
    <>
      <View style={styles.statIconHeader}>
        <Ionicons name={icon} size={20} color={isDark ? "#FFFFFF" : "#E35D5B"} />
        <Text style={[styles.statLabel, isDark ? styles.textLight : styles.textDark]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, isDark ? styles.textLight : styles.textDark]}>{value}</Text>
      {trend && (
        <View style={styles.statTrend}>
          <Ionicons name="trending-up" size={12} color="#4CAF50" />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </>
  );

  const cardStyle = [styles.statCard, !colors && styles.whiteCard];

  if (colors) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.wrapper}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cardStyle}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[cardStyle, styles.wrapper]}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: "45%",
    margin: 8,
  },
  statCard: {
    padding: 20,
    borderRadius: 24,
    height: 140,
    justifyContent: "center",
  },
  whiteCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  textLight: {
    color: "#FFFFFF",
  },
  textDark: {
    color: "#1A1A1A",
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
});
