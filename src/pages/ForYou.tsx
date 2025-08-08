import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Types
interface RankedDrop extends Tables<'soul_drops'> {
  _score?: number;
}

const PAGE_SIZE = 20;

export default function ForYou() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [drops, setDrops] = useState<RankedDrop[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [soulProfile, setSoulProfile] = useState<Tables<'soul_profiles'> | null>(null);

  // Simple SEO handling
  useEffect(() => {
    document.title = "For You | Personalized SoulDrops";

    const metaDesc = document.querySelector('meta[name="description"]');
    const descText = "SoulSpark AI For You: personalized SoulDrops feed tailored to your moods, goals, and spiritual journey.";
    if (!metaDesc) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = descText;
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute('content', descText);
    }

    // Canonical
    const canonicalHref = window.location.origin + "/for-you";
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = canonicalHref;
      document.head.appendChild(canonical);
    } else {
      canonical.href = canonicalHref;
    }

    // Structured data (CollectionPage)
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'For You SoulDrops',
      description: descText,
    });
    document.head.appendChild(ld);

    return () => {
      document.head.removeChild(ld);
    };
  }, []);

  // Fetch user context
  useEffect(() => {
    const loadContext = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [{ data: p }, { data: sp }] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('soul_profiles').select('*').eq('user_id', user.id).single(),
        ]);
        setProfile(p ?? null);
        setSoulProfile(sp ?? null);
        setPage(0);
        setDrops([]);
        setHasMore(true);
      } finally {
        setLoading(false);
      }
    };
    loadContext();
  }, [user?.id]);

  const scoreDrop = useMemo(() => {
    const userRole = profile?.role ?? null;
    const userMood = soulProfile?.emotional_state ?? null;
    const orgId = profile?.organization_id ?? null;
    const keywords = new Set<string>([
      ...(soulProfile?.check_in_keywords ?? []),
      ...((soulProfile?.personal_goals ?? []) as string[]),
    ].filter(Boolean) as string[]);

    return (d: Tables<'soul_drops'>): number => {
      let s = 0;
      if (d.organization_id === null) s += 1; // General content baseline
      if (orgId && d.organization_id === orgId) s += 3; // Org match
      if (!d.target_roles || d.target_roles.length === 0) s += 1;
      if (userRole && Array.isArray(d.target_roles) && d.target_roles.includes(userRole)) s += 3;
      if (!d.target_moods || d.target_moods.length === 0) s += 1;
      if (userMood && Array.isArray(d.target_moods) && d.target_moods.includes(userMood)) s += 3;

      const tags: string[] = (d.metadata as any)?.tags ?? [];
      if (Array.isArray(tags)) {
        let hits = 0;
        for (const t of tags) {
          if (keywords.has(String(t).toLowerCase())) hits++;
        }
        s += Math.min(3, hits); // cap tag boost
      }

      // Freshness boost
      s += 0.5 * (new Date(d.created_at).getTime() / 1e13);
      return s;
    };
  }, [profile, soulProfile]);

  const fetchPage = async (pageIndex: number) => {
    if (!user) return;
    if (!hasMore && pageIndex > 0) return;

    pageIndex === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      // Fetch a chunk of active drops, lightly filtered by org for efficiency
      const orgId = profile?.organization_id ?? null;
      let query = supabase
        .from('soul_drops')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

      if (orgId) {
        // Fetch both org-specific and global in one request using filter is tricky; keep client-side for now
      }

      const { data, error } = await query;
      if (error) throw error;
      const ranked = (data ?? []).map(d => ({ ...d, _score: scoreDrop(d) }))
        .sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

      setDrops(prev => pageIndex === 0 ? ranked : [...prev, ...ranked]);
      setPage(pageIndex);
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Couldn't load your feed", description: e.message, variant: "destructive" });
    } finally {
      pageIndex === 0 ? setLoading(false) : setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.organization_id, soulProfile?.emotional_state, profile?.role]);

  const likeDrop = async (drop: Tables<'soul_drops'>) => {
    if (!user) return;
    const { error } = await supabase.from('user_engagement').insert({
      user_id: user.id,
      action_type: 'souldrop_like',
      content_id: drop.id,
      metadata: { source: 'for_you', content_type: drop.content_type },
    });
    if (error) {
      toast({ title: 'Could not like', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved to your preferences', description: 'We will show you more like this.' });
    }
  };

  const moreLikeThis = async (drop: Tables<'soul_drops'>) => {
    if (!user) return;
    const { error } = await supabase.from('user_engagement').insert({
      user_id: user.id,
      action_type: 'souldrop_more_like_this',
      content_id: drop.id,
      metadata: { tags: (drop.metadata as any)?.tags ?? [], source: 'for_you' },
    });
    if (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Noted', description: 'Tuning your feed…' });
    }
  };

  const renderCard = (d: RankedDrop) => (
    <Card key={d.id} className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{d.content_type ?? 'souldrop'}</Badge>
          {(d.metadata as any)?.tags?.slice(0, 3)?.map((t: string) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
        <CardTitle className="text-foreground text-lg md:text-xl">{d.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{d.content}</p>
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => likeDrop(d)}>
            <Heart className="mr-2 h-4 w-4" /> Like
          </Button>
          <Button size="sm" variant="outline" onClick={() => moreLikeThis(d)}>
            <Sparkles className="mr-2 h-4 w-4" /> More like this
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">For You</h1>
          <p className="text-sm text-muted-foreground">Endless, personalized SoulDrops tuned to your journey.</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {drops.map(renderCard)}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button disabled={loadingMore} onClick={() => fetchPage(page + 1)}>
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}

            {!hasMore && drops.length === 0 && (
              <div className="text-center text-muted-foreground py-10">No content yet. Check back soon.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
