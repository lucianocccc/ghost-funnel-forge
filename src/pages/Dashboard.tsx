
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import UserHeader from "@/components/user/UserHeader";
import UserDashboardMenu from "@/components/user/UserDashboardMenu";
import SubscriptionPanel from "@/components/user/SubscriptionPanel";
import CompanyPanel from "@/components/user/CompanyPanel";
import SettingsPanel from "@/components/user/SettingsPanel";
import PlanUpgradeModal from "@/components/subscription/PlanUpgradeModal";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { getCurrentPlan } = useSubscriptionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"subscription" | "company" | "settings">("subscription");

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
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <UserHeader 
            profileName={profile?.first_name}
            onSignOut={handleSignOut}
          />
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Piano Attuale</div>
              <div className="font-semibold text-golden">{currentPlan?.name || 'Gratuito'}</div>
            </div>
            
            <PlanUpgradeModal>
              <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-black">
                <Crown className="w-4 h-4 mr-2" />
                Aggiorna Piano
              </Button>
            </PlanUpgradeModal>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto p-4">
        <p className="text-gray-500 mb-6">Gestisci il tuo abbonamento, la tua società e le impostazioni personali</p>
        <UserDashboardMenu selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        <div className="mt-6">
          {selectedTab === "subscription" && <SubscriptionPanel />}
          {selectedTab === "company" && <CompanyPanel />}
          {selectedTab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
