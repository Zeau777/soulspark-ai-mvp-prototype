import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOrgAdmin() {
  const { user, session } = useAuth();

  const query = useQuery({
    queryKey: ["orgAdmin", session?.user?.email],
    queryFn: async () => {
      const userEmail = session?.user?.email || user?.email;
      if (!userEmail) return null;
      
      console.log('Checking org admin for email:', userEmail);
      
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, code, type")
        .eq("admin_email", userEmail)
        .maybeSingle();
      
      if (error) {
        console.error('Org admin query error:', error);
        throw error;
      }
      
      console.log('Org admin query result:', data);
      return data;
    },
    enabled: !!(session?.user?.email || user?.email),
  });

  const isOrgAdmin = !!query.data;
  console.log('useOrgAdmin result:', { organization: query.data, isOrgAdmin, loading: query.isLoading });

  return {
    organization: query.data,
    isOrgAdmin,
    loading: query.isLoading,
    error: query.error,
  };
}