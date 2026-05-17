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
import { getProductById, getRandomProducts } from "@/api/Product";
import { addToCart } from "@/api/AddToCart";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";

const COLORS = {
  primary: "#d25a58",
  background: "#fcf8fb",
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
  const [currentImage, setCurrentImage] = useState<string>("");

  const [randomProducts, setRandomProducts] = useState<any[]>([]);
  const [loadingRandomProducts, setLoadingRandomProducts] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductFromAPI();
      fetchRandomProducts();
    }
  }, [id]);

  const fetchProductFromAPI = async () => {
    try {
      setLoading(true);

      const data = await getProductById(id as string);
      setProduct(data);

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

  const fetchRandomProducts = async () => {
    try {
      setLoadingRandomProducts(true);

      const data = await getRandomProducts(String(id), 4);
      setRandomProducts(data || []);
    } catch (error) {
      console.log("Error fetching random products:", error);
      setRandomProducts([]);
    } finally {
      setLoadingRandomProducts(false);
    }
  };

  const getAvailableStock = () => {
    return Number(
      product?.stock ??
        product?.quantity ??
        product?.availableQuantity ??
        product?.countInStock ??
        0
    );
  };

  const imagesList = product?.images || [product?.image || product?.imageURL];

  const handleAddToCart = async () => {
    try {
      if (!product) {
        Alert.alert("Error", "Product data is not available");
        return;
      }

      setAddingToCart(true);

      const availableStock = getAvailableStock();

      if (availableStock <= 0) {
        Alert.alert("Sorry", "This product is currently out of stock");
        return;
      }

      await addToCart({
        productId: String(product.id || product._id),
        title: product.title || product.name || "",
        price: Number(product.price || 0),
        image: currentImage || product.image || product.imageURL || "",
        quantity,
        size: selectedSize || "",
      });

      Alert.alert("Success", "Product added to cart successfully");
      router.push("/Cart/AddToCartPage");
    } catch (error) {
      console.log("Add to cart error:", error);
      Alert.alert("Error", "Failed to add product to cart");
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
      <BackButton />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Product Details</Text>
          <Text style={styles.subtitle}>View product information and add it to your cart</Text>
        </View>

        <View style={[styles.imageCard, { height: height * 0.38 }]}>
          <Image
            source={{ uri: currentImage }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.thumbnailsContainer}>
          <FlatList
            horizontal
            data={imagesList}
            keyExtractor={(item: any, index: number) => index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: { item: string }) => (
              <TouchableOpacity
                onPress={() => setCurrentImage(item)}
                style={[
                  styles.thumbnailItem,
                  currentImage === item && styles.activeThumbnail,
                ]}
              >
                <Image source={{ uri: item }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{product.title || product.name}</Text>

          <View style={styles.priceQuantityRow}>
            <View>
              <Text style={styles.price}>₪{product.price}</Text>

              <Text style={styles.stockText}>
                Available: {getAvailableStock()} pieces
              </Text>
            </View>

            <View style={styles.quantityContainerInline}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  setQuantity((prev: number) => Math.max(1, prev - 1))
                }
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.qtyButton,
                  quantity >= getAvailableStock() && styles.disabledQtyButton,
                ]}
                onPress={() => {
                  const availableStock = getAvailableStock();

                  if (quantity < availableStock) {
                    setQuantity((prev: number) => prev + 1);
                  } else {
                    Alert.alert(
                      "Sorry",
                      "You have reached the maximum available quantity"
                    );
                  }
                }}
                disabled={quantity >= getAvailableStock()}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.inlineAddToCartButton,
              (addingToCart || getAvailableStock() <= 0) &&
                styles.disabledButton,
            ]}
            onPress={handleAddToCart}
            disabled={addingToCart || getAvailableStock() <= 0}
          >
            <Text style={styles.buttonText}>
              {getAvailableStock() <= 0
                ? "Out of Stock"
                : addingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </Text>
          </TouchableOpacity>

          {product?.sizes?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Size</Text>

              <View style={styles.sizesContainer}>
                {product.sizes.map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.selectedSize,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.selectedSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.suggestedSection}>
          <View style={styles.suggestedHeader}>
            <Text style={styles.suggestedTitle}>Products You Might Like</Text>

            <TouchableOpacity onPress={() => router.push("/ProductPage")}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loadingRandomProducts ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.randomLoading}
            />
          ) : (
            <FlatList
              data={randomProducts}
              horizontal
              keyExtractor={(item: { id: any }) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedList}
              renderItem={({ item }: { item: any }) => (
                <View
                  style={[
                    styles.suggestedCardWrapper,
                    { width: width * 0.48 },
                  ]}
                >
                  <ProductCard
                    id={item.id}
                    title={item.title || item.name}
                    price={item.price}
                    image={item.image || item.imageURL}
                  />
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop: 70,
    paddingBottom: 40,
  },

  header: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    marginBottom: 18,
    fontSize: 14,
    color: "#7a1d4e",
    textAlign: "center",
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
    marginRight: 10,
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
    textAlign: "left",
  },

  price: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 5,
    textAlign: "left",
  },

  stockText: {
    textAlign: "left",
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },

  priceQuantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  quantityContainerInline: {
    flexDirection: "row",
    alignItems: "center",
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

  disabledQtyButton: {
    opacity: 0.5,
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

  inlineAddToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  disabledButton: {
    backgroundColor: "#A1A1A1",
    shadowColor: "#A1A1A1",
    opacity: 0.8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.text,
    textAlign: "left",
  },

  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  sizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
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

  selectedSizeText: {
    color: "#fff",
  },

  suggestedSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },

  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  suggestedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "left",
  },

  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  suggestedList: {
    paddingBottom: 10,
  },

  suggestedCardWrapper: {
    marginRight: 12,
  },

  randomLoading: {
    marginTop: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});