import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Bot, User, Heart, Sparkles } from 'lucide-react';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

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

        // Generate AI response (simple pre-scripted for now)
        const aiResponse = generateAIResponse(userMessage);

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

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worry') || lowerMessage.includes('stress')) {
      return "I hear you, and I want you to know that your feelings are valid. When anxiety visits, remember that you are not alone. Take three deep breaths with me: breathe in peace, hold it, and release the worry. God sees you in this moment and loves you completely. Would you like to try a short breathing exercise together, or would you prefer to talk more about what's on your heart?";
    }
    
    if (lowerMessage.includes('lost') || lowerMessage.includes('direction') || lowerMessage.includes('purpose')) {
      return "Feeling lost is part of the human journey, and it takes courage to acknowledge it. You are exactly where you need to be, even if the path ahead seems unclear. Sometimes God uses these seasons of uncertainty to prepare us for something beautiful. Your worth isn't defined by having all the answers. Would you like to explore what gives you hope, or shall we pray together for clarity?";
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('energy')) {
      return "Rest is not a luxury; it's a necessity for your soul. Even Jesus withdrew to quiet places to restore His spirit. Your exhaustion is real, and it's okay to acknowledge your limits. Consider this an invitation to be gentle with yourself today. What would it look like to give yourself permission to rest? Sometimes the most spiritual thing we can do is simply pause and receive love.";
    }
    
    if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful') || lowerMessage.includes('blessing')) {
      return "What a beautiful heart you have! Gratitude is like sunlight for the soul - it illuminates the goodness that's already present. Your thankfulness is a prayer in itself, and it blesses not just you but everyone around you. This grateful spirit you're cultivating is a gift that keeps giving. What specific moment today filled your heart with this gratitude?";
    }
    
    if (lowerMessage.includes('pray') || lowerMessage.includes('prayer')) {
      return "Prayer is simply having a conversation with Love itself. There's no wrong way to pray - whether it's words, silence, tears, or even doubts. Your heart is heard before you even speak. Would you like to share what's on your heart, or shall we sit in quiet prayer together? Remember, sometimes the most powerful prayers are the ones where we simply show up as we are.";
    }
    
    // Default response
    return "Thank you for sharing with me. Your words matter, and so do you. I'm here to listen and walk alongside you in whatever you're experiencing. Every soul journey has its seasons - times of growth, rest, challenge, and celebration. What you're feeling right now is part of your unique story. How can I support you today? Would you like to talk more, explore some breathing exercises, or perhaps end with a moment of prayer?";
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I need peace",
    "Pray with me",
    "I'm grateful today",
    "I feel lost",
    "I'm tired"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-4">
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
                            <p className={`text-xs mt-2 ${
                              msg.is_ai_response ? 'text-muted-foreground' : 'text-primary-foreground/70'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
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
              <div className="border-t bg-background/80 backdrop-blur-sm p-4">
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
      </div>
    </div>
  );
}