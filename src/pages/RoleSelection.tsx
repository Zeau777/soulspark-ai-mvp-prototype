import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, Building2 } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Choose Your Experience
          </h1>
          <p className="text-muted-foreground text-lg">
            Select the view you'd like to test
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Experience */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">User Experience</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access the platform as a regular user with access to daily content, community features, and personal growth tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue as User
              </Button>
            </CardContent>
          </Card>

          {/* Partner Experience */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Partner Experience</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access the admin dashboard to manage organizational content, view analytics, and oversee partner features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Continue as Partner
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You can switch between experiences anytime for testing purposes.
          </p>
        </div>
      </div>
    </div>
  );
}