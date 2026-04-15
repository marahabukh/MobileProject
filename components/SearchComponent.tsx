import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};
export default function SearchComponent({
  value,
  onChangeText,
  placeholder = "...ابحث عن منتج",
}: Props) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
        textAlign="right"
        textAlignVertical="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 4,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    textAlign: "right",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});