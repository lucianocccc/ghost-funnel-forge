
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Brain, 
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface ConsolidatedLeadsStatsProps {
  stats: any;
  detailed?: boolean;
}

const ConsolidatedLeadsStats: React.FC<ConsolidatedLeadsStatsProps> = ({ 
  stats, 
  detailed = false 
}) => {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statusColors = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    in_progress: 'bg-orange-500',
    qualified: 'bg-purple-500',
    converted: 'bg-green-500',
    lost: 'bg-red-500'
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Lead Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.analyzed}</p>
                <p className="text-sm text-gray-600">Analizzati con AI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avg_score)}</p>
                <p className="text-sm text-gray-600">Score Medio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.by_status.converted}</p>
                <p className="text-sm text-gray-600">Convertiti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {detailed && (
        <>
          {/* Status Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 h-5" />
                  Distribuzione per Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.by_status).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                    <Progress 
                      value={((count as number) / stats.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 h-5" />
                  Distribuzione per Priorità
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.by_priority).map(([priority, count]) => (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize">{priority}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                    <Progress 
                      value={((count as number) / stats.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 h-5" />
                Progresso Analisi AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lead Analizzati</span>
                  <span>{stats.analyzed} di {stats.total}</span>
                </div>
                <Progress value={(stats.analyzed / stats.total) * 100} className="h-3" />
                <p className="text-sm text-gray-600">
                  {Math.round((stats.analyzed / stats.total) * 100)}% completato
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ConsolidatedLeadsStats;
