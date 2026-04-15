import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { createCategory } from "@/api/Category";

export default function AddCategory() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const handleAddCategory = async () => {
    if (!name) return Alert.alert("Error", "Please enter category name");

    try {
      await createCategory({ name, image });
      Alert.alert("Success", "Category added ✅");
      setName("");
      setImage("");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Category Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Image URL"
        value={image}
        onChangeText={setImage}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
        <Text style={styles.buttonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { backgroundColor: "#eee", padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: "#000", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});