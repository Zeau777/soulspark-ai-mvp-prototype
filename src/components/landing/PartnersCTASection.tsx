import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, GraduationCap, Trophy } from "lucide-react";
const PartnersCTASection = () => {
  const navigate = useNavigate();
  return <section id="for-organizations" className="pt-16 md:pt-24 pb-8 md:pb-12 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">For Organizations: Workplaces, Campuses, and Sports Teams.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">Give your people more than tools—give them hope. SoulSpark AI walks with your employees, students, or athletes through life’s challenges, building resilience, connection, and purpose.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Companies</CardTitle>
              <CardDescription>Well-being, culture, retention</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reduce burnout and turnover with proactive check-ins, team pulse, and measurable impact on culture.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Colleges</CardTitle>
              <CardDescription>Student success & safety</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Boost retention with timely nudges, crisis routing, and belonging-building communities.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Sports Teams</CardTitle>
              <CardDescription>Performance and mental fitness</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Daily mindset cues, recovery reflections, and confidential support to sustain peak performance.
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="spiritual" onClick={() => navigate('/auth#signup')}>
            Partner Sign Up
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Partner Login
          </Button>
          <Button variant="ghost" onClick={() => navigate('/partner-preview')}>
            View Admin Partner Preview
          </Button>
          <Button variant="ghost" onClick={() => navigate('/partners')}>
            Learn more for partners
          </Button>
        </div>
      </div>
    </section>;
};
export default PartnersCTASection;