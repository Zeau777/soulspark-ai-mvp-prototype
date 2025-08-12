import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

// Captures ?org=CODE from the URL and attaches the user to that organization on login
export function useOrgLink() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Capture org code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orgCode = params.get("org");
    if (orgCode) {
      localStorage.setItem("pending_org_code", orgCode);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("org");
      window.history.replaceState({}, "", url.toString());
      toast({ title: "Organization link detected", description: "Sign in to join your organization." });
    }
  }, []);

  // When user is logged in, attach them to organization if needed
  useEffect(() => {
    const attachOrg = async () => {
      if (!user) return;
      const orgCode = localStorage.getItem("pending_org_code");
      if (!orgCode) return;

      try {
        // Find organization by code
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .select("id, code")
          .eq("code", orgCode)
          .maybeSingle();
        if (orgErr) throw orgErr;
        if (!org) {
          toast({ title: "Organization not found", description: "Please verify the link.", variant: "destructive" });
          localStorage.removeItem("pending_org_code");
          return;
        }

        // Check current profile
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("id, organization_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profErr) throw profErr;

        if (profile?.organization_id !== org.id) {
          const { error: updErr } = await supabase
            .from("profiles")
            .update({ organization_id: org.id })
            .eq("user_id", user.id);
          if (updErr) throw updErr;
        }

        toast({ title: "Joined organization", description: "Your access has been upgraded." });
      } catch (e) {
        console.error("Org attach failed", e);
        toast({ title: "Error joining organization", description: "Please try again.", variant: "destructive" });
      } finally {
        localStorage.removeItem("pending_org_code");
      }
    };

    attachOrg();
  }, [user]);
}
