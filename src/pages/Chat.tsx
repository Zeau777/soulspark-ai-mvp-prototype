import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Bot, User, Heart, Sparkles, Volume2, Square } from 'lucide-react';
import { speakText, stopSpeech } from '@/utils/tts';
import VoiceInterface from "@/components/voice/VoiceInterface";
import { useAccess } from '@/hooks/useAccess';
import QuickFeedback from "@/components/feedback/QuickFeedback";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import AdaptiveCoachInterface from "@/components/coach/AdaptiveCoachInterface";
interface Message {
  id: string;
  content: string;
  is_ai_response: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceId, setVoiceId] = useState<string>("alloy");
  const [playingId, setPlayingId] = useState<string | null>(null);
const { user } = useAuth();
const { fullAccess, loading: accessLoading } = useAccess();
const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
const [showSessionFeedback, setShowSessionFeedback] = useState(false);

useEffect(() => {
  if (!user || !fullAccess) return;
  fetchConversations();
}, [user, fullAccess]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        messages (
          id,
          content,
          is_ai_response,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

  if (data) {
      // Show feedback for previous conversation if it had messages
      if (currentConversation && currentConversation.messages.length > 0 && !showSessionFeedback) {
        setShowSessionFeedback(true);
      }
      
      setConversations(data as Conversation[]);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0] as Conversation);
      }
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Soul Conversation',
        context: {}
      })
      .select()
      .single();

    if (data) {
      const newConversation: Conversation = {
        id: data.id,
        title: data.title,
        messages: []
      };
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation || !user) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      // Add user message
      const { data: messageData } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          user_id: user.id,
          content: userMessage,
          is_ai_response: false
        })
        .select()
        .single();

      if (messageData) {
        const newUserMessage: Message = {
          id: messageData.id,
          content: messageData.content,
          is_ai_response: false,
          created_at: messageData.created_at
        };

        // Update current conversation with user message
        setCurrentConversation({
          ...currentConversation,
          messages: [...currentConversation.messages, newUserMessage]
        });

        // Generate AI response using OpenAI
        const aiResponse = await generateAIResponse(userMessage);

        // Add AI response
        const { data: aiMessageData } = await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversation.id,
            content: aiResponse,
            is_ai_response: true
          })
          .select()
          .single();

        if (aiMessageData) {
          const newAIMessage: Message = {
            id: aiMessageData.id,
            content: aiMessageData.content,
            is_ai_response: true,
            created_at: aiMessageData.created_at
          };

          setCurrentConversation({
            ...currentConversation,
            messages: [...currentConversation.messages, newUserMessage, newAIMessage]
          });

          // Track engagement
          await supabase.rpc('update_user_engagement', {
            p_user_id: user.id,
            p_action_type: 'soul_coach_chat',
            p_xp_earned: 15
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Get recent messages for context
      const recentMessages = currentConversation?.messages.slice(-6) || [];
      
      const userContext = {
        recentMessages: recentMessages.map(msg => ({
          content: msg.content,
          is_ai: msg.is_ai_response
        })),
        userProfile: profile ? {
          displayName: profile.display_name,
          currentStreak: profile.current_streak,
          totalXp: profile.total_xp
        } : null
      };

      const { data, error } = await supabase.functions.invoke('soul-care-chat', {
        body: {
          message: userMessage,
          userContext
        }
      });

      if (error) {
        console.error('Error calling soul-care-chat function:', error);
        throw error;
      }

      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to compassionate default response
      return "I'm here for you, though I'm having trouble connecting right now. Your feelings are valid and you're not alone. Take a deep breath and know that this moment will pass. Is there something specific I can help you process?";
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I need peace",
    "Pray with me",
    "I'm grateful today",
    "I feel lost",
    "I'm tired"
  ];

if (accessLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle>Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Preparing your access—please wait...</p>
        </CardContent>
      </Card>
    </div>
  );
}

if (!fullAccess) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle>Soul-Care Coach is Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Full access is available for organization members or legacy subscribers. Use your organization&rsquo;s invite link to get access.
          </p>
          <Button variant="spiritual" onClick={() => (window.location.href = '/partners')}>
            See Organization Plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-full">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Soul-Care Coach</h1>
                <p className="text-sm text-muted-foreground">Always here to listen</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={voiceId} onValueChange={setVoiceId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="ash">Ash</SelectItem>
                <SelectItem value="ballad">Ballad</SelectItem>
                <SelectItem value="coral">Coral</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
                <SelectItem value="verse">Verse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {currentConversation.messages.length === 0 && (
                    <Card className="shadow-spiritual">
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-full">
                            <Heart className="h-8 w-8 text-primary-foreground" />
                          </div>
                        </div>
                        <CardTitle className="text-xl">Welcome to Your Soul-Care Coach</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                          I'm here to provide faith-filled guidance, prayer support, and a listening ear. 
                          Share what's on your heart, or try one of these:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickResponses.map((response) => (
                            <Badge
                              key={response}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary/10"
                              onClick={() => setMessage(response)}
                            >
                              {response}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Session Feedback */}
                  {showSessionFeedback && currentConversation.messages.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <QuickFeedback
                        featureType="chat"
                        contentId={currentConversation.id}
                        onDetailedFeedback={() => setFeedbackModalOpen(true)}
                      />
                    </div>
                  )}
                  
                  {currentConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_ai_response ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.is_ai_response
                            ? 'bg-card shadow-spiritual border'
                            : 'bg-primary text-primary-foreground shadow-glow'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {msg.is_ai_response && (
                            <Bot className="h-5 w-5 text-primary mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <p className={`text-xs ${
                                msg.is_ai_response ? 'text-muted-foreground' : 'text-primary-foreground/70'
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {msg.is_ai_response && (
                                <div className="ml-auto">
                                  {playingId === msg.id ? (
                                    <Button size="sm" variant="outline" onClick={() => { stopSpeech(); setPlayingId(null); }}>
                                      <Square className="h-4 w-4 mr-1" /> Stop
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={async () => {
                                      try {
                                        setPlayingId(msg.id);
                                        await speakText(msg.content, { voice: voiceId });
                                      } catch (e) {
                                        console.error(e);
                                      } finally {
                                        setPlayingId(null);
                                      }
                                    }}>
                                      <Volume2 className="h-4 w-4 mr-1" /> Listen
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {!msg.is_ai_response && (
                            <User className="h-5 w-5 text-primary-foreground mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-card shadow-spiritual border rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-5 w-5 text-primary" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-background/80 backdrop-blur-sm p-4 pb-20">
                <div className="max-w-3xl mx-auto">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Share what's on your heart..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={loading || !message.trim()}
                      variant="spiritual"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="shadow-spiritual">
                <CardContent className="text-center p-8">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Your Soul Conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Begin a new conversation with your AI Soul-Care Coach
                  </p>
                  <Button onClick={createNewConversation} variant="spiritual">
                    New Conversation
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <VoiceInterface onSpeakingChange={() => {}} />
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        featureType="chat"
        contentId={currentConversation?.id}
        onFeedbackSubmitted={() => setShowSessionFeedback(false)}
      />
    </div>
  );
}