import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Save, Wand2 } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

const LOCAL_KEY = 'soulspark_journal_entries_v1';

const Journal = () => {
  useSEO({
    title: 'Evening Journal — Guided Reflection | SoulSpark',
    description: 'Capture gratitude and growth with AI‑guided journaling.',
    canonical: '/journal'
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const getGuidedPrompt = async () => {
    try {
      setLoading(true);
      const prompt = `Create a gentle, faith-informed evening reflection with 4 short prompts. Keep inclusive tone. Output as bullet points.`;
      const { data, error } = await supabase.functions.invoke('soul-care-chat', {
        body: {
          message: prompt,
          userContext: { currentUser: user?.id, feature: 'journal' },
        },
      });
      if (error) throw error;
      const suggestion = (data as any)?.response || '';
      setContent((c) => (c ? c + '\n\n' : '') + suggestion);
      toast({ title: 'Reflection loaded', description: 'Guided prompts added.' });
    } catch (e: any) {
      toast({ title: 'Could not load prompts', description: e?.message || 'Try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = () => {
    if (!content.trim()) {
      toast({ title: 'Nothing to save yet', description: 'Write a few lines first.' });
      return;
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setEntries([entry, ...entries].slice(0, 50));
    setContent('');
    toast({ title: 'Saved', description: 'Your journal was saved locally for now.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card className="shadow-spiritual">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Evening Journal</CardTitle>
                <CardDescription>Guided reflection to close your day • {today}</CardDescription>
              </div>
              <Button variant="spiritual" size="sm" onClick={getGuidedPrompt} disabled={loading}>
                <Wand2 className="h-4 w-4 mr-2" /> Get Guided Prompts
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What moved you today? Where did you notice peace, struggle, gratitude?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <div className="flex items-center gap-2">
              <Button onClick={saveEntry}>
                <Save className="h-4 w-4 mr-2" /> Save Entry
              </Button>
              <Button variant="outline" onClick={getGuidedPrompt} disabled={loading}>
                <Sparkles className="h-4 w-4 mr-2" /> Add Prompt
              </Button>
            </div>
          </CardContent>
        </Card>

        {entries.length > 0 && (
          <div className="mt-6 space-y-3">
            {entries.slice(0, 3).map((e) => (
              <Card key={e.id} className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="text-base">Entry • {new Date(e.createdAt).toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{e.content}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
