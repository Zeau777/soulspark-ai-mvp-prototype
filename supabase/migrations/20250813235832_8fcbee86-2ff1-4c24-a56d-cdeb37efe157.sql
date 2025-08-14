-- Create feedback table to collect user feedback across platform features
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL, -- 'souldrop', 'chat', 'community'
  content_id UUID NULL, -- Reference to specific content (soul_drop_id, conversation_id, post_id, etc.)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NULL,
  feedback_category TEXT NULL, -- 'helpful', 'relevant', 'easy_to_use', 'technical_issue', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can create their own feedback
CREATE POLICY "Users can create their own feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback" 
ON public.feedback 
FOR UPDATE 
USING (user_id = auth.uid());

-- Org admins can view feedback for their org content
CREATE POLICY "Org admins can view org feedback" 
ON public.feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.admin_email = current_user_email()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();