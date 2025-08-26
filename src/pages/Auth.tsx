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
import PricingPlanSelector from '@/components/partner-admin/PricingPlanSelector';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOrgSignUp, setIsOrgSignUp] = useState(false);
  const [selectedPricingPlan, setSelectedPricingPlan] = useState<any>(null);
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
        const message = (error as any).message?.includes('provider is not enabled')
          ? 'This sign-in method is disabled. Enable the provider in Supabase Auth > Providers and try again.'
          : (error as any).message;
        toast({
          title: "Sign in failed",
          description: message,
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
    const adminEmail = formData.get('adminEmail') as string;

    try {
      if (isSignUp) {
        const metadata = {
          full_name: fullName,
          ...(organization && { organization })
        };
        
        const { error } = await signUp(email, password, metadata);
        
        // Get user data after successful signup
        let userData = null;
        if (!error) {
          const { data } = await supabase.auth.getUser();
          userData = data.user;
        }
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // If this is an organization signup, create the organization
          if (isOrgSignUp && organization && selectedPricingPlan && userData) {
            try {
              await supabase
                .from('organizations')
                .insert({
                  name: organization,
                  code: organization.toLowerCase().replace(/\s+/g, '-'),
                  admin_email: adminEmail || email,
                  pricing_plan: selectedPricingPlan.id,
                  max_seats: selectedPricingPlan.maxSeats,
                  current_seats: 0
                });
              
              toast({
                title: "Organization created successfully!",
                description: "Check your email to confirm your account, then sign in to access your admin dashboard.",
              });
            } catch (orgError) {
              console.error('Error creating organization:', orgError);
              toast({
                title: "Organization creation failed",
                description: "User created but organization setup failed. Please contact support.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Welcome to SoulSpark AI!",
              description: "Check your email to confirm your account, then sign in.",
            });
          }
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
          {/* Create Account / Sign In Button */}
          <div className="space-y-2">
            <Button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsOrgSignUp(false);
                setSelectedPricingPlan(null);
              }}
              className="w-full bg-card hover:bg-muted text-foreground border border-border font-medium py-3 rounded-full"
            >
              {isSignUp ? 'Sign In' : 'Create account'}
            </Button>
            
            {!isSignUp && (
              <Button
                onClick={() => {
                  setIsSignUp(true);
                  setIsOrgSignUp(true);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-full"
              >
                Create Organization Account
              </Button>
            )}
          </div>

          {/* Email Form */}
          {isSignUp && (
            <form onSubmit={handleEmailAuth} className="space-y-6 mt-6">
              {/* Pricing Plan Selection for Organization Signup */}
              {isOrgSignUp && (
                <div className="space-y-4">
                  <PricingPlanSelector
                    selectedPlan={selectedPricingPlan?.id || null}
                    onPlanSelect={setSelectedPricingPlan}
                  />
                </div>
              )}
              
              <div className="space-y-4">
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
                
                {isOrgSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-foreground">Organization Name</Label>
                      <Input
                        id="organization"
                        name="organization"
                        type="text"
                        placeholder="Your organization name"
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-foreground">Admin Email (if different)</Label>
                      <Input
                        id="adminEmail"
                        name="adminEmail"
                        type="email"
                        placeholder="Optional: Different admin email"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-md"
                      />
                    </div>
                  </>
                )}
                
                {!isOrgSignUp && (
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
                )}
                
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
                  disabled={loading || (isOrgSignUp && !selectedPricingPlan)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isOrgSignUp ? 'Create Organization' : 'Create account'}
                </Button>
                
                {isOrgSignUp && !selectedPricingPlan && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a pricing plan to continue
                  </p>
                )}
              </div>
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