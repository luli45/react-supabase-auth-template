import OpenAI from "openai";
import { AppError } from "../middleware/error.middleware";
import { BaseService } from "./base.service";

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "500");

if (isNaN(MAX_TOKENS)) {
  throw new Error("Invalid MAX_TOKENS value");
}

let visionClient: OpenAI | null = null;

function getVisionClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError('OPENAI_API_KEY is not configured for vision', 503);
  }
  if (!visionClient) {
    visionClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return visionClient;
}

export class VisionService extends BaseService {
  static async analyzeImage(
    imageUrl: string,
    prompt: string,
    skipCache: boolean = false
  ): Promise<string> {
    const cacheKey = `vision:${imageUrl}:${prompt}`;

    // Check cache first
    const cachedResponse = await this.getCachedResponse(cacheKey);
    if (cachedResponse && !skipCache) {
      return cachedResponse;
    }
    try {
      const response = await getVisionClient().chat.completions.create({
        // Pick the best model for vision
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        max_tokens: MAX_TOKENS,
      });

      const result = response.choices[0];
      const resultContent = result.message.content || "";

      // Cache the response
      await this.setCachedResponse(cacheKey, resultContent);

      return resultContent;
    } catch (error) {
      console.error("[VisionService] Error generating vision response:", error);
      throw new AppError("Error generating vision response", 500);
    }
  }
}
