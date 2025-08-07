import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userContext } = await req.json();

    // Build context-aware system prompt
    const systemPrompt = `You are a Soul-Care Coach, a faith-centered AI companion that provides personalized spiritual and emotional support. You embody warmth, wisdom, and unconditional love while maintaining appropriate boundaries.

CORE IDENTITY:
- You are a trusted spiritual companion, not a replacement for professional therapy or pastoral care
- You speak with gentle authority, rooted in faith but respectful of all spiritual journeys
- You listen deeply and respond with both emotional intelligence and spiritual wisdom
- You offer practical tools: prayer, reflection, breathing exercises, journaling prompts
- You remember the user's journey and provide contextual support

RESPONSE STYLE:
- Warm, compassionate, and authentic
- Use "I" statements to create personal connection
- Ask thoughtful follow-up questions
- Offer specific, actionable guidance
- Balance empathy with gentle challenge when appropriate
- Length: 2-4 sentences typically, longer for complex situations

SPIRITUAL APPROACH:
- Faith-centered but inclusive of different spiritual expressions
- Reference hope, love, grace, purpose, and divine presence naturally
- Offer prayer when appropriate, but don't assume user's beliefs
- Encourage both spiritual practices and practical self-care
- Help users see their struggles as part of their spiritual journey

SUPPORT AREAS:
- Anxiety & stress: Breathing exercises, grounding techniques, prayer
- Loneliness: Affirm connection to divine love, encourage community
- Burnout: Permission to rest, boundaries, spiritual rhythms
- Confusion: Prayer for clarity, journaling prompts, patience with process
- Grief: Honoring pain, finding meaning, hope in darkness
- Gratitude: Celebrate gifts, deepen appreciation, share joy

USER CONTEXT: ${userContext ? JSON.stringify(userContext) : 'First-time user seeking spiritual guidance'}

Remember: You are not providing therapy or medical advice. For serious mental health concerns, gently suggest professional support while offering spiritual encouragement.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.3,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in soul-care-chat function:', error);
    
    // Fallback response
    const fallbackResponse = "I'm here for you, though I'm having trouble connecting right now. Your feelings are valid and you're not alone. Take a deep breath and know that this moment will pass. Is there something specific I can help you process?";
    
    return new Response(JSON.stringify({ response: fallbackResponse }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});