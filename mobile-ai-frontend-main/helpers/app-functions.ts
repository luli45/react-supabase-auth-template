import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Paths } from "expo-file-system";
import uuid from "react-native-uuid";
import * as Application from "expo-application";
import { getString, setString, STORAGE_KEYS } from "@/utils/storage";
import { toast } from "sonner-native";

const getWritableDirectory = () => {
  const baseDir = Paths.document?.uri ?? Paths.cache?.uri;

  if (!baseDir) {
    throw new Error("FileSystem directories are unavailable on this platform.");
  }

  return baseDir.endsWith("/") ? baseDir : `${baseDir}/`;
};

// Get user tracking permission
// This function is important for compliance with privacy regulations
// Dont remove it , because Apple will reject the app if this is not implemented
export const getUserTrackingPermission = async () => {
  if (Platform.OS === "web") {
    return true;
  }
  const { status } = await requestTrackingPermissionsAsync();
  if (status === "granted") {
    return true;
  } else {
    return false;
  }
};

// This is for generating a unique device id for the user
// If you are trying to build with Anonymous Sign In, you should use it in RevenueCat
export const getDeviceId = async () => {
  let deviceId = getString(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      deviceId = iosId || uuid.v4().toString();
    } else {
      deviceId = Application.getAndroidId() || uuid.v4().toString();
    }
    setString(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
};

// This is for showing a toast message
export const showToast = (
  message: string,
  type: "error" | "success" | "warning" | "info"
) => {
  if (type === "error") {
    return toast.error(message, {
      richColors: true,
    });
  } else if (type === "success") {
    return toast.success(message, {
      richColors: true,
    });
  } else if (type === "warning") {
    return toast.warning(message, {
      richColors: true,
    });
  } else if (type === "info") {
    return toast.info(message, {
      richColors: true,
    });
  }
};

export const handleBack = () => {
  router.back();
};

// This is for Fal AI & Replicate Images
export const downloadImage = async ({
  generatedImage,
  setIsDownloading,
}: {
  generatedImage: string;
  setIsDownloading: (isDownloading: boolean) => void;
}) => {
  if (!generatedImage) {
    Alert.alert("Error", "No image to download");
    return;
  }

  try {
    setIsDownloading(true);

    // Request permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant media library permissions to save images"
      );
      return;
    }

    // Generate a unique filename with PNG extension for better quality
    const directory = getWritableDirectory();
    const filename = `shipmobilefast-${Date.now()}.png`;
    const destinationFile = new FileSystem.File(directory, filename);

    // Use new File API to download
    const downloadedFile = await FileSystem.File.downloadFileAsync(
      generatedImage,
      destinationFile
    );

    // Save to media library using the created file URI
    const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
    const album = await MediaLibrary.getAlbumAsync("Ship Mobile Fast");

    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync("Ship Mobile Fast", asset, false);
    }

    Alert.alert("Image saved to your gallery!");
  } catch (error) {
    console.error("Download error:", error);
    Alert.alert("Error", "Failed to download image");
  } finally {
    setIsDownloading(false);
  }
};

// This is for Chat GPT Images
export const saveGeneratedImageToGallery = async ({
  generatedImage,
  setIsDownloading,
}: {
  generatedImage: string | null;
  setIsDownloading: (isDownloading: boolean) => void;
}) => {
  if (!generatedImage || !generatedImage.startsWith("file://")) {
    Alert.alert(
      "Error",
      "Invalid image source for saving. Expected a local file URI."
    );
    return;
  }

  try {
    setIsDownloading(true);

    // Request permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant media library permissions to save images"
      );
      return; // Exit early if permission denied
    }

    // Generate a unique filename for the gallery
    const directory = getWritableDirectory();
    const filename = `shpmblfst-generated-image-${Date.now()}.png`;
    const targetFile = new FileSystem.File(directory, filename);

    // Copy the local file using new File API
    const sourceFile = new FileSystem.File(generatedImage);
    sourceFile.copy(targetFile);

    // Save the copied file to media library
    const asset = await MediaLibrary.createAssetAsync(targetFile.uri);
    const albumName = "Ship Mobile Fast";
    let album = await MediaLibrary.getAlbumAsync(albumName);

    if (!album) {
      album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }

    Alert.alert("Success", "Image saved to your gallery!");
  } catch (error: any) {
    console.error("Save Generated Image error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save image";
    Alert.alert("Error", errorMessage);
  } finally {
    setIsDownloading(false);
  }
};

export function getApiUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (__DEV__) {
    // Android emulator uses 10.0.2.2, iOS simulator uses localhost
    if (Platform.OS === "android") {
      return apiUrl?.replace("localhost", "10.0.2.2");
    }
    // For physical devices, use your computer's IP address
    return apiUrl?.replace("localhost", "192.168.0.242");
  }

  return apiUrl;
}
