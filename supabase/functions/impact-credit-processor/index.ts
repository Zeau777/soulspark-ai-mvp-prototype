import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MappingRow {
  action_type: string;
  credit: number;
  unit: string; // 'event' | 'minute'
}

interface EngagementRow {
  id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { limit = 1000 } = (await req.json().catch(() => ({}))) as {
      limit?: number;
    };

    // 1) Load active mappings
    const { data: mappings, error: mapErr } = await supabase
      .from("impact_action_mappings")
      .select("action_type, credit, unit")
      .eq("active", true);

    if (mapErr) throw mapErr;

    const map = new Map<string, MappingRow>();
    (mappings || []).forEach((m: any) => map.set(m.action_type, m as MappingRow));

    // 2) Fetch unprocessed engagement events
    const { data: engagements, error: engErr } = await supabase
      .from("user_engagement")
      .select("id, user_id, action_type, metadata, created_at")
      .is("impact_processed_at", null)
      .order("created_at", { ascending: true })
      .limit(Math.min(Math.max(1, Number(limit) || 1000), 2000));

    if (engErr) throw engErr;

    if (!engagements || engagements.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, insertedCredits: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Build credits rows from mappings
    const creditRows = (engagements as EngagementRow[])
      .map((e) => {
        const m = map.get(e.action_type);
        if (!m) return null;

        let multiplier = 1;
        if (m.unit === "minute") {
          const minutes =
            (e.metadata && (e.metadata.minutes || e.metadata.duration_minutes || e.metadata.durationMinutes)) || 0;
          multiplier = Math.max(0, Number(minutes) || 0);
        }

        const credits = Number((m.credit * multiplier).toFixed(6));
        if (credits <= 0) return null;

        return {
          user_id: e.user_id,
          engagement_id: e.id,
          action_type: e.action_type,
          credits,
          metadata: e.metadata || {},
        } as const;
      })
      .filter(Boolean) as Array<{
      user_id: string;
      engagement_id: string;
      action_type: string;
      credits: number;
      metadata: Record<string, any>;
    }>;

    // 4) Insert credits
    let inserted = 0;
    if (creditRows.length > 0) {
      const { error: insertErr } = await supabase
        .from("impact_credits")
        .insert(creditRows);
      if (insertErr) throw insertErr;
      inserted = creditRows.length;
    }

    // 5) Mark engagements as processed
    const ids = (engagements as EngagementRow[]).map((e) => e.id);
    const { error: updErr } = await supabase
      .from("user_engagement")
      .update({ impact_processed_at: new Date().toISOString() })
      .in("id", ids);
    if (updErr) throw updErr;

    return new Response(
      JSON.stringify({ processed: ids.length, insertedCredits: inserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("impact-credit-processor error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});