
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import UserDashboardMenu from "@/components/user/UserDashboardMenu";
import SubscriptionPanel from "@/components/user/SubscriptionPanel";
import CompanyPanel from "@/components/user/CompanyPanel";
import SettingsPanel from "@/components/user/SettingsPanel";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"subscription" | "company" | "settings">("subscription");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-golden border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Area Utente</h1>
      <p className="text-gray-500 mb-6">Gestisci il tuo abbonamento, la tua società e le impostazioni personali</p>
      <UserDashboardMenu selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <div className="mt-6">
        {selectedTab === "subscription" && <SubscriptionPanel />}
        {selectedTab === "company" && <CompanyPanel />}
        {selectedTab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
};

export default Dashboard;
