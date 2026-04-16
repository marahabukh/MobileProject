import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { loginUser } from "@/api/UserServices";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const res = await loginUser(data.email, data.password);

      Alert.alert(
        "Welcome back! ⚡",
        `Hello, ${res?.displayName || res?.name || res?.email || "User"}`
      );

      router.replace("/(tabs)")
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      Alert.alert(
        "Login Failed",
        err?.message || "Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push("/Auth/registor");
  };

  const renderForm = () => (
    <>
      <Controller
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputRow, errors.email && styles.inputError]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                style={styles.input}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[styles.inputRow, errors.password && styles.inputError]}
            >
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                style={styles.input}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "🙈" : "👁"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerLinkContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.registerLink}> Register</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
   <Image
  source={require("@/assets/images/login.jpg")}
  style={styles.backgroundImage}
/>
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BackButton />

        {isLargeScreen ? (
          <View style={styles.largeScreenWrapper}>
            <View style={styles.leftPanel}>
              <Text style={styles.welcomeText}>Welcome back to</Text>
              <Text style={styles.brandName}>ElectroShop</Text>
              <Text style={styles.tagline}>
                Sign in to continue shopping
              </Text>
            </View>

            <View style={styles.formPanel}>
              <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>
                  Enter your credentials
                </Text>
                {renderForm()}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mobileContainer}>
            <View style={styles.card}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Welcome back! 👋</Text>
              {renderForm()}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const COLORS = {
  primary: "#d25a58",
  background: "#F6F6F6",
  card: "#FFFFFF",
  text: "#1E1E1E",
  subText: "#666666",
  border: "#E5E5E5",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },

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
    fontSize: 24,
    color: "#fff5f4",
    marginBottom: 6,
  },

  brandName: {
    fontSize: 52,
    color: "#ffffff",
    fontWeight: "800",
    marginBottom: 10,
  },

  tagline: {
    color: "#f8d7d3",
    fontSize: 16,
    lineHeight: 24,
  },

  formPanel: {
    flex: 1,
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
    maxWidth: 420,
    backgroundColor: COLORS.card,
    padding: 28,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    fontSize: 30,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: {
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },

  fieldWrapper: {
    marginBottom: 16,
  },

  label: {
    color: COLORS.text,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "600",
  },

  inputRow: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },

  inputIcon: {
    marginRight: 10,
    color: COLORS.primary,
    fontSize: 16,
  },

  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1.2,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#fff",
    fontSize: 16,
  },

  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  registerText: {
    color: COLORS.subText,
    fontSize: 14,
  },

  registerLink: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  eyeButton: {
    marginLeft: 10,
  },

  eyeIcon: {
    color: COLORS.primary,
    fontSize: 16,
  },
});