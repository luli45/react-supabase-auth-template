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
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const { action, materialText, style, question, concept, conversationHistory } = await req.json();

    if (!materialText) {
      throw new Error('materialText is required');
    }

    // Truncate material if too long
    const maxLength = 30000; // Groq has smaller context than Claude
    const truncatedMaterial = materialText.length > maxLength
      ? materialText.substring(0, maxLength) + '\n\n[Material truncated due to length...]'
      : materialText;

    let systemPrompt: string;
    let userMessage: string;
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

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
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
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

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Build messages array with system prompt
    messages.unshift({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userMessage });

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

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
