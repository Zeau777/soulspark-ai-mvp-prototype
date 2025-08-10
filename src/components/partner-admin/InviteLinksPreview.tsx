import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Link as LinkIcon, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InviteLinksPreview() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const origin = useMemo(() => window.location.origin, []);
  const orgSlug = "preview-org"; // preview-only slug

  const groups = [
    { name: "Marketing", slug: "marketing" },
    { name: "Engineering", slug: "engineering" },
    { name: "Campus — Freshman", slug: "campus-freshman" },
    { name: "Team — Women’s Soccer", slug: "womens-soccer" },
  ];

  const linkFor = (slug: string) => `${origin}/join?org=${orgSlug}&group=${slug}&token=PREVIEW1234`;

  const copyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied example link", description: "Sign in to generate real invite links." });
    } catch {
      toast({ title: "Could not copy", description: "Select and copy the link manually.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5" /> Invite Links</CardTitle>
        <CardDescription>Create unique links for cohorts, teams, or classes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Preview only. Copy example links below. Sign up to enable real invites, expiration, and usage tracking.
        </p>

        <div className="space-y-3">
          {groups.map((g) => {
            const url = linkFor(g.slug);
            return (
              <div key={g.slug} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Cohort</Badge>
                    <span className="font-medium text-foreground">{g.name}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyLink(url)} aria-label={`Copy invite link for ${g.name}`}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                </div>
                <Input readOnly value={url} aria-label={`${g.name} invite link`} />
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Button variant="secondary" onClick={() => navigate('/auth#signup')}>
            <PlusCircle className="h-4 w-4 mr-2" /> Create New Invite Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
