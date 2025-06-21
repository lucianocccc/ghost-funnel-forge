
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
import AIFunnelCreator from "@/components/ai-funnel/AIFunnelCreator";
import FunnelManagement from "@/components/dashboard/FunnelManagement";
import LeadManagement from "@/components/dashboard/LeadManagement";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { getCurrentPlan } = useSubscriptionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"overview" | "funnels" | "ai-creator" | "leads">("overview");

  const currentPlan = getCurrentPlan();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-golden border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
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

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="ai-creator">
            <div className="bg-gray-900 rounded-lg p-6">
              <AIFunnelCreator />
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
