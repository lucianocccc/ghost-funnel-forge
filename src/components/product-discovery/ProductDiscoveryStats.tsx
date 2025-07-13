
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProductDiscovery } from '@/hooks/useProductDiscovery';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const ProductDiscoveryStats: React.FC = () => {
  const { discoveryHistory, loadDiscoveryHistory, getDiscoveryStats } = useProductDiscovery();
  const stats = getDiscoveryStats();

  useEffect(() => {
    loadDiscoveryHistory();
  }, [loadDiscoveryHistory]);

  const recentSessions = discoveryHistory.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Sessioni Discovery</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.completedFunnels}</div>
              <div className="text-sm text-muted-foreground">Funnel Generati</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.avgConversionPotential}%</div>
              <div className="text-sm text-muted-foreground">Potenziale Medio</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Tasso Completamento</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Sessioni Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {session.interviewData?.productData?.productName || `Sessione ${index + 1}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.analysis?.targetAudience?.primary?.description || 'Target non definito'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.analysis && (
                      <Badge variant="outline" className="text-blue-600">
                        Analizzato
                      </Badge>
                    )}
                    {session.generatedFunnel && (
                      <Badge className="bg-green-500 text-white">
                        Funnel Creato
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Insights di Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tasso di Completamento Discovery</span>
                <span>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Potenziale Conversione Medio</span>
                <span>{stats.avgConversionPotential}%</span>
              </div>
              <Progress value={stats.avgConversionPotential} className="h-2" />
            </div>

            {stats.totalSessions > 0 && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sessioni Totali:</span> {stats.totalSessions}
                  </div>
                  <div>
                    <span className="font-medium">Funnel Attivi:</span> {stats.completedFunnels}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      {stats.totalSessions === 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">
                Inizia il tuo primo Product Discovery
              </h3>
              <p className="text-sm text-blue-700">
                L'AI analizzerà il tuo prodotto e creerà un funnel cinematico personalizzato
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDiscoveryStats;
