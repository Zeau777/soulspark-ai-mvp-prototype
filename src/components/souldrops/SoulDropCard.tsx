import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Share2, 
  Volume2, 
  Square,
  Sparkles, 
  MoreHorizontal,
  Target,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { speakText, stopSpeech } from '@/utils/tts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SoulDropCardProps {
  drop: Tables<'soul_drops'>;
  isLiked: boolean;
  onLike: (dropId: string) => void;
  onMoreLikeThis: (tags: string[]) => void;
  onFeedback: (dropId: string) => void;
  showCollectible?: boolean;
}

const SoulDropCard: React.FC<SoulDropCardProps> = ({
  drop,
  isLiked,
  onLike,
  onMoreLikeThis,
  onFeedback,
  showCollectible = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [resonanceCount, setResonanceCount] = useState(drop.likes_count || 0);
  const [showMicroChallenge, setShowMicroChallenge] = useState(false);

  // Generate card background based on content type and mood
  const getCardStyle = () => {
    const baseStyle = "transition-all duration-500 hover:shadow-spiritual group cursor-pointer";
    
    if (showCollectible) {
      // Collectible soul card design with beautiful gradients
      return `${baseStyle} bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20 hover:border-primary/40`;
    }
    
    return baseStyle;
  };

  // Get micro-challenge based on drop content
  const getMicroChallenge = () => {
    const challenges = [
      "Text someone one thing you appreciate about them today",
      "Take 3 deep breaths and notice how you feel",
      "Write down one thing you're grateful for right now",
      "Smile at the next person you see",
      "Share this wisdom with someone who needs it",
      "Set an intention for the next hour"
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  };

  useEffect(() => {
    // Randomly show micro-challenges for some drops
    if (Math.random() < 0.3) { // 30% chance
      setShowMicroChallenge(true);
    }
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: drop.title,
      text: drop.content,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        
        // Track sharing engagement
        await supabase.from('user_engagement').insert({
          user_id: user?.id,
          action_type: 'souldrop_share',
          content_id: drop.id,
          xp_earned: 10
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${drop.title}\n\n${drop.content}`);
        toast({
          title: "Copied to clipboard",
          description: "Share this soul spark with others ✨"
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleListen = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      try {
        setIsSpeaking(true);
        await speakText(drop.content);
        
        // Track listening engagement
        await supabase.from('user_engagement').insert({
          user_id: user?.id,
          action_type: 'souldrop_listen',
          content_id: drop.id,
          xp_earned: 5
        });
      } catch (error) {
        console.error('Error speaking text:', error);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const handleResonate = async () => {
    await onLike(drop.id);
    
    // Optimistic update for resonance count
    setResonanceCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Variable reward - occasionally show special feedback
    if (Math.random() < 0.1) { // 10% chance
      toast({
        title: "✨ Soul Resonance Amplified!",
        description: "Your resonance creates ripples of meaning in the community",
      });
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('user_engagement')
          .delete()
          .eq('user_id', user?.id)
          .eq('content_id', drop.id)
          .eq('action_type', 'souldrop_bookmark');
      } else {
        // Add bookmark
        await supabase.from('user_engagement').insert({
          user_id: user?.id,
          action_type: 'souldrop_bookmark',
          content_id: drop.id,
          xp_earned: 5
        });
      }
      
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Removed from Soul Journal" : "Added to Soul Journal",
        description: isBookmarked ? "Bookmark removed" : "Saved for reflection ✨"
      });
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const completeMicroChallenge = async () => {
    try {
      await supabase.from('user_engagement').insert({
        user_id: user?.id,
        action_type: 'micro_challenge_complete',
        content_id: drop.id,
        xp_earned: 15,
        metadata: {
          challenge: getMicroChallenge()
        }
      });

      toast({
        title: "Micro-Challenge Complete! 🌟",
        description: "Your soul spark creates action in the world",
      });
      
      setShowMicroChallenge(false);
    } catch (error) {
      console.error('Error completing micro-challenge:', error);
    }
  };

  return (
    <Card className={getCardStyle()}>
      {showCollectible && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
            Soul Card #{drop.id.slice(-4).toUpperCase()}
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
              {drop.title}
            </h3>
            
            {/* Content Type Badge */}
            <Badge variant="outline" className="mb-2">
              {drop.content_type === 'souldrop' ? '✨ SoulDrop' : 
               drop.content_type === 'meditation' ? '🧘 Meditation' : 
               drop.content_type === 'devotional' ? '🙏 Devotional' : 
               '📖 Affirmation'}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBookmark}>
                <Bookmark className="h-4 w-4 mr-2" />
                {isBookmarked ? 'Remove from' : 'Add to'} Soul Journal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoreLikeThis([])}>
                <Target className="h-4 w-4 mr-2" />
                More like this
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFeedback(drop.id)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Share feedback
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {drop.content}
          </p>
        </div>

        {/* Micro-Challenge */}
        {showMicroChallenge && (
          <div className="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-accent">Micro-Challenge:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getMicroChallenge()}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={completeMicroChallenge}
                >
                  I did it! ✨
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {/* Resonance Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResonate}
              className={`transition-all ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{resonanceCount}</span>
            </Button>

            {/* Share Button */}
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Share</span>
            </Button>

            {/* Listen Button */}
            <Button variant="ghost" size="sm" onClick={handleListen}>
              {isSpeaking ? (
                <Square className="h-4 w-4 mr-1" />
              ) : (
                <Volume2 className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs hidden sm:inline">
                {isSpeaking ? 'Stop' : 'Listen'}
              </span>
            </Button>
          </div>

          {/* Community Resonance Indicator */}
          {resonanceCount > 10 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              High resonance
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoulDropCard;