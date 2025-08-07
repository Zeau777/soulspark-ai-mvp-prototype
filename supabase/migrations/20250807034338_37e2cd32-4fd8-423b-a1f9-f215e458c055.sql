-- Create tables for social accountability features and push notifications

-- Push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Spark Circles (small groups)
CREATE TABLE public.spark_circles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  organization_id UUID,
  max_members INTEGER DEFAULT 8,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Circle memberships
CREATE TABLE public.circle_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.spark_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Challenges (AI-led or peer-led)
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai_led', 'peer_led')),
  duration_days INTEGER NOT NULL DEFAULT 7,
  creator_id UUID,
  organization_id UUID,
  is_public BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenge participations
CREATE TABLE public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(challenge_id, user_id)
);

-- Posts for sharing wins (Feed/Stories)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  circle_id UUID REFERENCES public.spark_circles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'win' CHECK (post_type IN ('win', 'prayer_request', 'testimony', 'reflection')),
  is_story BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'circle', 'private')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post reactions
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'pray', 'amen', 'celebrate')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spark_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for spark_circles
CREATE POLICY "Users can view circles they're members of or public circles"
ON public.spark_circles
FOR SELECT
USING (
  is_private = false OR 
  id IN (
    SELECT circle_id FROM public.circle_memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create circles"
ON public.spark_circles
FOR INSERT
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Circle admins can update their circles"
ON public.spark_circles
FOR UPDATE
USING (
  id IN (
    SELECT circle_id FROM public.circle_memberships 
    WHERE user_id = auth.uid() AND role IN ('admin', 'leader')
  )
);

-- RLS Policies for circle_memberships
CREATE POLICY "Users can view memberships in their circles"
ON public.circle_memberships
FOR SELECT
USING (
  circle_id IN (
    SELECT circle_id FROM public.circle_memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join circles"
ON public.circle_memberships
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for challenges
CREATE POLICY "Users can view public challenges and their org challenges"
ON public.challenges
FOR SELECT
USING (
  is_public = true OR 
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create challenges"
ON public.challenges
FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- RLS Policies for challenge_participations
CREATE POLICY "Users can view their challenge participations"
ON public.challenge_participations
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for posts
CREATE POLICY "Users can view posts based on visibility"
ON public.posts
FOR SELECT
USING (
  visibility = 'public' OR
  (visibility = 'circle' AND circle_id IN (
    SELECT circle_id FROM public.circle_memberships 
    WHERE user_id = auth.uid()
  )) OR
  user_id = auth.uid()
);

CREATE POLICY "Users can create posts"
ON public.posts
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for post_reactions
CREATE POLICY "Users can view reactions on visible posts"
ON public.post_reactions
FOR SELECT
USING (
  post_id IN (
    SELECT id FROM public.posts 
    WHERE visibility = 'public' OR
    (visibility = 'circle' AND circle_id IN (
      SELECT circle_id FROM public.circle_memberships 
      WHERE user_id = auth.uid()
    )) OR
    user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own reactions"
ON public.post_reactions
FOR ALL
USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spark_circles_updated_at
BEFORE UPDATE ON public.spark_circles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();