import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";
import { ImageDown, Share2 } from "lucide-react";

interface ShareableMomentCardProps {
  title: string;
  quote: string;
  subtitle?: string;
}

export const ShareableMomentCard = ({ title, quote, subtitle }: ShareableMomentCardProps) => {
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = 'soulspark-moment.png';
      link.href = dataUrl;
      link.click();
      toast({ title: 'Saved', description: 'Image saved to your device' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Try again', variant: 'destructive' });
    }
  };

  const shareImage = async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, backgroundColor: 'transparent' });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'moment.png', { type: 'image/png' })] })) {
        // @ts-ignore
        await navigator.share({ files: [new File([blob], 'moment.png', { type: 'image/png' })] });
      } else {
        const link = document.createElement('a');
        link.download = 'soulspark-moment.png';
        link.href = dataUrl;
        link.click();
      }
      toast({ title: 'Shared', description: 'Moment ready to share' });
    } catch (e: any) {
      toast({ title: 'Share failed', description: e?.message || 'Try again', variant: 'destructive' });
    }
  };

  return (
    <Card className="shadow-spiritual">
      <CardHeader>
        <CardTitle>Shareable Moment</CardTitle>
        <CardDescription>Turn your reflections into a beautiful card</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div
            ref={ref}
            className="relative w-full md:w-80 rounded-xl p-6 overflow-hidden border bg-gradient-to-br from-primary/15 via-background to-accent/15 shadow-glow"
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
              <blockquote className="text-lg font-semibold leading-relaxed text-foreground">“{quote}”</blockquote>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
              <div className="text-[10px] text-muted-foreground pt-2">#SoulSpark</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="spiritual" onClick={downloadImage}>
              <ImageDown className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={shareImage}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
