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
import { getProductById, getRandomProducts } from "@/api/Product";
import { addToCart } from "@/api/AddToCart";
import ProductCard from "@/components/ProductCard";

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
      Alert.alert("تم إضافة المنتج إلى السلة بنجاح");
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل المنتج</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
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
              inverted
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
              <Text style={styles.price}>₪{product.price}</Text>

              <View style={styles.quantityContainerInline}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setQuantity((prev: number) => Math.max(1, prev - 1))}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setQuantity((prev: number) => prev + 1)}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.inlineAddToCartButton, addingToCart && { opacity: 0.7 }]}
              onPress={handleAddToCart}
              disabled={addingToCart}
            >
              <Text style={styles.buttonText}>
                {addingToCart ? "جاري الإضافة..." : "إضافة إلى السلة"}
              </Text>
            </TouchableOpacity>

            {product?.sizes?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>المقاس</Text>
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
                          selectedSize === size && { color: "#fff" },
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
              <TouchableOpacity onPress={() => router.push("/ProductPage")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>

              <Text style={styles.suggestedTitle}>منتجات ممكن تعجبك</Text>
            </View>

            {loadingRandomProducts ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginTop: 10 }}
              />
            ) : (
              <FlatList
                data={randomProducts}
                horizontal
                inverted
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
    marginLeft: 10,
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
  suggestedSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  suggestedHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  suggestedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "right",
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
    marginLeft: 12,
  },
});