import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import { createProduct } from "../../../api/Product";
import { getCategories } from "../../../api/Category";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [bestSeller, setBestSeller] = useState(false);

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
      }
    };
    fetchCategories();
  }, []);

  const handleAddProduct = async () => {
    if (!title || !price || !image) {
      return Alert.alert("Error", "Please fill all fields");
    }

    if (!categoryId) {
      return Alert.alert("Error", "Please select a category");
    }

    try {
      await createProduct({
        title,
        price: Number(price),
        image,
        categoryId,
        bestSeller,
      });

      Alert.alert("Success ✅", "Product added successfully");

      setTitle("");
      setPrice("");
      setImage("");
      setBestSeller(false);
      setCategoryId(categories[0]?.id || null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TextInput
        placeholder="Product Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Image URL"
        value={image}
        onChangeText={setImage}
        style={styles.input}
      />

      {/* اختيار الكاتيغوري */}
      <Text style={styles.sectionTitle}>Select Category</Text>

      <View style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryOption,
              categoryId === cat.id && styles.selectedCategory,
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                categoryId === cat.id && styles.selectedCategoryText,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Best Seller */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Best Seller ⭐</Text>
        <Switch value={bestSeller} onValueChange={setBestSeller} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
        <Text style={styles.buttonText}>Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginBottom: 8,
  },

  selectedCategory: {
    backgroundColor: "#d25a58",
  },

  categoryText: {
    fontSize: 14,
  },

  selectedCategoryText: {
    color: "white",
    fontWeight: "600",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  switchText: {
    fontSize: 16,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#d25a58",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});