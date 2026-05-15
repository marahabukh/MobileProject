import AsyncStorage from "@react-native-async-storage/async-storage";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

const CLOUDINARY_SETTINGS_KEY = "@cloudinary_settings";
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dd0stau8y"; 
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = "shuroqqqq12"; 

export type CloudinarySettings = {
  cloudName: string;
  uploadPreset: string;
};

export const emptyCloudinarySettings: CloudinarySettings = {
  cloudName: DEFAULT_CLOUDINARY_CLOUD_NAME,
  uploadPreset: DEFAULT_CLOUDINARY_UPLOAD_PRESET,
};

export const normalizeCloudinarySettings = (
  settings: CloudinarySettings,
): CloudinarySettings => ({
  cloudName: settings.cloudName.trim(),
  uploadPreset: settings.uploadPreset.trim(),
});

export const isCloudinaryConfigured = (settings: CloudinarySettings) => {
  const normalized = normalizeCloudinarySettings(settings);
  return Boolean(normalized.cloudName && normalized.uploadPreset);
};

export const getCloudinarySettings = async (): Promise<CloudinarySettings> => {
  const raw = await AsyncStorage.getItem(CLOUDINARY_SETTINGS_KEY);
  if (!raw) return emptyCloudinarySettings;

  try {
    const parsed = JSON.parse(raw) as Partial<CloudinarySettings>;
    return {
      cloudName: parsed.cloudName || DEFAULT_CLOUDINARY_CLOUD_NAME,
      uploadPreset: parsed.uploadPreset || DEFAULT_CLOUDINARY_UPLOAD_PRESET,
    };
  } catch {
    return emptyCloudinarySettings;
  }
};

export const saveCloudinarySettings = async (settings: CloudinarySettings) => {
  await AsyncStorage.setItem(
    CLOUDINARY_SETTINGS_KEY,
    JSON.stringify(normalizeCloudinarySettings(settings)),
  );
};

export const uploadImageToCloudinary = async (uri: string) => {
  const settings = normalizeCloudinarySettings(await getCloudinarySettings());

  if (!isCloudinaryConfigured(settings)) {
    throw new Error("Please set up Cloudinary from the settings page first.");
  }

  const fileName = `profile_${Date.now()}.jpg`;
  const mimeType = "image/jpeg";
  const formData = new FormData();

  if (uri.startsWith("data:")) {
    formData.append("file", uri);
  } else {
    (formData as any).append("file", {
      uri,
      name: fileName,
      type: mimeType,
    });
  }

  formData.append("upload_preset", settings.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    settings.cloudName,
  )}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = (await response
    .json()
    .catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok || !data?.secure_url) {
    const errorMessage =
      data?.error?.message ||
      `Image upload to Cloudinary failed (${response.status})`;
    console.error("Cloudinary upload error:", data, errorMessage);
    throw new Error(errorMessage);
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id ?? "",
    optimizedUrl: data.secure_url,
  };
};
