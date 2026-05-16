import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { getCategories } from "@/api/Category";
import { createProduct } from "@/api/Product";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import StatusDialog from "@/components/StatusDialog";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#E35D5B",
  secondary: "#1A1A1A",
  accent: "#4A90E2",
  background: "#F8F9FA",
  white: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#7C7C7C",
  border: "rgba(0,0,0,0.05)",
  glass: "rgba(255, 255, 255, 0.8)",
  danger: "#FF4D4D",
};

export default function AddProduct() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [bestSeller, setBestSeller] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({ type: "success" as "success" | "error", title: "", message: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(type);
    }
  }, []);

  const addImageField = () => {
    triggerHaptic();
    setImages([...images, ""]);
  };

  const updateImageUri = (text: string, index: number) => {
    const newImages = [...images];
    newImages[index] = text;
    setImages(newImages);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      triggerHaptic();
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    }
  };

  const handleAddProduct = async () => {
    const validImages = images.filter(img => img.trim() !== "");
    const numericPrice = Number(price);

    if (!title) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setStatusConfig({ type: "error", title: "Missing Name", message: "Please enter a product name." });
      return setStatusVisible(true);
    }

    if (!price || validImages.length === 0) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setStatusConfig({ type: "error", title: "Required Fields", message: "Please fill in price and at least one image." });
      return setStatusVisible(true);
    }

    if (isNaN(numericPrice) || numericPrice <= 0) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setStatusConfig({ type: "error", title: "Invalid Price", message: "Price must be a positive number." });
      return setStatusVisible(true);
    }

    if (stock !== "" && Number(stock) < 0) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setStatusConfig({ type: "error", title: "Invalid Stock", message: "Stock cannot be a negative number." });
      return setStatusVisible(true);
    }

    setLoading(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createProduct({
        title,
        price: numericPrice,
        images: validImages,
        categoryId: categoryId || "",
        bestSeller,
        stock: Number(stock || 0),
      });

      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["bestSellers"] });

      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      setStatusConfig({ type: "success", title: "Success! 🎉", message: "Product listed successfully." });
      setStatusVisible(true);
      
      // Reset form state
      setTitle("");
      setPrice("");
      setImages([""]);
      setStock("");
      setBestSeller(false);

      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      setStatusConfig({ type: "error", title: "Error", message: error.message || "Failed to save." });
      setStatusVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              triggerHaptic();
              router.back();
            }} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Product</Text>
          <View style={{ width: 48 }} /> 
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.imagePreviewScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewContainer}>
            {images.filter(img => img.trim() !== "").length > 0 ? (
              images.filter(img => img.trim() !== "").map((img, idx) => (
                <View key={idx} style={styles.imagePreviewCard}>
                  <Image 
                    source={{ uri: img }} 
                    style={styles.previewImage} 
                    contentFit="cover"
                    transition={500}
                  />
                </View>
              ))
            ) : (
              <View style={[styles.imagePreviewCard, styles.placeholderCard]}>
                <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>Enter URLs to preview</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              placeholder="e.g. Premium Leather Jacket"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Price (₪)</Text>
              <TextInput
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 16 }]}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                placeholder="0"
                value={stock}
                onChangeText={(val) => setStock(val.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Image URLs</Text>
              <TouchableOpacity onPress={addImageField} style={styles.addButtonSmall}>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {images.map((img, index) => (
              <View key={index} style={styles.multiInputWrapper}>
                <TextInput
                  placeholder={`Image URL ${index + 1}`}
                  value={img}
                  onChangeText={(text) => updateImageUri(text, index)}
                  style={[styles.input, { flex: 1 }]}
                  autoCapitalize="none"
                />
                {images.length > 1 && (
                  <TouchableOpacity onPress={() => removeImageField(index)} style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Category</Text>
            {fetchingCats ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {categories.map((cat, index) => (
                  <Animated.View key={cat.id} entering={FadeInRight.delay(index * 50)}>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic();
                        setCategoryId(cat.id);
                      }}
                      style={[
                        styles.chip,
                        categoryId === cat.id && styles.chipSelected
                      ]}
                    >
                      <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextSelected]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchInfo}>
              <View style={styles.switchIconContainer}>
                <Ionicons name="star" size={20} color="#FFB800" />
              </View>
              <View>
                <Text style={styles.switchLabel}>Best Seller</Text>
                <Text style={styles.switchSubLabel}>Feature on home screen</Text>
              </View>
            </View>
            <Switch 
              value={bestSeller} 
              onValueChange={(val) => {
                triggerHaptic();
                setBestSeller(val);
              }}
              trackColor={{ false: "#E9E9E9", true: COLORS.primary }}
              thumbColor={Platform.OS === "ios" ? "#FFFFFF" : bestSeller ? COLORS.primary : "#FFFFFF"}
            />
          </View>

          <TouchableOpacity 
            disabled={loading}
            onPress={handleAddProduct}
            activeOpacity={0.8}
            style={styles.submitButtonContainer}
          >
            <LinearGradient
              colors={[COLORS.primary, "#FF8E8B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.submitText}>Publish Product</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  imagePreviewScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  previewContainer: {
    flexDirection: "row",
  },
  imagePreviewCard: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  placeholderCard: {
    width: width - 48,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  addButtonSmall: {
    padding: 4,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  flex1: {
    flex: 1,
    gap: 8,
  },
  section: {
    marginTop: 10,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 4,
  },
  chipScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontWeight: "700",
    fontSize: 14,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  switchCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  switchSubLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  submitButtonContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButton: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 18,
  },
});