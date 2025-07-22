
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FunnelList from '@/components/FunnelList';
import InteractiveFunnelList from '@/components/interactive-funnel/InteractiveFunnelList';
import UnifiedFunnelCreator from '@/components/funnel-creation/UnifiedFunnelCreator';
import { Bot, Zap, Target, BarChart3 } from 'lucide-react';

const Funnels = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestione Funnel</h1>
        <p className="text-gray-600">
          Crea, gestisci e analizza i tuoi funnel di conversione e raccolta lead
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Crea Funnel
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Funnel Interattivi
          </TabsTrigger>
          <TabsTrigger value="traditional" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Funnel Tradizionali
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Bot className="w-5 h-5" />
                Creazione Funnel Unificata
              </CardTitle>
              <p className="text-blue-700">
                Tutti i metodi di creazione funnel in un'unica interfaccia: rapido, per tipologia, conversazionale e manuale
              </p>
            </CardHeader>
          </Card>
          <UnifiedFunnelCreator />
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                I Miei Funnel Interattivi
              </CardTitle>
              <p className="text-gray-600">
                Funnel con raccolta dati avanzata e qualificazione automatica dei lead
              </p>
            </CardHeader>
          </Card>
          <InteractiveFunnelList />
        </TabsContent>

        <TabsContent value="traditional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Funnel Tradizionali
              </CardTitle>
              <p className="text-gray-600">
                Funnel classici con template predefiniti
              </p>
            </CardHeader>
          </Card>
          <FunnelList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Funnels;
