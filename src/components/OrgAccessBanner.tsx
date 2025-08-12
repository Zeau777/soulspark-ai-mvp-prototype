import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

const DISMISS_KEY = "dismiss_org_banner";

const OrgAccessBanner = () => {
  const { user } = useAuth();
  const { fullAccess, loading } = useAccess();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored === "1") setDismissed(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (!user || loading || fullAccess || dismissed) return null;

  return (
    <div className="container mt-3">
      <Alert className="border-accent/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <AlertTitle className="text-foreground">Limited access</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              You're currently on a limited, non-organization account. If your organization invited you, open your
              unique org link to unlock full access. Need help?
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
