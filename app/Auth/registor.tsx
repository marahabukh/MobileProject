import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
import { registerUser } from "@/api/UserServices";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const COLORS = {
  primary: "#d25a58",
  primarySoft: "#fff1ef",
  background: "#f8f5f4",
  card: "rgba(255,255,255,0.95)",
  text: "#1e1e1e",
  subText: "#6b7280",
  inputBg: "#fffaf9",
  border: "#eadfdb",
  danger: "#dc2626",
  white: "#ffffff",
  overlay: "rgba(40, 20, 20, 0.34)",
};

export default function RegisterPage() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      await registerUser(data.email, data.password, data.name);

      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      Alert.alert("Success", "Account created successfully 🎉", [
        {
          text: "Continue",
          onPress: () => router.replace("/Auth/login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/Auth/login");
  };

  const renderForm = () => (
    <>
      <Controller
        name="name"
        control={control}
        rules={{ required: "Name is required" }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
              style={[styles.input, errors.name && styles.inputError]}
              onChangeText={onChange}
              value={value}
            />
            {errors.name && (
              <Text style={styles.error}>{errors.name.message}</Text>
            )}
          </View>
        )}
      />

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
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              style={[styles.input, errors.email && styles.inputError]}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: "Password is required",
          minLength: { value: 6, message: "At least 6 characters" },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={[styles.input, errors.password && styles.inputError]}
              onChangeText={onChange}
              value={value}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: "Confirm your password",
          validate: (value) =>
            value === password || "Passwords do not match",
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Re-enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              onChangeText={onChange}
              value={value}
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>
                {errors.confirmPassword.message}
              </Text>
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
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={goToLogin}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/regster.png")}
        style={styles.backgroundImage}
      />

      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, isLargeScreen && styles.largeCard]}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us and start your shopping journey
          </Text>
          {renderForm()}
        </View>
      </ScrollView>
    </View>
  );
}

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

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 24,
    width: "100%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  largeCard: {
    maxWidth: 460,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "800",
  },

  subtitle: {
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },

  fieldWrapper: {
    marginBottom: 14,
  },

  label: {
    color: COLORS.text,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
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
    color: COLORS.white,
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 18,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});