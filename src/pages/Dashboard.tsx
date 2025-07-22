
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, BarChart3, Zap, Users } from "lucide-react";
import UserHeader from "@/components/user/UserHeader";
import PlanUpgradeModal from "@/components/subscription/PlanUpgradeModal";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import FunnelManagement from "@/components/dashboard/FunnelManagement";
import LeadManagement from "@/components/dashboard/LeadManagement";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import RevolutionDashboard from "@/components/revolution/RevolutionDashboard";
import { IntelligentFunnelDemo } from "@/components/intelligent-funnel/IntelligentFunnelDemo";
import UnifiedFunnelCreator from "@/components/funnel-creation/UnifiedFunnelCreator";
import AuthDebugPanel from "@/components/debug/AuthDebugPanel";

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { getCurrentPlan } = useSubscriptionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"revolution" | "overview" | "funnels" | "ai-creator" | "leads">("revolution");

  const currentPlan = getCurrentPlan();

  useEffect(() => {
    console.log('Dashboard mount - Auth state:', { 
      loading, 
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, role: profile.role } : null
    });

    if (!loading && !user) {
      console.log('Dashboard: No user found, redirecting to auth...');
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      console.log('Dashboard: Initiating sign out...');
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Errore",
          description: "Errore durante il logout",
          variant: "destructive",
        });
      } else {
        console.log('Dashboard: Sign out successful, navigating to home...');
        navigate("/");
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto durante il logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    console.log('Dashboard: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-golden border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    console.log('Dashboard: No user, should redirect...');
    return null; // Will redirect in useEffect
  }

  console.log('Dashboard: Rendering dashboard for user:', user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth Debug Panel (dev only) */}
      <div className="max-w-7xl mx-auto p-4">
        <AuthDebugPanel />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Lead <span className="text-golden">Dashboard</span>
            </h1>
            <p className="text-gray-600 hidden md:block">
              Benvenuto, {profile?.first_name || 'Utente'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm text-gray-600">Piano Attuale</div>
              <div className="font-semibold text-golden">{currentPlan?.name || 'Gratuito'}</div>
            </div>
            
            <PlanUpgradeModal>
              <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-black">
                <Crown className="w-4 h-4 mr-2" />
                Aggiorna Piano
              </Button>
            </PlanUpgradeModal>

            <DashboardSidebar />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="revolution" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Revolution</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="ai-creator" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Crea Funnel</span>
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">I Miei Funnel</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Gestione Lead</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revolution">
            <IntelligentFunnelDemo />
          </TabsContent>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="ai-creator">
            <div className="bg-white rounded-lg border p-6">
              <UnifiedFunnelCreator />
            </div>
          </TabsContent>

          <TabsContent value="funnels">
            <FunnelManagement />
          </TabsContent>

          <TabsContent value="leads">
            <LeadManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
