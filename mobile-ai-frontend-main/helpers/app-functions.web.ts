import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import { toast } from "sonner-native";

// Web stubs for native-only functionality

// Get user tracking permission - not needed on web
export const getUserTrackingPermission = async () => {
  return true;
};

// Device ID for web - use a simple UUID stored in localStorage
export const getDeviceId = async () => {
  let deviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      localStorage.setItem('device_id', deviceId);
    }
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

// Download image - web version
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

    // For web, open image in new tab or trigger download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `image-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Alert.alert("Success", "Image download started");
  } catch (error) {
    console.error("Download error:", error);
    Alert.alert("Error", "Failed to download image");
  } finally {
    setIsDownloading(false);
  }
};

// Save generated image - web version
export const saveGeneratedImageToGallery = async ({
  generatedImage,
  setIsDownloading,
}: {
  generatedImage: string | null;
  setIsDownloading: (isDownloading: boolean) => void;
}) => {
  if (!generatedImage) {
    Alert.alert("Error", "No image to save");
    return;
  }

  await downloadImage({ generatedImage, setIsDownloading });
};

export function getApiUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  return apiUrl;
}
