import supabase from '../supabase';
import type { StudyMaterialMessage } from '../types/studyMaterial';

const AI_FUNCTION_URL = import.meta.env.VITE_AI_FUNCTION_URL || '/api/ai';

interface AIRequestBase {
  action: 'summarize' | 'ask' | 'explain' | 'refine';
  materialText: string;
}

interface SummarizeRequest extends AIRequestBase {
  action: 'summarize';
  style?: 'brief' | 'detailed' | 'bullet-points';
}

interface AskRequest extends AIRequestBase {
  action: 'ask';
  question: string;
  conversationHistory?: StudyMaterialMessage[];
}

interface ExplainRequest extends AIRequestBase {
  action: 'explain';
  concept: string;
}

interface RefineRequest extends AIRequestBase {
  action: 'refine';
  type: 'grammar' | 'fluff' | 'simplify';
}

type AIRequest = SummarizeRequest | AskRequest | ExplainRequest | RefineRequest;

interface AIResponse {
  content: string;
  error?: string;
}

async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': anonKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'AI request failed',
    };
  }
}

export const aiService = {
  /**
   * Generate a summary of the study material
   */
  async summarize(
    materialText: string,
    style: 'brief' | 'detailed' | 'bullet-points' = 'detailed'
  ): Promise<AIResponse> {
    return callAI({
      action: 'summarize',
      materialText,
      style,
    });
  },

  /**
   * Ask a question about the study material
   */
  async ask(
    materialText: string,
    question: string,
    conversationHistory?: StudyMaterialMessage[]
  ): Promise<AIResponse> {
    return callAI({
      action: 'ask',
      materialText,
      question,
      conversationHistory,
    });
  },

  /**
   * Explain a specific concept from the material
   */
  async explain(materialText: string, concept: string): Promise<AIResponse> {
    return callAI({
      action: 'explain',
      materialText,
      concept,
    });
  },

  /**
   * Refine text (grammar, de-fluff, simplify)
   */
  async refine(
    materialText: string,
    type: 'grammar' | 'fluff' | 'simplify' = 'grammar'
  ): Promise<AIResponse> {
    return callAI({
      action: 'refine',
      materialText,
      type,
    });
  },
};

// System prompts for AI interactions
export const AI_PROMPTS = {
  summarize: {
    brief: `You are a study assistant helping a neurodivergent learner. Summarize the following study material in 2-3 paragraphs. Focus on the key concepts and main takeaways. Use clear, simple language.`,
    detailed: `You are a study assistant helping a neurodivergent learner. Provide a comprehensive summary of the following study material. Include:
- Main concepts and ideas
- Key definitions
- Important relationships between concepts
- Practical applications if relevant

Use clear, structured formatting with headers where appropriate.`,
    'bullet-points': `You are a study assistant helping a neurodivergent learner. Summarize the following study material as bullet points. Group related points together. Keep each point concise but informative.`,
  },
  ask: `You are a patient and supportive study assistant helping a neurodivergent learner understand their study material. Answer questions based ONLY on the provided material. If the answer isn't in the material, say so clearly. Use simple, clear language and provide examples when helpful.`,
  explain: `You are a patient tutor explaining concepts to a neurodivergent learner. Explain the requested concept in simple terms, using analogies and examples. Break down complex ideas into smaller, digestible parts.`,
  refine: {
    grammar: `You are a meticulous editor. Correct all grammar, spelling, punctuation, and spacing errors in the provided text. Do not change the meaning. Return ONLY the corrected text.`,
    fluff: `You are a content editor. Remove marketing fluff, advertisements, and filler content from the provided text. Keep the core information and meaning intact. Return ONLY the cleaned text.`,
    simplify: `You are a writing coach. Rewrite the provided text to be simpler, clearer, and easier to read. Use active voice and short sentences. Return ONLY the simplified text.`
  }
};
