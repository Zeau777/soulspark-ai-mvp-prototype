import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useOrgAdmin } from "@/hooks/useOrgAdmin";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ForYou from "./pages/ForYou";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Partners from "./pages/Partners";
import Pricing from "./pages/Pricing";
import PartnerAdminPreview from "./pages/PartnerAdminPreview";
import PrayerRooms from "./pages/PrayerRooms";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";
import { useOrgLink } from "@/hooks/useOrgLink";
import OrgAccessBanner from "@/components/OrgAccessBanner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isOrgAdmin, loading: orgLoading } = useOrgAdmin();
  
  if (loading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to={isOrgAdmin ? "/admin" : "/dashboard"} replace />;
  }
  
  return <>{children}</>;
}

function OrgLinkHandler() {
  useOrgLink();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <OrgLinkHandler />
          <OrgAccessBanner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/partner-preview" element={<PartnerAdminPreview />} />
            
            {/* Protected routes */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/for-you" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><PlatformAnalytics /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;