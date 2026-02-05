const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPTS = {
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
    grammar: `You are a meticulous editor. Correct all grammar, spelling, punctuation, and spacing errors in the provided text. Fix any typos, missing spaces, incorrect capitalization, and formatting issues. Do not change the meaning or content. Return ONLY the corrected text with no explanations or comments.`,
    fluff: `You are a content editor. Remove marketing fluff, advertisements, promotional language, and filler content from the provided text. Keep the core information and meaning intact. Return ONLY the cleaned text with no explanations.`,
    simplify: `You are a writing coach. Rewrite the provided text to be simpler, clearer, and easier to read. Use active voice and short sentences. Break down complex sentences. Return ONLY the simplified text with no explanations.`,
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { action, materialText, style, question, concept, conversationHistory, type } = await req.json();

    if (!materialText) {
      throw new Error('materialText is required');
    }

    // Truncate material if too long
    const maxLength = 100000; // Gemini has larger context window
    const truncatedMaterial = materialText.length > maxLength
      ? materialText.substring(0, maxLength) + '\n\n[Material truncated due to length...]'
      : materialText;

    let systemPrompt: string;
    let userMessage: string;
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    switch (action) {
      case 'summarize':
        systemPrompt = PROMPTS.summarize[style as keyof typeof PROMPTS.summarize] || PROMPTS.summarize.detailed;
        userMessage = `Please summarize this study material:\n\n${truncatedMaterial}`;
        break;

      case 'ask':
        if (!question) throw new Error('question is required for ask action');
        systemPrompt = PROMPTS.ask;

        // Add conversation history if provided
        if (conversationHistory && Array.isArray(conversationHistory)) {
          for (const msg of conversationHistory) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            });
          }
        }

        userMessage = `Based on this study material:\n\n${truncatedMaterial}\n\nQuestion: ${question}`;
        break;

      case 'explain':
        if (!concept) throw new Error('concept is required for explain action');
        systemPrompt = PROMPTS.explain;
        userMessage = `Based on this study material:\n\n${truncatedMaterial}\n\nPlease explain this concept in simple terms: ${concept}`;
        break;

      case 'refine':
        const refineType = (type as keyof typeof PROMPTS.refine) || 'grammar';
        systemPrompt = PROMPTS.refine[refineType] || PROMPTS.refine.grammar;
        userMessage = `Please process this text:\n\n${truncatedMaterial}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Add the user message with system instruction prefix
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
    });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('AI function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        content: ''
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
