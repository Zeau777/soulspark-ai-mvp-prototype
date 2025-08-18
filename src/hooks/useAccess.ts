import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";

export function useAccess() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const [isLegacy, setIsLegacy] = useState<boolean>(false);
  const [checkingLegacy, setCheckingLegacy] = useState<boolean>(false);

  useEffect(() => {
    const checkLegacy = async () => {
      if (!user?.email) {
        setIsLegacy(false);
        return;
      }
      setCheckingLegacy(true);
      try {
        const { data, error } = await supabase
          .from("legacy_subscribers")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        if (error) throw error;
        setIsLegacy(!!data);
      } catch (e) {
        console.error("Legacy check failed", e);
        setIsLegacy(false);
      } finally {
        setCheckingLegacy(false);
      }
    };
    checkLegacy();
  }, [user?.email]);

  const hasOrg = !!profile?.organization_id;
  const fullAccess = useMemo(() => Boolean(isLegacy || hasOrg), [isLegacy, hasOrg]);

  return {
    fullAccess,
    isLegacy,
    hasOrg,
    loading: profileLoading || checkingLegacy,
    profile,
  };
}
