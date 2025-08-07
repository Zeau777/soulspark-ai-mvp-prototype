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
    
    // Emotional support keywords
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worry') || lowerMessage.includes('stress') || lowerMessage.includes('nervous') || lowerMessage.includes('panic')) {
      return "I hear you, and I want you to know that your feelings are valid. When anxiety visits, remember that you are not alone. Take three deep breaths with me: breathe in peace, hold it, and release the worry. God sees you in this moment and loves you completely. Would you like to try a short breathing exercise together, or would you prefer to talk more about what's on your heart?";
    }
    
    if (lowerMessage.includes('lost') || lowerMessage.includes('direction') || lowerMessage.includes('purpose') || lowerMessage.includes('confused') || lowerMessage.includes('uncertain')) {
      return "Feeling lost is part of the human journey, and it takes courage to acknowledge it. You are exactly where you need to be, even if the path ahead seems unclear. Sometimes God uses these seasons of uncertainty to prepare us for something beautiful. Your worth isn't defined by having all the answers. Would you like to explore what gives you hope, or shall we pray together for clarity?";
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('energy') || lowerMessage.includes('weary') || lowerMessage.includes('drained')) {
      return "Rest is not a luxury; it's a necessity for your soul. Even Jesus withdrew to quiet places to restore His spirit. Your exhaustion is real, and it's okay to acknowledge your limits. Consider this an invitation to be gentle with yourself today. What would it look like to give yourself permission to rest? Sometimes the most spiritual thing we can do is simply pause and receive love.";
    }
    
    if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful') || lowerMessage.includes('blessing') || lowerMessage.includes('appreciate') || lowerMessage.includes('blessed')) {
      return "What a beautiful heart you have! Gratitude is like sunlight for the soul - it illuminates the goodness that's already present. Your thankfulness is a prayer in itself, and it blesses not just you but everyone around you. This grateful spirit you're cultivating is a gift that keeps giving. What specific moment today filled your heart with this gratitude?";
    }
    
    if (lowerMessage.includes('pray') || lowerMessage.includes('prayer') || lowerMessage.includes('praying')) {
      return "Prayer is simply having a conversation with Love itself. There's no wrong way to pray - whether it's words, silence, tears, or even doubts. Your heart is heard before you even speak. Would you like to share what's on your heart, or shall we sit in quiet prayer together? Remember, sometimes the most powerful prayers are the ones where we simply show up as we are.";
    }
    
    // Sadness and grief
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('grief') || lowerMessage.includes('mourning') || lowerMessage.includes('hurt')) {
      return "Your pain is real and your heart matters. It's okay to sit with sadness - it doesn't mean you lack faith, it means you're human. Even Jesus wept. Allow yourself to feel what you're feeling while knowing that this season, though difficult, will not last forever. You are held in love even in your darkest moments. What would bring you the smallest bit of comfort right now?";
    }
    
    // Anger and frustration
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad') || lowerMessage.includes('upset') || lowerMessage.includes('irritated')) {
      return "Your anger tells me something important is happening in your heart. Anger often masks other feelings like hurt, fear, or feeling unheard. It's okay to feel this way - even righteous anger exists. Let's breathe together and see what's underneath this feeling. What has stirred your heart so deeply? Your emotions are welcome here, and so are you.";
    }
    
    // Fear and doubt
    if (lowerMessage.includes('afraid') || lowerMessage.includes('scared') || lowerMessage.includes('fear') || lowerMessage.includes('doubt') || lowerMessage.includes('worried')) {
      return "Fear whispers lies, but love speaks truth. What you're feeling is understandable - uncertainty can be frightening. But remember, courage isn't the absence of fear; it's moving forward despite it. You don't have to see the whole staircase to take the next step. What small step of faith feels possible today? I'm here to walk with you.";
    }
    
    // Hope and encouragement
    if (lowerMessage.includes('hope') || lowerMessage.includes('encourage') || lowerMessage.includes('strength') || lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
      return "Hope is like a sunrise - even in our darkest nights, it promises a new day. Your desire for hope tells me your spirit is alive and reaching for light. That reaching itself is beautiful. Sometimes hope starts small, like a mustard seed, but it grows. What tiny seed of hope can you plant in your heart today? Let's nurture it together.";
    }
    
    // Relationships
    if (lowerMessage.includes('relationship') || lowerMessage.includes('marriage') || lowerMessage.includes('family') || lowerMessage.includes('friend') || lowerMessage.includes('conflict')) {
      return "Relationships are where our hearts learn to love and be loved. They can be our greatest joys and our deepest challenges. Every relationship is an opportunity to practice grace, forgiveness, and understanding. What's stirring in your heart about your relationships? Sometimes the most healing thing we can do is simply be heard and understood.";
    }
    
    // Forgiveness
    if (lowerMessage.includes('forgive') || lowerMessage.includes('forgiveness') || lowerMessage.includes('guilt') || lowerMessage.includes('shame') || lowerMessage.includes('sorry')) {
      return "Forgiveness is one of the most powerful gifts we can give ourselves and others. It doesn't excuse what happened, but it frees your heart from carrying that weight. Whether you need to forgive yourself or someone else, remember that forgiveness is a journey, not a destination. Grace covers what guilt cannot fix. What would it feel like to release this burden?";
    }
    
    // Faith and spiritual questions
    if (lowerMessage.includes('faith') || lowerMessage.includes('god') || lowerMessage.includes('jesus') || lowerMessage.includes('believe') || lowerMessage.includes('spiritual')) {
      return "Your spiritual journey is uniquely yours, and every question, doubt, and wonder is part of that sacred path. Faith isn't about having all the answers - it's about staying open to love, mystery, and growth. God meets us exactly where we are, not where we think we should be. What's stirring in your heart about faith today?";
    }
    
    // Greetings and general conversation
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good evening')) {
      return "Hello, beautiful soul! I'm so glad you're here. This is a safe space where your heart can be heard and your spirit can find rest. What's on your heart today? Whether it's joy to celebrate or burdens to share, I'm here to listen with love and walk alongside you.";
    }
    
    // Default responses array for variety
    const defaultResponses = [
      "Thank you for sharing with me. Your words matter, and so do you. I'm here to listen and walk alongside you in whatever you're experiencing. What would be most helpful for you right now?",
      "I can sense there's something meaningful you want to express. Every soul journey has its unique path, and yours matters deeply. How are you feeling in this moment?",
      "Your heart is welcome here, just as it is. Sometimes the most powerful conversations begin with simply being present together. What's stirring within you today?",
      "I'm honored that you've chosen to share this space with me. Whatever you're experiencing - joy, struggle, questions, or peace - it all has a place here. What feels most important to talk about?",
      "There's something beautiful about this moment of connection. Your thoughts and feelings are important, and I'm here to truly listen. What would you like to explore together?"
    ];
    
    // Return a random default response for variety
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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