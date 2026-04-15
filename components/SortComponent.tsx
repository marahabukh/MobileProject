import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SortOption = "default" | "price_asc" | "price_desc";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "افتراضي", value: "default" },
  { label: "السعر: من الأقل", value: "price_asc" },
  { label: "السعر: من الأعلى", value: "price_desc" },
];

type Props = {
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
};

export default function SortComponent({ sortBy, setSortBy }: Props) {
  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>ترتيب:</Text>

      <View style={styles.sortButtons}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sortButton,
              sortBy === opt.value && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === opt.value && styles.sortButtonTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sortContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 10,
    gap: 10,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  sortButtons: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  sortButtonActive: {
    backgroundColor: "#d25a58",
    borderColor: "#d25a58",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#555",
  },
  sortButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});