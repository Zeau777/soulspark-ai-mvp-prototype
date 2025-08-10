import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, GraduationCap } from "lucide-react";

const PartnersCTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="for-organizations" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            For Organizations: DEI Leaders, Coaches, and Colleges
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Empower your community with AI-guided soul-care, nudges, and analytics. Get started in minutes.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> DEI Teams</CardTitle>
              <CardDescription>Culture, belonging, outcomes</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Personal check-ins and measurable impact for healthier teams.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Coaches</CardTitle>
              <CardDescription>Scale your impact</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Automate nudges and track engagement to support more people.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Colleges</CardTitle>
              <CardDescription>Student well-being</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Improve retention with timely support and community.
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
    </section>
  );
};

export default PartnersCTASection;
