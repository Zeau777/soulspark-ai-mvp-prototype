-- Create custom types
CREATE TYPE public.user_role AS ENUM ('student', 'employee', 'athlete');
CREATE TYPE public.faith_background AS ENUM ('christian', 'spiritual', 'exploring', 'other', 'prefer_not_to_say');
CREATE TYPE public.personality_style AS ENUM ('introvert', 'extrovert', 'thinker', 'feeler', 'mixed');
CREATE TYPE public.mood_type AS ENUM ('anxious', 'peaceful', 'lost', 'tired', 'joyful', 'stressed', 'hopeful', 'overwhelmed', 'grateful', 'restless');
CREATE TYPE public.content_type AS ENUM ('souldrop', 'prayer', 'meditation', 'devotional', 'affirmation');
CREATE TYPE public.check_in_type AS ENUM ('daily', 'weekly', 'emergency');

-- Organizations table
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    admin_email TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id),
    role user_role,
    faith_background faith_background,
    personality_style personality_style,
    display_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    current_streak INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    meals_donated INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Soul profile from onboarding quiz
CREATE TABLE public.soul_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    faith_background faith_background,
    emotional_state mood_type,
    personal_goals TEXT[],
    personality_style personality_style,
    check_in_keywords TEXT[],
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily content (SoulDrops)
CREATE TABLE public.soul_drops (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type content_type DEFAULT 'souldrop',
    target_moods mood_type[],
    target_roles user_role[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User check-ins and mood tracking
CREATE TABLE public.check_ins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood mood_type NOT NULL,
    type check_in_type DEFAULT 'daily',
    notes TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat conversations with AI
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_ai_response BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User engagement tracking
CREATE TABLE public.user_engagement (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    content_id UUID,
    metadata JSONB DEFAULT '{}',
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Storage bucket for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('soul-content', 'soul-content', true);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" 
ON public.organizations FOR SELECT 
USING (
    id IN (
        SELECT organization_id FROM public.profiles 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization admins can update their org" 
ON public.organizations FOR UPDATE 
USING (admin_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for soul_profiles
CREATE POLICY "Users can manage their soul profile" 
ON public.soul_profiles FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for soul_drops
CREATE POLICY "Users can view active soul drops for their org" 
ON public.soul_drops FOR SELECT 
USING (
    is_active = true AND 
    (organization_id IS NULL OR organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE user_id = auth.uid()
    ))
);

CREATE POLICY "Org admins can manage soul drops" 
ON public.soul_drops FOR ALL 
USING (
    organization_id IN (
        SELECT id FROM public.organizations 
        WHERE admin_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- RLS Policies for check_ins
CREATE POLICY "Users can manage their check-ins" 
ON public.check_ins FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Users can manage their conversations" 
ON public.conversations FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
    conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE user_id = auth.uid()
    )
);

-- RLS Policies for user_engagement
CREATE POLICY "Users can view their engagement data" 
ON public.user_engagement FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their engagement data" 
ON public.user_engagement FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Storage policies
CREATE POLICY "Authenticated users can view content" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'soul-content' AND auth.role() = 'authenticated');

CREATE POLICY "Org admins can upload content" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'soul-content' AND 
    auth.uid() IN (
        SELECT user_id FROM public.profiles p 
        JOIN public.organizations o ON p.organization_id = o.id 
        WHERE o.admin_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak and XP
CREATE OR REPLACE FUNCTION public.update_user_engagement(
    p_user_id UUID,
    p_action_type TEXT,
    p_xp_earned INTEGER DEFAULT 10
)
RETURNS VOID AS $$
BEGIN
    -- Insert engagement record
    INSERT INTO public.user_engagement (user_id, action_type, xp_earned)
    VALUES (p_user_id, p_action_type, p_xp_earned);
    
    -- Update user XP
    UPDATE public.profiles 
    SET total_xp = total_xp + p_xp_earned,
        meals_donated = meals_donated + (p_xp_earned / 20), -- 20 XP = 1 meal
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Update streak for daily check-ins
    IF p_action_type = 'daily_checkin' THEN
        UPDATE public.profiles 
        SET current_streak = current_streak + 1,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily soul drop for user
CREATE OR REPLACE FUNCTION public.get_daily_soul_drop(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    content_type content_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT sd.id, sd.title, sd.content, sd.content_type
    FROM public.soul_drops sd
    LEFT JOIN public.profiles p ON p.user_id = p_user_id
    LEFT JOIN public.soul_profiles sp ON sp.user_id = p_user_id
    WHERE sd.is_active = true
    AND (sd.organization_id IS NULL OR sd.organization_id = p.organization_id)
    AND (sd.target_roles IS NULL OR p.role = ANY(sd.target_roles))
    AND (sd.target_moods IS NULL OR sp.emotional_state = ANY(sd.target_moods))
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_soul_drops_organization_id ON public.soul_drops(organization_id);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_check_ins_created_at ON public.check_ins(created_at);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_user_engagement_user_id ON public.user_engagement(user_id);

-- Insert sample data
INSERT INTO public.organizations (name, code, admin_email, type) VALUES 
('Demo University', 'DEMO2024', 'admin@demo.edu', 'university'),
('TechCorp', 'TECH2024', 'hr@techcorp.com', 'company');

INSERT INTO public.soul_drops (title, content, content_type, is_active) VALUES 
('Morning Peace', 'Start your day knowing you are loved beyond measure. Take three deep breaths and remember: you have everything you need within you to face today with courage.', 'souldrop', true),
('Midday Reset', 'Pause. Breathe. You are exactly where you need to be. Trust the journey, even when the path seems unclear.', 'souldrop', true),
('Evening Gratitude', 'As this day ends, reflect on three things that brought you joy. Gratitude transforms ordinary moments into blessings.', 'souldrop', true),
('Strength Prayer', 'God, grant me strength for today, hope for tomorrow, and peace in this moment. I trust in your perfect timing.', 'prayer', true),
('Calm Meditation', 'Close your eyes. Breathe in peace, breathe out worry. You are safe, you are loved, you are enough.', 'meditation', true);