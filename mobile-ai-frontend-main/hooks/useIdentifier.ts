import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Image as ImageCompressor } from "react-native-compressor";
import { useDispatch, useSelector } from "@/store";
import { createSecureHeaders } from "@/helpers/api-client";
import {
  setImage,
  setLoading,
  setResult,
  reset,
} from "@/store/slices/identifierSlice";
import { useAuth } from "@/context/SupabaseProvider";
import { CompressOptions } from "@/utils/types";
import { fetch } from "expo/fetch";
import { getApiUrl, showToast } from "@/helpers/app-functions";

export const useIdentifier = () => {
  const { user, accessToken } = useAuth();
  const userId = user?.id ?? "";
  const url = getApiUrl();
  const endpoint = "ai/vision";
  const apiUrl = `${url}/${endpoint}`;
  const dispatch = useDispatch();
  const { image, loading, result } = useSelector((state) => state.identifier);

  const compressImage = async (uri: string, options: CompressOptions = {}) => {
    const { maxWidth = 1024, maxHeight = 1024, quality = 0.7 } = options;
    return ImageCompressor.compress(uri, {
      maxWidth,
      maxHeight,
      quality,
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const compressedUri = await compressImage(result.assets[0].uri);
        dispatch(setImage(compressedUri));
        dispatch(setResult(null));
      }
    } catch {
      throw new Error("Failed to pick an image");
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      const compressedUri = await compressImage(imageUri);
      dispatch(setImage(compressedUri));
      dispatch(setResult(null));
      return compressedUri;
    } catch {
      throw new Error("Failed to process image");
    }
  };

  const getMimeType = (uri: string) => {
    const extension = uri.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "png":
        return "image/png";
      case "heic":
      case "heif":
        return "image/heic";
      case "webp":
        return "image/webp";
      case "jpg":
      case "jpeg":
      default:
        return "image/jpeg";
    }
  };

  const identifyImage = async (customPrompt?: string) => {
    if (!image || loading) return;

    dispatch(setLoading(true));
    dispatch(setResult(null));

    try {
      // Use new File API to read base64
      const file = new FileSystem.File(image);
      const base64 = await file.base64();

      const mimeType = getMimeType(image);
      const imageUrl = `data:${mimeType};base64,${base64}`;

      if (!accessToken) {
        throw new Error(
          "Authentication token is missing. Please sign in again."
        );
      }

      const body = {
        imageUrl,
        prompt:
          customPrompt ||
          "You are an AI image analyzer. For any image shared, please: Describe what you see in detail List the main objects/people Note colors and lighting Mention any text visible State the image quality Be clear and specific. If you can't see the image, let me know.",
        // If you want to skip cache, add skipCache to true, like this:
        // skipCache: true,
      };

      const headers = await createSecureHeaders(userId, accessToken, body);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Identifier response parse error:", parseError);
      }

      if (!response.ok) {
        const serverMessage =
          data?.error ??
          data?.message ??
          `Request failed with status ${response.status}`;
        throw new Error(serverMessage);
      }

      if (!data?.response) {
        throw new Error("Unexpected response from server");
      }

      dispatch(setResult(data.response));
      return data.response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to identify image";
      console.error("Identifier error:", error);
      showToast(message, "error");
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const clearIdentifier = () => {
    dispatch(reset());
  };

  return {
    image,
    loading,
    result,
    pickImage,
    processImage,
    identifyImage,
    clearIdentifier,
  };
};
