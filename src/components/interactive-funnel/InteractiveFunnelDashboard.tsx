
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, List, BarChart3, Users, Eye, Zap } from 'lucide-react';
import InteractiveFunnelCreator from './InteractiveFunnelCreator';
import InteractiveFunnelList from './InteractiveFunnelList';
import InteractiveFunnelAnalytics from './InteractiveFunnelAnalytics';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';

const InteractiveFunnelDashboard: React.FC = () => {
  const { funnels, loading } = useInteractiveFunnels();

  // Calcola le statistiche
  const totalFunnels = funnels.length;
  const activeFunnels = funnels.filter(f => f.status === 'active').length;
  const totalViews = funnels.reduce((sum, f) => sum + (f.views_count || 0), 0);
  const totalSubmissions = funnels.reduce((sum, f) => sum + (f.submissions_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-golden" />
            Funnel Interattivi
          </h1>
          <p className="text-gray-600 mt-2">
            Crea, gestisci e analizza i tuoi funnel interattivi per raccogliere lead qualificati
          </p>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel Totali</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFunnels}</div>
            <p className="text-xs text-muted-foreground">
              {activeFunnels} attivi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizzazioni</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Raccolti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Da tutti i funnel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Media generale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Lista Funnel
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crea Nuovo
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <InteractiveFunnelList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <InteractiveFunnelCreator />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <InteractiveFunnelAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveFunnelDashboard;
