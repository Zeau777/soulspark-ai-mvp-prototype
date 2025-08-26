import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrgAdmin } from '@/hooks/useOrgAdmin';
import { Flame, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOrgAdmin, loading: orgLoading } = useOrgAdmin();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'signup') {
      setIsSignUp(true);
    }
  }, []);

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const organization = formData.get('organization') as string;

    try {
      if (isSignUp) {
        const metadata = {
          full_name: fullName,
          ...(organization && { organization })
        };
        
        const { error } = await signUp(email, password, metadata);
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome to SoulSpark AI!",
            description: "Check your email to confirm your account, then sign in.",
          });
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Redirect to role selection page for easy testing
          navigate('/role-selection');
        }
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-full">
              <Flame className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            The first AI platform for resilience, belonging, and growth at scale.
          </h1>
          <h2 className="text-lg font-medium text-muted-foreground">
            Built for students, employees, and athletes to thrive — trusted by the organizations that care for them.
          </h2>
        </div>

        {/* Auth Options */}
        <div className="space-y-4">
          {/* Google Sign In */}
          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={authLoading}
            className="w-full bg-card hover:bg-muted text-foreground border border-border font-medium py-3 rounded-full flex items-center justify-center gap-3"
          >
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign in as KingPeter
          </Button>

          {/* Apple Sign In */}
          <Button
            onClick={() => handleOAuthSignIn('apple')}
            disabled={authLoading}
            className="w-full bg-card hover:bg-muted text-foreground border border-border font-medium py-3 rounded-full flex items-center justify-center gap-3"
          >
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Sign up with Apple
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground text-sm">OR</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Create Account / Sign In Button */}
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full bg-card hover:bg-muted text-foreground border border-border font-medium py-3 rounded-full"
          >
            {isSignUp ? 'Sign In' : 'Create account'}
          </Button>

          {/* Email Form */}
          {isSignUp && (
            <form onSubmit={handleEmailAuth} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-foreground">Organization (Optional)</Label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your organization"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          )}
        </div>

        {/* Terms */}
        <div className="text-xs text-muted-foreground text-center leading-relaxed">
          By signing up, you agree to the{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          , including{' '}
          <a href="/cookies" className="text-primary hover:underline">
            Cookie Use
          </a>
          .
        </div>

        {/* Already have account section */}
        <div className="text-center space-y-4 pt-8">
          <h3 className="text-xl font-bold text-foreground">
            Already have an account?
          </h3>
          
          {!isSignUp && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    required
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-transparent border border-border hover:bg-muted text-foreground font-medium py-3 rounded-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}