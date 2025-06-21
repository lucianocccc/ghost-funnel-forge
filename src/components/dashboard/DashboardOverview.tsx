
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Zap, TrendingUp, Plus, Eye } from 'lucide-react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';
import { useLeadsData } from '@/hooks/useLeadsData';

const DashboardOverview: React.FC = () => {
  const { funnels } = useInteractiveFunnels();
  const { leads } = useLeadsData();

  // Calcola le statistiche
  const totalFunnels = funnels.length;
  const activeFunnels = funnels.filter(f => f.status === 'active').length;
  const totalViews = funnels.reduce((sum, f) => sum + (f.views_count || 0), 0);
  const totalSubmissions = funnels.reduce((sum, f) => sum + (f.submissions_count || 0), 0);
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'nuovo').length;

  return (
    <div className="space-y-6">
      {/* Statistiche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel Totali</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
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
              Totali sui funnel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {newLeads} nuovi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversioni</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0}% tasso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Azioni Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-golden" />
              Crea il tuo primo funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Inizia subito a raccogliere lead qualificati con i nostri funnel AI-powered.
            </p>
            <Button className="bg-golden hover:bg-yellow-600 text-black w-full">
              <Plus className="w-4 h-4 mr-2" />
              Crea Funnel con AI
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Analytics e Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Monitora le performance dei tuoi funnel e ottimizza le conversioni.
            </p>
            <Button variant="outline" className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vedi Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Attività Recenti */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {totalFunnels === 0 && totalLeads === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna attività ancora. Inizia creando il tuo primo funnel!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {funnels.slice(0, 3).map((funnel) => (
                <div key={funnel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{funnel.name}</p>
                    <p className="text-sm text-gray-500">
                      {funnel.views_count || 0} visualizzazioni, {funnel.submissions_count || 0} conversioni
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(funnel.created_at!).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {leads.slice(0, 2).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Nuovo lead: {lead.nome}</p>
                    <p className="text-sm text-gray-500">{lead.email} - {lead.servizio}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
