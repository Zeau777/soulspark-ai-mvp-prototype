import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  updated_at?: string | null;
}

export function useUserProfile(userId?: string) {
  const query = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null as ProfileRow | null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
    enabled: !!userId,
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
  };
}
