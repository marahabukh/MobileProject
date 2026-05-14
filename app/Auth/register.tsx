import BackButton from "@/components/BackButton";
import StatusDialog from "@/components/StatusDialog";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "@/api/UserServices";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
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
  background: "#FFFFFF",
  white: "#FFFFFF",
  textMain: "#1A1A1A",
  textMuted: "#7C7C7C",
  danger: "#FF5252",
  border: "#E0E0E0",
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

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

  const showDialog = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);

    if (type === "success") {

      setTimeout(() => {
        setDialogVisible(false);
        router.replace("/(tabs)");
      }, 1500);
    }
  };

  const onSubmit = async (data: FormData) => {
    triggerHaptic();
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.name);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await saveSecurely("last_reg_name", data.name);
      await saveSecurely("last_login_email", data.email);
      reset();
      showDialog("success", "Welcome!", "Account created successfully. Redirecting...");
    } catch (err: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      showDialog("error", "Registration Failed", err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.headerNav}>
          <BackButton />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInDown.duration(800).springify()} 
            style={styles.formWrapper}
          >
            <View style={styles.headerText}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join our community today</Text>
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
                <TouchableOpacity onPress={() => router.push("/Auth/login")}>
                  <Text style={styles.footerLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusDialog
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerNav: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  formWrapper: {
    width: "100%",
  },
  headerText: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  form: {
    gap: 15,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textMain,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});