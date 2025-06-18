
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, List, BarChart3, Users } from 'lucide-react';
import InteractiveFunnelCreator from './InteractiveFunnelCreator';
import InteractiveFunnelList from './InteractiveFunnelList';

const InteractiveFunnelDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Funnel <span className="text-golden">Interattivi</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Crea funnel interattivi per raccogliere dati, analizzare i lead e generare report personalizzati
          </p>
        </div>
        <InteractiveFunnelCreator />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            I Miei Funnel
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Report AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <InteractiveFunnelList />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics dei Funnel</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-golden mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics Avanzate</h3>
              <p className="text-gray-600">
                Visualizza statistiche dettagliate sui tuoi funnel interattivi
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Submissions</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="w-16 h-16 text-golden mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Submissions dei Lead</h3>
              <p className="text-gray-600">
                Visualizza e gestisci tutte le submissions dei tuoi funnel
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Report AI Personalizzati</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Zap className="w-16 h-16 text-golden mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Report Generati dall'AI</h3>
              <p className="text-gray-600">
                Report personalizzati basati sui dati raccolti dai tuoi funnel
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveFunnelDashboard;
