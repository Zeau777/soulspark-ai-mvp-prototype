import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: 'souldrop' | 'chat' | 'community';
  contentId?: string;
  onFeedbackSubmitted?: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  featureType,
  contentId,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = {
    souldrop: [
      { value: "helpful", label: "Very helpful content" },
      { value: "relevant", label: "Relevant to my needs" },
      { value: "not_relevant", label: "Not relevant to me" },
      { value: "technical_issue", label: "Technical issue" }
    ],
    chat: [
      { value: "helpful", label: "Helpful guidance" },
      { value: "easy_to_use", label: "Easy to use" },
      { value: "response_quality", label: "Good response quality" },
      { value: "technical_issue", label: "Technical issue" }
    ],
    community: [
      { value: "engaging", label: "Engaging experience" },
      { value: "easy_to_use", label: "Easy to navigate" },
      { value: "valuable_content", label: "Valuable content" },
      { value: "technical_issue", label: "Technical issue" }
    ]
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

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
          feedback_text: feedbackText.trim() || null,
          feedback_category: category || null
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve the platform."
      });

      // Reset form
      setRating(0);
      setFeedbackText("");
      setCategory("");
      
      onFeedbackSubmitted?.();
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (featureType) {
      case 'souldrop': return 'How was this SoulDrop?';
      case 'chat': return 'How was your chat experience?';
      case 'community': return 'How was your community experience?';
      default: return 'Share your feedback';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <Label className="text-sm font-medium">Your rating</Label>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  type="button"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What describes your experience?</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              {categories[featureType].map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.value} id={cat.value} />
                  <Label htmlFor={cat.value} className="text-sm cursor-pointer">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Optional Text Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;