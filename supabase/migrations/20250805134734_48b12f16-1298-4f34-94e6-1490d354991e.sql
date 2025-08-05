-- Fix security warnings: Set search_path for all functions

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    RETURN new;
END;
$$;

-- Update update_user_engagement function
CREATE OR REPLACE FUNCTION public.update_user_engagement(
    p_user_id UUID,
    p_action_type TEXT,
    p_xp_earned INTEGER DEFAULT 10
)
RETURNS VOID 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
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
$$;

-- Update get_daily_soul_drop function
CREATE OR REPLACE FUNCTION public.get_daily_soul_drop(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    content_type content_type
) 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
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
$$;