import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { createCategory } from "@/api/Category";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddCategory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

const handleAddCategory = async () => {
  if (!name.trim()) {
    return Alert.alert("Required", "Category name is missing.");
  }
    setLoading(true);
    try {
      await createCategory({ name, image });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      Alert.alert("Awesome!", "New category has been added.");
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Oops!", err.message || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
   
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Category</Text>
          <View style={{ width: 48 }} /> 
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. Electronics, Fashion..."
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image URL</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="https://..."
              value={image}
              onChangeText={setImage}
              style={styles.input}
            />
          </View>
          <Text style={styles.helperText}>Attach a representative icon or photo.</Text>
        </View>

      
        <TouchableOpacity 
          disabled={loading}
          style={[styles.submitButton, loading && { backgroundColor: "#A0A0A0" }]} 
          onPress={handleAddCategory}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Create Category</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerIcon}>
          <Ionicons name="shapes-outline" size={80} color="#E0E0E0" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: "white",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    color: "#666",
    fontWeight: "500",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  input: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  helperText: {
    color: "#A0A0A0",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerIcon: {
    marginTop: 60,
    alignItems: "center",
    opacity: 0.5,
  },
});