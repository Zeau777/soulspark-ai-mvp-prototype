import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickFeedbackProps {
  featureType: 'souldrop' | 'chat' | 'community';
  contentId?: string;
  onDetailedFeedback?: () => void;
  className?: string;
}

const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  featureType,
  contentId,
  onDetailedFeedback,
  className = ""
}) => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitQuickFeedback = async (rating: number, category: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit feedback.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          content_id: contentId || null,
          rating,
          feedback_category: category
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Thanks for your feedback!",
        description: "This helps us improve your experience."
      });
    } catch (error) {
      console.error('Error submitting quick feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive"
      });
    }
  };

  if (submitted) {
    return (
      <div className={`text-center text-sm text-muted-foreground ${className}`}>
        Thank you for your feedback! 💜
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => submitQuickFeedback(5, 'helpful')}
        className="h-8 px-2"
      >
        <ThumbsUp className="w-4 h-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => submitQuickFeedback(2, 'not_helpful')}
        className="h-8 px-2"
      >
        <ThumbsDown className="w-4 h-4 text-red-600" />
      </Button>
      {onDetailedFeedback && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDetailedFeedback}
          className="h-8 px-2"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default QuickFeedback;