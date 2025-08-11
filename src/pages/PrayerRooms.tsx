import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VoiceInterface from "@/components/voice/VoiceInterface";
import { useSEO } from "@/hooks/useSEO";
import { Calendar, Mic, Users } from "lucide-react";

const sessions = [
  { id: 'mon-am', day: 'Monday', time: '7:00 AM', type: 'AI-led' },
  { id: 'wed-noon', day: 'Wednesday', time: '12:00 PM', type: 'AI-led' },
  { id: 'fri-pm', day: 'Friday', time: '7:00 PM', type: 'Human-led' },
];

export default function PrayerRooms() {
  useSEO({
    title: 'Weekly Prayer Rooms | SoulSpark AI',
    description: 'Join weekly AI or human-led prayer rooms to reflect, breathe, and be encouraged.',
    canonical: window.location.href,
  });

  const [joiningAI, setJoiningAI] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Weekly Prayer Rooms</h1>
          <p className="text-muted-foreground">Gather weekly for reflection, prayer, and encouragement</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <Card key={s.id} className="shadow-spiritual">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle>{s.day}</CardTitle>
                  </div>
                  <CardDescription>{s.time} • {s.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  {s.type === 'AI-led' ? (
                    <Button variant="spiritual" onClick={() => setJoiningAI(true)}>
                      <Mic className="h-4 w-4 mr-2" /> Join AI Prayer Room
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <a href="#" aria-label="Join human-led room (coming soon)"><Users className="h-4 w-4 mr-2" /> Human-led (soon)</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {joiningAI && <VoiceInterface onSpeakingChange={() => {}} />}
    </div>
  );
}
