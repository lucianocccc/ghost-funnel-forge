
import React, { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import AdminHeader from '@/components/admin/AdminHeader';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';
import FunnelList from '@/components/FunnelList';
import ValidationDashboard from '@/components/dashboard/ValidationDashboard';
import AIFunnelCreator from '@/components/ai-funnel/AIFunnelCreator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, List, Rocket, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Funnels = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

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

  return (
    <AdminRoute>
      <div className="min-h-screen bg-black">
        <div className="p-6 border-b border-gray-800">
          <AdminHeader 
            profileName={profile?.first_name}
            onSignOut={handleSignOut}
          />
        </div>
        <div className="p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Gestione <span className="text-golden">Funnel</span>
                </h1>
                <p className="text-gray-300 mt-2">
                  Crea, gestisci e ottimizza i tuoi funnel di vendita con l'aiuto dell'AI
                </p>
              </div>
              <FunnelTemplateSelector />
            </div>

            <Tabs defaultValue="ai-creator" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai-creator" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Creator
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Validation Dashboard
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Lista Funnel
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-creator">
                <div className="bg-gray-900 rounded-lg p-6">
                  <AIFunnelCreator />
                </div>
              </TabsContent>

              <TabsContent value="validation">
                <ValidationDashboard />
              </TabsContent>

              <TabsContent value="list">
                <div className="bg-white rounded-lg p-6">
                  <FunnelList />
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-golden mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Analytics Avanzate</h3>
                    <p className="text-gray-600">
                      Funzionalità avanzate di analytics disponibili nelle prossime fasi
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default Funnels;
