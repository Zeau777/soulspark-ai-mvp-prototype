import { supabase } from "@/integrations/supabase/client";

let currentAudio: HTMLAudioElement | null = null;

function base64ToBlob(base64: string, contentType = "audio/mpeg") {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

export async function speakText(text: string, opts?: { voice?: string; voiceId?: string; modelId?: string }) {
  if (!text) return;

  // Stop any currently playing audio
  if (currentAudio) {
    try { currentAudio.pause(); } catch (_) {}
    currentAudio = null;
  }

  const { data, error } = await supabase.functions.invoke("openai-tts", {
    body: {
      text,
      voice: opts?.voice || "alloy",
    },
  });

  if (error) throw error;
  const base64: string = (data as any)?.audioContent;
  if (!base64) throw new Error("No audio returned from TTS");

  const blob = base64ToBlob(base64, "audio/mpeg");
  const url = URL.createObjectURL(blob);
  currentAudio = new Audio(url);
  await currentAudio.play();
  return { url, audio: currentAudio };
}

export function stopSpeech() {
  if (currentAudio) {
    try { currentAudio.pause(); } catch (_) {}
    currentAudio = null;
  }
}
