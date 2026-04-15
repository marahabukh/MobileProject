import BackButton from "@/components/BackButton";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { loginUser } from "../../api/UserServices";

export default function LoginPage() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await loginUser(data.email, data.password);

      Alert.alert("Success", `Welcome back, ${res.user.displayName || "User"} ⚡`);

      // يروح مباشرة على صفحة المنتجات بعد النجاح
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Product" }],     // ← غيري "Products" لو اسم الشاشة مختلف
        });
      }, 800); // تأخير بسيط عشان يشوف الـ Alert

    } catch (err: any) {
      Alert.alert("Error", err.message || "Login failed");
    }
  };

  const goToRegister = () => {
    navigation.navigate("registor");   // صححت الاسم من "registor" إلى "Register"
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1518770660439-4636190af475" }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BackButton />
        <View style={styles.mainContent}>
          {isLargeScreen ? (
            <View style={styles.largeScreenWrapper}>
              <View style={styles.leftPanel}>
                <Text style={styles.welcomeText}>Welcome back to</Text>
                <Text style={styles.brandName}>ElectroShop</Text>
                <Text style={styles.tagline}>Sign in to continue shopping</Text>
              </View>

              <View style={styles.formPanel}>
                <View style={styles.card}>
                  <Text style={styles.title}>Login</Text>
                  <Text style={styles.subtitle}>Enter your credentials</Text>

                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: "Email is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          placeholder="Email Address"
                          placeholderTextColor="#94a3b8"
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message as string}</Text>}
                      </>
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: "Password is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          placeholder="Password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.password && <Text style={styles.error}>{errors.password.message as string}</Text>}
                      </>
                    )}
                  />

                  <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Sign In</Text>
                  </TouchableOpacity>

                  <View style={styles.registerLinkContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={goToRegister}>
                      <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // تصميم الجوال
            <View style={styles.mobileContainer}>
              <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Welcome back! 👋</Text>

                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Email Address"
                        placeholderTextColor="#94a3b8"
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {errors.email && <Text style={styles.error}>{errors.email.message as string}</Text>}
                    </>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password is required" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                      />
                      {errors.password && <Text style={styles.error}>{errors.password.message as string}</Text>}
                    </>
                  )}
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.registerLinkContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={goToRegister}>
                    <Text style={styles.registerLink}>Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },

  mainContent: { flex: 1 },

  largeScreenWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    gap: 80,
  },

  leftPanel: {
    flex: 1,
    maxWidth: 380,
  },

  welcomeText: {
    fontSize: 26,
    color: "#bae6fd",
    fontWeight: "500",
  },

  brandName: {
    fontSize: 54,
    fontWeight: "700",
    color: "#ffffff",
    marginVertical: 12,
  },

  tagline: {
    fontSize: 20,
    color: "#e0f2fe",
    lineHeight: 30,
  },

  formPanel: {
    flex: 1,
    maxWidth: 420,
    alignItems: "center",
  },

  mobileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 41, 59, 0.96)",
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 45,
    elevation: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#bae6fd",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 32,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(51, 65, 85, 0.92)",
    color: "#f1f5f9",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
  },

  error: {
    color: "#fda4af",
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 6,
  },

  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 17,
    borderRadius: 16,
    marginTop: 16,
  },

  buttonText: {
    color: "#0f172a",
    fontSize: 17.5,
    fontWeight: "700",
    textAlign: "center",
  },

  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  registerText: {
    color: "#cbd5e1",
    fontSize: 15,
  },

  registerLink: {
    color: "#38bdf8",
    fontSize: 15,
    fontWeight: "600",
  },
});