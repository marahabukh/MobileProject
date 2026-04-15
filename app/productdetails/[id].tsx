import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
  Alert,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProductById } from "@/api/Product";
import { addToCart } from "@/api/AddToCart";

const COLORS = {
  primary: "#d25a58",
  background: "#F6F6F6",
  card: "#FFFFFF",
  text: "#1E1E1E",
  subText: "#666666",
  border: "#E5E5E5",
};

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // State for switching the main photo
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    if (id) fetchProductFromAPI();
  }, [id]);

  const fetchProductFromAPI = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id as string);
      setProduct(data);
      
      // Set the first image as default
      const defaultImg = data.image || data.imageURL || "";
      setCurrentImage(defaultImg);

      if (data?.sizes?.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (error) {
      console.log("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to handle multiple images (if your API provides an array, use it; otherwise, we use the single one)
  const imagesList = product?.images || [product?.image || product?.imageURL];

  const handleAddToCart = async () => {
    try {
      if (!product) return;
      setAddingToCart(true);
      await addToCart({
        productId: String(product.id),
        title: product.title || product.name || "",
        price: Number(product.price || 0),
        image: currentImage,
        quantity,
        size: selectedSize || "",
      });
      Alert.alert("تم إضافة المنتج إلى السلة ✅");
      router.push("/Cart/AddToCartPage");
    } catch (error) {
      Alert.alert("خطأ", "فشل إضافة المنتج إلى السلة");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* FIXED HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل المنتج</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
          {/* MAIN PHOTO CONTAINER */}
          <View style={[styles.imageCard, { height: height * 0.38 }]}>
            <Image
              source={{ uri: currentImage }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          </View>

          {/* SUB-PHOTOS (THUMBNAILS) */}
          <View style={styles.thumbnailsContainer}>
            <FlatList
              horizontal
              data={imagesList}
              inverted // For RTL support
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => setCurrentImage(item)}
                  style={[
                    styles.thumbnailItem,
                    currentImage === item && styles.activeThumbnail
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              )}
            />
          </View>

<View style={styles.details}>
  <Text style={styles.title}>{product.title || product.name}</Text>

  {/* PRICE + QUANTITY INLINE */}
  <View style={styles.priceQuantityRow}>
    <Text style={styles.price}>₪{product.price}</Text>

    <View style={styles.quantityContainerInline}>
      <TouchableOpacity
        style={styles.qtyButton}
        onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
      >
        <Text style={styles.qtyText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.quantity}>{quantity}</Text>

      <TouchableOpacity
        style={styles.qtyButton}
        onPress={() => setQuantity((prev) => prev + 1)}
      >
        <Text style={styles.qtyText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>

  {/* SIZES SECTION */}
  {product?.sizes?.length > 0 && (
    <>
      <Text style={styles.sectionTitle}>المقاس</Text>
      <View style={styles.sizesContainer}>
        {product.sizes.map((size: string) => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeButton, selectedSize === size && styles.selectedSize]}
            onPress={() => setSelectedSize(size)}
          >
            <Text style={[styles.sizeText, selectedSize === size && { color: "#fff" }]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  )}
</View>
        </ScrollView>

      
<View style={styles.bottomBarWrapper}>
  <TouchableOpacity
    style={[styles.addToCartButton, addingToCart && { opacity: 0.7 }]}
    onPress={handleAddToCart}
    disabled={addingToCart}
  >
    <Text style={styles.buttonText}>
      {addingToCart ? "جاري الإضافة..." : "إضافة إلى السلة"}
    </Text>
  </TouchableOpacity>
</View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
        writingDirection: "rtl",


  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  imageCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailsContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  thumbnailItem: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginLeft: 10, // Margin for RTL
    overflow: "hidden",
  },
  activeThumbnail: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  details: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "right",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 5,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.text,
    textAlign: "right",
  },
  sizesContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  sizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 10,
    marginBottom: 10,
    backgroundColor: COLORS.card,
  },
  selectedSize: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizeText: {
    fontWeight: "600",
    color: COLORS.text,
  },
  quantityContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },
  qtyButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: "700",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 18,
    fontWeight: "700",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
bottomBarWrapper: {
  position: "absolute",
  bottom: 70, // ارتفاع شريط التاب + مسافة
  left: 20,
  right: 20,
  zIndex: 999,
},
addToCartButton: {
  backgroundColor: COLORS.primary,
  paddingVertical: 18,
  borderRadius: 15,
  alignItems: "center",
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
},
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  priceQuantityRow: {
  flexDirection: "row-reverse",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
},
quantityContainerInline: {
  flexDirection: "row-reverse",
  alignItems: "center",
},
});