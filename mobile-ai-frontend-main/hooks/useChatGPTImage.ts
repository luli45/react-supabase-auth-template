import { useCallback } from "react";
import { Alert } from "react-native";
import { z } from "zod";
import * as FileSystem from "expo-file-system";
import { Paths } from "expo-file-system";
import { createSecureHeaders } from "@/helpers/api-client";
import { GenerateOptions } from "@/utils/types";
import { useAuth } from "@/context/SupabaseProvider";
import { useDispatch, useSelector } from "@/store";
import {
  setIsGenerating,
  setGeneratedImage,
  setCurrentProvider,
  resetGenerate,
} from "@/store/slices/generateSlice";
import { fetch } from "expo/fetch";
import { getApiUrl } from "@/helpers/app-functions";

// Validation schema
const ImagePromptSchema = z
  .string()
  .min(3, { message: "Prompt must be at least 3 characters long" });

// UPDATED Type definition for the actual backend response structure
interface BackendImageResponse {
  imageUrl: string;
}

export const useGenerate = () => {
  const { user, accessToken } = useAuth();
  const userId = user?.id ?? "";
  const url = getApiUrl();

  const dispatch = useDispatch();
  const { isGenerating, generatedImage } = useSelector(
    (state) => state.generate,
  );

  const generateImage = useCallback(
    async (
      prompt: string,
      options: GenerateOptions,
    ): Promise<string | null> => {
      try {
        dispatch(setIsGenerating(true));
        dispatch(setCurrentProvider(options.provider));
        dispatch(setGeneratedImage(null));

        // Validate prompt
        ImagePromptSchema.parse(prompt);

        const endpoint = `${url}/ai/${options.provider}/generate`;

        // If you want to skip cache, add skipCache to true, like this:
        // const body = { prompt, skipCache: true };
        const body = { prompt, skipCache: true };
        const headers = await createSecureHeaders(userId, accessToken, body);

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (response.status !== 200) {
          // Try to get error text from response
          const errorText = await response.text();
          console.error("Image generation failed:", errorText);
          // Add status to error message
          throw new Error(
            `Image generation failed. Status: ${response.status}`,
          );
        }

        // OLD: Read as raw text
        // const base64Text = await response.text();

        // NEW: Parse the JSON response from the backend
        const responseData: BackendImageResponse = await response.json();

        // --- REMOVE ALL DEBUG LOGS ---

        // NEW: Extract the base64 string from the `imageUrl` field
        const base64Text = responseData?.imageUrl;

        // Check if base64 string exists and is not empty
        if (!base64Text || base64Text.trim().length === 0) {
          console.error(
            "Received empty or invalid base64 data in imageUrl field from backend",
          );
          throw new Error("Received invalid image data from backend");
        }

        // --- Save base64 to a temporary file ---
        const file = new FileSystem.File(
          Paths.cache,
          `generated_image_${Date.now()}.png`,
        );
        // Create the file first
        file.create();
        // Write the base64 content
        file.write(base64Text, { encoding: "base64" });

        // Dispatch the file URI
        dispatch(setGeneratedImage(file.uri));

        // Return the file URI
        return file.uri;
      } catch (error) {
        let errorMessage = "Failed to generate image";
        if (error instanceof z.ZodError) {
          errorMessage = error.issues[0].message;
          Alert.alert("Validation Error", errorMessage);
        } else if (error instanceof Error) {
          // Use the specific error message
          errorMessage = error.message;
          Alert.alert("Error", errorMessage);
        } else {
          Alert.alert("Error", errorMessage);
        }
        // Log the full error
        console.error("Generate Image Error:", error);
        // Ensure generatedImage is cleared on error
        dispatch(setGeneratedImage(null));
        return null;
      } finally {
        dispatch(setIsGenerating(false));
      }
    },
    [dispatch, url, userId, accessToken],
  );

  const reset = useCallback(() => {
    if (generatedImage && generatedImage.startsWith("file://")) {
      // Using the new File API to delete the file
      try {
        const file = new FileSystem.File(generatedImage);
        file.delete();
      } catch (err) {
        console.error("Failed to delete temporary image on reset:", err);
      }
    }
    dispatch(resetGenerate());
  }, [dispatch, generatedImage]);

  return {
    generateImage,
    generatedImage,
    isGenerating,
    reset,
  };
};
