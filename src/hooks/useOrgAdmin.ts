import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOrgAdmin() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["orgAdmin", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, code, type")
        .eq("admin_email", user.email)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  return {
    organization: query.data,
    isOrgAdmin: !!query.data,
    loading: query.isLoading,
    error: query.error,
  };
}