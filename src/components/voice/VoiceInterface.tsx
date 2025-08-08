import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    // Handle different event types
    if (event.type === "response.audio.delta") {
      onSpeakingChange?.(true);
    } else if (event.type === "response.audio.done") {
      onSpeakingChange?.(false);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);

      toast({ title: "Connected", description: "Voice interface is ready" });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    onSpeakingChange?.(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-background/80 backdrop-blur-md border rounded-xl shadow-spiritual p-3 flex items-center gap-2">
        {!isConnected ? (
          <Button onClick={startConversation} variant="spiritual">
            Start Voice Chat
          </Button>
        ) : (
          <Button onClick={endConversation} variant="secondary">
            End
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceInterface;
