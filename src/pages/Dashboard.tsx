
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, BarChart3, Zap, Users, Plus, Rocket } from "lucide-react";
import UserHeader from "@/components/user/UserHeader";
import PlanUpgradeModal from "@/components/subscription/PlanUpgradeModal";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import FunnelManagement from "@/components/dashboard/FunnelManagement";
import LeadManagement from "@/components/dashboard/LeadManagement";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UnifiedFunnelCreator from "@/components/funnel-creation/UnifiedFunnelCreator";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    subscription, 
    loading: subscriptionLoading, 
    canAccessFeature, 
    freeForAllMode,
    refreshSubscription
  } = useSubscriptionManagement();

  const [activeTab, setActiveTab] = useState("overview");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    refreshSubscription();
  }, []);

  const handleUpgrade = () => {
    setUpgradeModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <UserHeader 
            user={user}
            subscription={subscription}
            onSignOut={handleSignOut}
            onUpgrade={handleUpgrade}
            showUpgrade={!freeForAllMode && subscription?.plan_type !== 'enterprise'}
          />

          <main className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="create-funnel" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crea Funnel
                </TabsTrigger>
                <TabsTrigger value="funnels" className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  I Miei Funnel
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Lead
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <DashboardOverview 
                  subscription={subscription}
                  canAccessFeature={canAccessFeature}
                  freeForAllMode={freeForAllMode}
                />
              </TabsContent>

              <TabsContent value="create-funnel" className="space-y-6">
                <UnifiedFunnelCreator />
              </TabsContent>

              <TabsContent value="funnels" className="space-y-6">
                <FunnelManagement />
              </TabsContent>

              <TabsContent value="leads" className="space-y-6">
                <LeadManagement />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Avanzate</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Dashboard completo con metriche dettagliate, grafici interattivi e insights predittivi.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("overview")}>
                    Torna alla Overview
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <PlanUpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </div>
  );
};

export default Dashboard;
