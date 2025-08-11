import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Share2, Copy, Sparkles } from "lucide-react";

export const SparkSomeone = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const generateIdeas = async () => {
    try {
      setLoading(true);
      setIdeas([]);
      const prompt = `Give me 3 short, kind text messages (max 140 chars each) to encourage a friend today. Warm, genuine, spiritually grounded but inclusive. Separate each on a new line.`;
      const { data, error } = await supabase.functions.invoke('soul-care-chat', {
        body: {
          message: prompt,
          userContext: { currentUser: user?.id, feature: 'spark-someone' }
        }
      });
      if (error) throw error;
      const text: string = (data as any)?.response || '';
      const lines = text
        .split('\n')
        .map(l => l.replace(/^[-*\d.\s]+/, '').trim())
        .filter(l => l.length > 0)
        .slice(0, 3);
      setIdeas(lines);
    } catch (e: any) {
      toast({ title: 'Could not get ideas', description: e?.message || 'Try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const shareText = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied', description: 'Message copied to clipboard' });
      }
    } catch (_) {}
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Message copied to clipboard' });
  };

  return (
    <Card className="shadow-spiritual">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>"Spark Someone Else"</CardTitle>
        </div>
        <CardDescription>AI prompts to uplift a friend today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Button variant="spiritual" onClick={generateIdeas} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate ideas
          </Button>
        </div>
        <div className="space-y-3">
          {ideas.map((idea, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 border rounded-md p-3 bg-background/60">
              <p className="text-sm text-foreground flex-1">{idea}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => shareText(idea)} aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => copyText(idea)} aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
