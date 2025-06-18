
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Eye, Users, TrendingUp } from 'lucide-react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';
import { useAIFunnels } from '@/hooks/useAIFunnels';

const FunnelDashboardOverview: React.FC = () => {
  const { funnels: interactiveFunnels, loading: loadingInteractive } = useInteractiveFunnels();
  const { aiFunnels, loading: loadingAI } = useAIFunnels();

  const totalViews = interactiveFunnels.reduce((sum, funnel) => sum + (funnel.views_count || 0), 0);
  const totalSubmissions = interactiveFunnels.reduce((sum, funnel) => sum + (funnel.submissions_count || 0), 0);
  const activeFunnels = interactiveFunnels.filter(f => f.status === 'active').length;
  const publicFunnels = interactiveFunnels.filter(f => f.is_public).length;

  if (loadingInteractive || loadingAI) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel AI</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiFunnels.length}</div>
            <p className="text-xs text-muted-foreground">
              Generati dall'intelligenza artificiale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel Interattivi</CardTitle>
            <Zap className="h-4 w-4 text-golden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactiveFunnels.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeFunnels} attivi, {publicFunnels} pubblici
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizzazioni</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Visite totali ai funnel pubblici
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Raccolti</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Submissions dai funnel interattivi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Funnels Recent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Funnel AI Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiFunnels.length > 0 ? (
              <div className="space-y-3">
                {aiFunnels.slice(0, 3).map((funnel) => (
                  <div key={funnel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{funnel.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(funnel.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <Badge variant={funnel.is_active ? 'default' : 'secondary'}>
                      {funnel.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </div>
                ))}
                {aiFunnels.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{aiFunnels.length - 3} altri funnel AI
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nessun funnel AI generato ancora
              </p>
            )}
          </CardContent>
        </Card>

        {/* Interactive Funnels Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Funnel Interattivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interactiveFunnels.length > 0 ? (
              <div className="space-y-3">
                {interactiveFunnels
                  .filter(f => f.is_public)
                  .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                  .slice(0, 3)
                  .map((funnel) => (
                    <div key={funnel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{funnel.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {funnel.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {funnel.submissions_count || 0}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-golden text-black">
                        Pubblico
                      </Badge>
                    </div>
                  ))}
                
                {interactiveFunnels.filter(f => f.is_public).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nessun funnel pubblico attivo
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nessun funnel interattivo creato ancora
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunnelDashboardOverview;
