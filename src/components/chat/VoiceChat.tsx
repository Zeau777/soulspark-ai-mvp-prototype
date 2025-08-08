import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";

const VoiceChat: React.FC = () => {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string>(
    typeof localStorage !== "undefined" ? localStorage.getItem("elevenlabs_agent_id") || "" : ""
  );

  const conversation = useConversation({
    onConnect: () => {
      toast({ title: "Voice chat connected", description: "You can start speaking now." });
    },
    onDisconnect: () => {
      toast({ title: "Voice chat ended" });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Voice chat error", description: msg, variant: "destructive" });
    },
  });

  const start = async () => {
    try {
      if (!agentId) {
        toast({ title: "Agent ID required", description: "Enter your ElevenLabs Agent ID to start." });
        return;
      }

      // Request mic permission upfront for better UX
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await conversation.startSession({ agentId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start voice chat";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const stop = async () => {
    try {
      await conversation.endSession();
    } catch (e) {
      // no-op
    }
  };

  useEffect(() => {
    if (!agentId) return;
    try {
      localStorage.setItem("elevenlabs_agent_id", agentId);
    } catch (_) {}
  }, [agentId]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-background/80 backdrop-blur-md border rounded-xl shadow-spiritual p-3 flex items-center gap-2">
        {conversation.status !== "connected" ? (
          <>
            <Input
              placeholder="ElevenLabs Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-64"
            />
            <Button onClick={start} variant="spiritual">Start Voice Chat</Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground px-2">Speaking: {conversation.isSpeaking ? "Yes" : "No"}</div>
            <Button onClick={stop} variant="secondary">End</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
