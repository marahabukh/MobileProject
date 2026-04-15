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
import { registerUser } from "../../api/UserServices";

export default function RegisterPage() {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset: resetForm,
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data.email, data.password, data.name);

      resetForm();

      navigation.reset({
        index: 0,
        routes: [{ name: "login" }],
      });

    } catch (err: any) {
      Alert.alert("Error", err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72" }}
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
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.brandName}>ElectroShop</Text>
                <Text style={styles.tagline}>Discover the future of shopping 🚀</Text>
              </View>

              <View style={styles.formPanel}>
                <View style={styles.card}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Join our community today</Text>

                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput placeholder="Full Name" style={styles.input} onChangeText={onChange} value={value} />
                        {errors.name && <Text style={styles.error}>{errors.name.message as string}</Text>}
                      </>
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: "Email is required" }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          placeholder="Email Address"
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
                    rules={{ required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={onChange} value={value} />
                        {errors.password && <Text style={styles.error}>{errors.password.message as string}</Text>}
                      </>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} onChangeText={onChange} value={value} />
                        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message as string}</Text>}
                      </>
                    )}
                  />

                  <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Create My Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate("login")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>
                      Already have an account?{" "}
                      <Text style={styles.linkHighlight}>Login</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.mobileContainer}>
              <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join ElectroShop 🚀</Text>

                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput placeholder="Full Name" style={styles.input} onChangeText={onChange} value={value} />
                      {errors.name && <Text style={styles.error}>{errors.name.message as string}</Text>}
                    </>
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Email Address"
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
                  rules={{ required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={onChange} value={value} />
                      {errors.password && <Text style={styles.error}>{errors.password.message as string}</Text>}
                    </>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} onChangeText={onChange} value={value} />
                      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message as string}</Text>}
                    </>
                  )}
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
                  <Text style={styles.buttonText}>Create My Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => navigation.navigate("login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>
                    Already have an account?{" "}
                    <Text style={styles.linkHighlight}>Login</Text>
                  </Text>
                </TouchableOpacity>
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
  backgroundImage: { position: "absolute", width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.78)" },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 30 },
  mainContent: { flex: 1 },

  largeScreenWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    gap: 80,
  },
  leftPanel: { flex: 1, maxWidth: 380 },
  welcomeText: { fontSize: 26, color: "#bae6fd", fontWeight: "500" },
  brandName: { fontSize: 54, fontWeight: "700", color: "#fff", marginVertical: 12 },
  tagline: { fontSize: 20, color: "#e0f2fe", lineHeight: 30 },
  formPanel: { flex: 1, maxWidth: 420, alignItems: "center" },

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
    paddingHorizontal: 28,
    paddingVertical: 38,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },

  title: { fontSize: 30, fontWeight: "700", color: "#bae6fd", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#cbd5e1", textAlign: "center", marginBottom: 32 },

  input: {
    width: "100%",
    backgroundColor: "rgba(51, 65, 85, 0.92)",
    color: "#f1f5f9",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
  },

  error: { color: "#fda4af", fontSize: 13, marginBottom: 10, marginLeft: 6 },

  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 17,
    borderRadius: 16,
    marginTop: 12,
  },

  buttonText: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  linkButton: { marginTop: 24, paddingVertical: 10 },
  linkText: { textAlign: "center", color: "#cbd5e1", fontSize: 15.5 },
  linkHighlight: { color: "#38bdf8", fontWeight: "700" },
});