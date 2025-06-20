
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Clock, ArrowUp, ArrowDown, Eye, MousePointer } from 'lucide-react';
import { analyticsService, FunnelAnalyticsData } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

interface InteractiveFunnelAnalyticsProps {
  funnelId: string;
  funnelName: string;
}

const InteractiveFunnelAnalytics: React.FC<InteractiveFunnelAnalyticsProps> = ({ funnelId, funnelName }) => {
  const [analytics, setAnalytics] = useState<FunnelAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [funnelId]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getFunnelAnalytics(funnelId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
        <p className="text-gray-500">Le analytics appariranno qui quando ci saranno delle interazioni con il funnel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics per {funnelName}
        </h2>
        <p className="text-gray-600">
          Analisi dettagliata delle performance del tuo funnel interattivo
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizzazioni Totali</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              Funnel visualizzato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_submissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              Funnel completato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso di Conversione</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.conversion_rate)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conversion_rate > 5 ? (
                <ArrowUp className="inline h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="inline h-3 w-3 text-red-500" />
              )}
              Performance generale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.total_views > 0 ? formatPercentage((analytics.total_submissions / analytics.total_views) * 100) : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-blue-500" />
              Interazione utenti
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analisi per Step</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.step_analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.step_analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step_title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" name="Visualizzazioni" />
                  <Bar dataKey="completions" fill="#82ca9d" name="Completamenti" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nessun dato per gli step disponibile
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Trend degli Ultimi 30 Giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" name="Visualizzazioni" />
                <Line type="monotone" dataKey="submissions" stroke="#82ca9d" name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Step Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Dettagliata per Step</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.step_analytics.map((step, index) => (
              <div key={step.step_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {index + 1}. {step.step_title}
                    </span>
                    <Badge 
                      variant={step.conversion_rate > 50 ? "default" : step.conversion_rate > 25 ? "secondary" : "destructive"}
                    >
                      {formatPercentage(step.conversion_rate)} conversione
                    </Badge>
                  </div>
                  <Progress value={step.conversion_rate} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{step.views} visualizzazioni</span>
                    <span>{step.completions} completamenti</span>
                    <span>{step.abandons} abbandoni</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel Visualization */}
      {analytics.step_analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funnel di Conversione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.step_analytics.map((step, index) => {
                const width = step.views > 0 ? (step.completions / analytics.step_analytics[0].views) * 100 : 0;
                return (
                  <div key={step.step_id} className="flex items-center gap-4">
                    <div className="w-4 text-sm text-gray-600">{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{step.step_title}</span>
                        <span className="text-sm text-gray-500">{step.completions} utenti</span>
                      </div>
                      <div 
                        className="bg-golden h-6 rounded transition-all duration-500"
                        style={{ width: `${width}%`, minWidth: '40px' }}
                      >
                        <div className="h-full flex items-center justify-center text-xs text-black font-medium">
                          {formatPercentage(width)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveFunnelAnalytics;
