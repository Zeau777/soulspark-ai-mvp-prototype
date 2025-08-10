import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfCurrentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const startOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
  return { start: startOfPreviousMonth, end: startOfCurrentMonth };
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
    const body = await req.json().catch(() => ({}));
    const { period_start, period_end } = body as { period_start?: string; period_end?: string };

    const range = period_start && period_end
      ? { start: new Date(period_start), end: new Date(period_end) }
      : getPreviousMonthRange();

    const startIso = range.start.toISOString();
    const endIso = range.end.toISOString();

    // Load settings (first active row)
    const { data: settings, error: settingsErr } = await supabase
      .from('impact_settings')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (settingsErr) throw settingsErr;

    const partner = settings?.partner || 'no_kid_hungry';
    const rate = Number(settings?.donation_rate_cents_per_meal ?? 10); // cents per meal

    // Sum credits in period not yet batched
    const { data: creditsRows, error: creditsErr } = await supabase
      .from('impact_credits')
      .select('id, credits, created_at')
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .is('batched_id', null)
      .limit(100000);
    if (creditsErr) throw creditsErr;

    const totalCredits = (creditsRows || []).reduce((sum, r: any) => sum + Number(r.credits || 0), 0);
    const totalMeals = Math.floor(totalCredits); // Round down to whole meals
    const totalAmountCents = totalMeals * rate;

    // Create batch
    const { data: batch, error: batchErr } = await supabase
      .from('impact_batches')
      .insert({
        partner,
        period_start: range.start.toISOString().slice(0, 10),
        period_end: range.end.toISOString().slice(0, 10),
        total_credits: Number(totalCredits.toFixed(2)),
        total_meals: totalMeals,
        total_amount_cents: totalAmountCents,
        status: 'pending',
        notes: 'Auto-created by impact-donation-batch function',
      })
      .select('*')
      .single();
    if (batchErr) throw batchErr;

    // Mark credits as batched
    const { error: markErr } = await supabase
      .from('impact_credits')
      .update({ batched_id: batch.id })
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .is('batched_id', null);
    if (markErr) throw markErr;

    // Placeholder for external partner call (No Kid Hungry)
    // Integrate real API/Webhook here in future and set status to 'completed' with external_id

    return new Response(
      JSON.stringify({
        message: 'Batch created',
        partner,
        period_start: range.start,
        period_end: range.end,
        total_credits: Number(totalCredits.toFixed(2)),
        total_meals: totalMeals,
        total_amount_cents: totalAmountCents,
        batch_id: batch.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('impact-donation-batch error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});