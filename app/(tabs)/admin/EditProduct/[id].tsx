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
import { getProductById, updateProduct } from "@/api/Product";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

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
};

export default function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [bestSeller, setBestSeller] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, product] = await Promise.all([
          getCategories(),
          getProductById(id as string)
        ]);

        setCategories(cats);
        if (product) {
          setTitle(product.title || "");
          setPrice(String(product.price || ""));
          setImage(product.image || "");
          setStock(String(product.stock || "0"));
          setCategoryId(product.categoryId || null);
          setBestSeller(!!product.bestSeller);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        Alert.alert("Error", "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    if (id) init();
  }, [id]);

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(type);
    }
  }, []);

  const handleUpdateProduct = async () => {
    if (!title || !price || !image) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      return Alert.alert("Required Fields", "Please fill in all details.");
    }

    setSaving(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateProduct(id as string, {
        title,
        price: Number(price),
        image,
        categoryId,
        bestSeller,
        stock: Number(stock),
      });

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert("Success! 🎉", "Product updated successfully.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Fetching product details...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Product</Text>
          <View style={{ width: 48 }} /> 
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.imagePreviewCard}>
          <Image 
            source={{ uri: image || "https://via.placeholder.com/150" }} 
            style={styles.previewImage} 
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.imageOverlay}
          >
            <Text style={styles.imageTitleOverlay}>{title || "Product Image"}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              placeholder="Product Title"
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
                onChangeText={setStock}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              placeholder="https://..."
              value={image}
              onChangeText={setImage}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
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
            disabled={saving}
            onPress={handleUpdateProduct}
            activeOpacity={0.8}
            style={styles.submitButtonContainer}
          >
            <LinearGradient
              colors={[COLORS.primary, "#FF8E8B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.submitText}>Save Changes</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loaderText: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "500",
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
  imagePreviewCard: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
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
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  imageTitleOverlay: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
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
