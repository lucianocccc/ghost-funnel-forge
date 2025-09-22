
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, List, BarChart3 } from 'lucide-react';
import SmartFunnelGenerator from '@/components/SmartFunnelGenerator';
import { LegalFunnelWizard } from '@/components/LegalFunnelWizard';
import MyFunnelsList from '@/components/dashboard/MyFunnelsList';
import LeadAnalytics from '@/components/dashboard/LeadAnalytics';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            ClientStream Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Marketing Automation per Studi Legali e Commerciali
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Crea Funnel
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Legal Funnel
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              I Miei Funnel
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Lead & Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <SmartFunnelGenerator />
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <LegalFunnelWizard />
          </TabsContent>

          <TabsContent value="funnels" className="mt-6">
            <MyFunnelsList />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <LeadAnalytics />
          </TabsContent>
        </Tabs>
        
        <footer className="mt-8 py-4 text-center border-t">
          <div className="flex justify-center">
            <LegalDisclaimer />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
