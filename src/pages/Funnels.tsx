
import React, { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import AdminHeader from '@/components/admin/AdminHeader';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';
import FunnelList from '@/components/FunnelList';
import ValidationDashboard from '@/components/dashboard/ValidationDashboard';
import AIFunnelCreator from '@/components/ai-funnel/AIFunnelCreator';
import InteractiveFunnelDashboard from '@/components/interactive-funnel/InteractiveFunnelDashboard';
import FunnelDashboardOverview from '@/components/funnel/FunnelDashboardOverview';
import ProductDiscoveryEngine from '@/components/product-discovery/ProductDiscoveryEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, List, Rocket, Sparkles, Zap, Home, Brain, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Funnels = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [generatedFunnel, setGeneratedFunnel] = useState<any>(null);

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

  const handleFunnelGenerated = (funnelData: any) => {
    setGeneratedFunnel(funnelData);
    toast({
      title: "🎬 Funnel Cinematico Creato!",
      description: "Il tuo funnel personalizzato è pronto per conquistare il mercato",
    });
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
                  Ghost<span className="text-golden">Funnel</span> AI Platform
                </h1>
                <p className="text-gray-300 mt-2">
                  La prima piattaforma AI che genera funnel cinematici personalizzati per il tuo prodotto
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  v2.0 - AI Enhanced
                </span>
                <FunnelTemplateSelector />
              </div>
            </div>

            <Tabs defaultValue="discovery" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="discovery" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Discovery
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="ai-creator" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Creator
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Funnel Interattivi
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

              <TabsContent value="discovery">
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-800">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      Product Discovery Engine
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded text-sm">
                        AI-Powered
                      </span>
                    </h2>
                    <p className="text-gray-300">
                      L'AI scopre il tuo prodotto e genera un funnel cinematico personalizzato
                    </p>
                  </div>
                  <ProductDiscoveryEngine onFunnelGenerated={handleFunnelGenerated} />
                </div>
              </TabsContent>

              <TabsContent value="overview">
                <div className="bg-white rounded-lg p-6">
                  <FunnelDashboardOverview />
                </div>
              </TabsContent>

              <TabsContent value="ai-creator">
                <div className="bg-gray-900 rounded-lg p-6">
                  <AIFunnelCreator />
                </div>
              </TabsContent>

              <TabsContent value="interactive">
                <div className="bg-white rounded-lg p-6">
                  <InteractiveFunnelDashboard />
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
                      Dashboard di analytics completa con insights AI in arrivo
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Success Message for Generated Funnel */}
            {generatedFunnel && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Funnel Cinematico Generato con Successo!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      {generatedFunnel.name} è ora disponibile nei tuoi funnel interattivi
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Discovery Highlight */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🚀 Novità: AI Discovery Engine</h3>
                  <p className="text-purple-100">
                    Lascia che l'AI analizzi il tuo prodotto e crei un funnel personalizzato che converte davvero
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded">+300% Conversioni</span>
                  <span className="bg-white/20 px-2 py-1 rounded">100% Personalizzato</span>
                  <span className="bg-white/20 px-2 py-1 rounded">5 Minuti</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default Funnels;
