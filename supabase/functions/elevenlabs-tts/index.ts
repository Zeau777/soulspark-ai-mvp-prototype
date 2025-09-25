import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ElevenLabs default voice and model
const DEFAULT_VOICE_ID = "9BWtsMINqrJLrRacOk9x"; // Aria
const DEFAULT_MODEL_ID = "eleven_turbo_v2_5"; // Low latency, high quality

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId, modelId } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "`text` is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const XI_API_KEY = Deno.env.get("XI_API_KEY");
    if (!XI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing XI_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vId = (voiceId && String(voiceId)) || DEFAULT_VOICE_ID;
    const mId = (modelId && String(modelId)) || DEFAULT_MODEL_ID;

    const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${vId}`;

    const resp = await fetch(elevenUrl, {
      method: "POST",
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: mId,
        // Reasonable defaults; can be customized later via request
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: `ElevenLabs error: ${errText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(
      JSON.stringify({ audioContent: base64Audio, format: "mp3" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e instanceof Error) ? e.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
