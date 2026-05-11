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
import { registerUser } from "@/api/UserServices";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getSecurely, saveSecurely } from "@/lib/SecureStorage";
import { useEffect } from "react";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const COLORS = {
  primary: "#E35D5B",
  secondary: "#1A1A1A",
  background: "#F8F9FA",
  white: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#7C7C7C",
  danger: "#FF5252",
  border: "rgba(0,0,0,0.05)",
  glass: "rgba(255, 255, 255, 0.9)",
};

export default function RegisterPage() {
  const { width, height } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const loadSavedName = async () => {
      const savedName = await getSecurely("last_reg_name");
      if (savedName) {
        setValue("name", savedName);
      }
    };
    loadSavedName();
  }, []);

  const password = watch("password");

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Attempting registration for:", data.email);
    triggerHaptic();
    setIsLoading(true);
    try {
      const res = await registerUser(data.email, data.password, data.name);
      console.log("REGISTER SUCCESS:", res);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Persist name for next time or for login page
      await saveSecurely("last_reg_name", data.name);
      await saveSecurely("last_login_email", data.email);

      reset();
      Alert.alert(
        "Welcome! 🎉",
        "Your account has been created successfully.",
        [
          {
            text: "Start Shopping",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (err: any) {
      console.error("REGISTER ERROR:", err);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert(
        "Registration Failed", 
        err?.message || "Something went wrong. Please try again.",
        [{ text: "Try Again" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    triggerHaptic();
    router.push("/Auth/login");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/regster.png")}
        style={[styles.backgroundImage, { width, height }]}
        blurRadius={1}
      />
      <View style={styles.darkOverlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerNav}>
            <BackButton />
          </View>

          <Animated.View 
            entering={FadeInDown.duration(800).springify()} 
            style={styles.cardWrapper}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join our community of shoppers</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                        <TextInput
                          placeholder="John Doe"
                          placeholderTextColor="#A0A0A0"
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
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
                      <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                        <TextInput
                          placeholder="you@example.com"
                          placeholderTextColor="#A0A0A0"
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    )}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                        <TextInput
                          placeholder="••••••••"
                          placeholderTextColor="#A0A0A0"
                          secureTextEntry={!showPassword}
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={COLORS.primary} 
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Please confirm password",
                      validate: (val) => val === password || "Passwords don't match",
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMuted} />
                        <TextInput
                          placeholder="••••••••"
                          placeholderTextColor="#A0A0A0"
                          secureTextEntry={!showPassword}
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text style={styles.footerLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  backgroundImage: {
    position: "absolute",
    opacity: 0.8,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerNav: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 32,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: "500",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: "500",
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#FFF8F8",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginLeft: 12,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});