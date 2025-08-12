import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";

const OrgAccessBanner = () => {
  const { user } = useAuth();
  const { fullAccess, loading } = useAccess();

  if (!user || loading || fullAccess) return null;

  return (
    <div className="container mt-3">
      <Alert className="border-accent/30">
        <AlertTitle className="text-foreground">Limited access</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          You're currently on a limited, non-organization account. If your organization invited you, open your
          unique org link to unlock full access. Need help?
        </AlertDescription>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <a href="/partners#partner-plans">Learn about org access</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="mailto:partners@mysoulsparkai.com?subject=Org%20Access%20Help">Contact partnerships</a>
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default OrgAccessBanner;
