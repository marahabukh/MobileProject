import React, { useEffect, useState } from "react";
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
import { getCategoryById, updateCategory } from "@/api/Category";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StatusDialog from "@/components/StatusDialog";

export default function EditCategory() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


  const [statusVisible, setStatusVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ type: "success" as "success" | "error", title: "", message: "" });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      try {
        const data = await getCategoryById(String(id));
        if (data) {
          setName(data.name);
          setImage(data.image || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleUpdateCategory = async () => {
    if (!name) return Alert.alert("Required", "Category name is missing.");

    setLoading(true);
    try {
      await updateCategory(String(id), { name, image });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      
      setStatusConfig({
        type: "success",
        title: "Success",
        message: "Category updated successfully."
      });
      setStatusVisible(true);
      
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatusConfig({
        type: "error",
        title: "Oops!",
        message: err.message || "Failed to update category."
      });
      setStatusVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Category</Text>
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
          onPress={handleUpdateCategory}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <StatusDialog
        visible={statusVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onClose={() => setStatusVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
