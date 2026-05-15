import { uploadImageToCloudinary } from "@/api/cloudinary";
import { auth } from "@/api/firebase";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  onAuthStateChanged,
  reload,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [savingName, setSavingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [imageSuccessMessage, setImageSuccessMessage] = useState("");
  const [nameSuccessMessage, setNameSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setImage(currentUser.photoURL || null);
        setAuthLoading(false);
      } else {
        setUser(null);
        setName("");
        setEmail("");
        setImage("");
        setAuthLoading(false);

        router.replace("/Auth/login" as any);
      }
    });

    return unsubscribe;
  }, []);

  const clearSuccessMessages = () => {
    setImageSuccessMessage("");
    setNameSuccessMessage("");
    setPasswordSuccessMessage("");
  };

  const showImageSuccess = () => {
   setImageSuccessMessage("Profile image has been updated successfully");
    setTimeout(() => setImageSuccessMessage(""), 3500);
  };

  const showNameSuccess = () => {
    setNameSuccessMessage("The name has been updated successfully");
    setTimeout(() => setNameSuccessMessage(""), 3500);
  };

  const showPasswordSuccess = () => {
    setPasswordSuccessMessage("The password has been changed successfully");
    setTimeout(() => setPasswordSuccessMessage(""), 3500);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    await reload(auth.currentUser);

    const refreshedUser = auth.currentUser;

    setUser(refreshedUser);
    setName(refreshedUser?.displayName || "");
    setEmail(refreshedUser?.email || "");
    setImage(refreshedUser?.photoURL || null);
  };

  const saveName = async () => {
    if (!auth.currentUser) {
      Alert.alert("error", "You are not logged in");
      return;
    }

    if (!name.trim()) {
      Alert.alert("warning", "Name cannot be empty");
      return;
    }

    try {
      setSavingName(true);
      clearSuccessMessages();

      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
      });

      await refreshUser();

      setEditingName(false);
      showNameSuccess();
    } catch (error) {
      Alert.alert("error", "An error occurred while updating the name");
    } finally {
      setSavingName(false);
    }
  };

  const pickImage = async () => {
    if (!auth.currentUser) {
      Alert.alert("error", "You are not logged in");
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("error", "Permission to access media library is required");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      setImage(imageUri);
      await uploadProfileImage(imageUri);
    } catch (error) {
      Alert.alert("error", "An error occurred while opening the media library");
    }
  };

  const takePhoto = async () => {
    if (!auth.currentUser) {
      Alert.alert("error", "You are not logged in");
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("error", "Permission to access the camera is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      setImage(imageUri);
      await uploadProfileImage(imageUri);
    } catch (error) {
      Alert.alert("error", "An error occurred while opening the camera");
    }
  };

  const selectProfileImage = () => {
    clearSuccessMessages();

    Alert.alert(
      "Edit Profile Image",
      "Choose a method to add a profile image",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!auth.currentUser) return;

    try {
      setUploadingImage(true);
      clearSuccessMessages();

      const { secureUrl } = await uploadImageToCloudinary(imageUri);

      await updateProfile(auth.currentUser, {
        photoURL: secureUrl,
      });

      await refreshUser();

      showImageSuccess();
    } catch (error: any) {
      console.error("Profile image upload error:", error);

      Alert.alert(
        "error",
        error?.message ||
          "An error occurred while uploading the profile image. Please check your Cloudinary settings and try again."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const changePassword = async () => {
    if (!auth.currentUser) {
      Alert.alert("error", "You are not logged in");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("warning", "Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("warning", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("warning", "Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      clearSuccessMessages();

      await updatePassword(auth.currentUser, newPassword);

      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      showPasswordSuccess();
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "error",
          "Firebase requires a recent login before changing the password. Please sign out, then sign in again, then try changing the password."
        );
      } else if (error.code === "auth/weak-password") {
        Alert.alert("error", "The password is too weak");
      } else {
        Alert.alert("error", "An error occurred while changing the password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut(auth);

      router.replace("/Auth/login" as any);
    } catch (error) {
      Alert.alert("error", "An error occurred while logging out");
    } finally {
      setLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d95b5b" />
        <Text style={styles.loadingText}>Loading information...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <BackButton />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account information</Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={selectProfileImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.emptyImage}>
                <Ionicons name="person-outline" size={56} color="#999" />
              </View>
            )}

            <View style={styles.cameraButton}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={19} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.changePhotoText}>Edit Profile Photo</Text>

          {imageSuccessMessage ? (
            <View style={styles.imageSuccessBox}>
              <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
              <Text style={styles.fieldSuccessText}>
                {imageSuccessMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Name</Text>

            <View style={styles.inputRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editingName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                style={[styles.input, !editingName && styles.disabledInput]}
              />

              {editingName ? (
                <TouchableOpacity
                  style={styles.saveNameButton}
                  onPress={saveName}
                >
                  {savingName ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.saveNameText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    setEditingName(true);
                    clearSuccessMessages();
                  }}
                >
                  <Ionicons name="create-outline" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {nameSuccessMessage ? (
              <View style={styles.fieldSuccessBox}>
                <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
                <Text style={styles.fieldSuccessText}>
                  {nameSuccessMessage}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>Email</Text>

            <View style={styles.displayBox}>
              <Text style={styles.displayText}>
                {email || "No email associated"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.passwordInputWrapper}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry={!showNewPassword}
              style={styles.passwordInputWithIcon}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordInputWrapper}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInputWithIcon}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={changePassword}
          >
            {changingPassword ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>

          {passwordSuccessMessage ? (
            <View style={styles.fieldSuccessBox}>
              <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
              <Text style={styles.fieldSuccessText}>
                {passwordSuccessMessage}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {loggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
    paddingTop: 70,
  },

  center: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  header: {
    marginTop: 10,
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#7a1d4e",
    marginTop: 24,
    marginBottom: 18,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#7a1d4e",
     textAlign: "center",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  imageContainer: {
    width: 135,
    height: 135,
    borderRadius: 70,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },

  emptyImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },

  cameraButton: {
    position: "absolute",
    right: 3,
    bottom: 8,
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#d95b5b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777",
  },

  fieldBox: {
    width: "100%",
    marginTop: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    textAlign: "left",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    height: 52,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#eee",
    textAlign: "left",
  },

  disabledInput: {
    color: "#666",
    backgroundColor: "#f1f1f1",
  },

  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#d95b5b",
    alignItems: "center",
    justifyContent: "center",
  },

  saveNameButton: {
    minWidth: 68,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#d95b5b",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
  },

  saveNameText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  displayBox: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#f1f1f1",
    borderRadius: 15,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  displayText: {
    fontSize: 16,
    color: "#666",
    textAlign: "left",
  },

  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginBottom: 16,
    textAlign: "left",
  },

  passwordInputWrapper: {
    width: "100%",
    height: 52,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInputWithIcon: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111",
     textAlign: "left",
  },

  eyeButton: {
    width: 50,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  imageSuccessBox: {
    width: "100%",
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#eaf6ec",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 10,
  },

  fieldSuccessBox: {
    width: "100%",
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#eaf6ec",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 10,
  },

  fieldSuccessText: {
    flex: 1,
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "left",
  },

  changePasswordButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#d95b5b",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  logoutButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});