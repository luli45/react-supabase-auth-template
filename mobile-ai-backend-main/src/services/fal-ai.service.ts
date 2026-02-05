import { fal } from '@fal-ai/client';
import { AppError } from '../middleware/error.middleware';
import { BaseService } from './base.service';
import { FalInput, FalResponse } from '../types/express';

let falConfigured = false;

function ensureFalConfigured(): void {
  if (!process.env.FAL_API_KEY) {
    throw new AppError('FAL_API_KEY is not configured', 503);
  }
  if (!falConfigured) {
    fal.config({ credentials: process.env.FAL_API_KEY });
    falConfigured = true;
  }
}

export class FalAIService extends BaseService {
  static async generateImage(
    prompt: string,
    skipCache: boolean = false
  ): Promise<string> {
    ensureFalConfigured();
    const cacheKey = `fal-ai:${prompt}`;

    const cachedResponse = await this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const result = await fal.subscribe('fal-ai/sana', {
        input: {
          prompt,
        } as FalInput,
        logs: false,
      });

      const response = result.data as FalResponse;

      if (!response?.images?.[0]?.url) {
        throw new Error('No image generated');
      }

      const imageUrl = response.images[0].url;
      await this.setCachedResponse(cacheKey, imageUrl);

      return imageUrl;
    } catch (error) {
      throw new AppError('Error generating image with Fal AI', 500);
    }
  }
}
