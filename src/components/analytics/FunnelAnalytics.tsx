
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, Clock, ArrowUp, ArrowDown } from 'lucide-react';

interface FunnelMetrics {
  funnel_id: string;
  funnel_name: string;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  avg_time_to_convert: number;
  revenue: number;
  step_data: Array<{
    step_name: string;
    visitors: number;
    conversions: number;
    drop_off_rate: number;
  }>;
  daily_data: Array<{
    date: string;
    visitors: number;
    conversions: number;
  }>;
}

interface FunnelAnalyticsProps {
  metrics: FunnelMetrics;
}

const FunnelAnalytics: React.FC<FunnelAnalyticsProps> = ({ metrics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitatori Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +12% rispetto al mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversioni</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +8% rispetto al mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso di Conversione</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.conversion_rate)}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDown className="inline h-3 w-3 text-red-500" />
              -2% rispetto al mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +15% rispetto al mese scorso
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.step_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#8884d8" name="Visitatori" />
                <Bar dataKey="conversions" fill="#82ca9d" name="Conversioni" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend temporale */}
        <Card>
          <CardHeader>
            <CardTitle>Trend negli Ultimi 30 Giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.daily_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#8884d8" name="Visitatori" />
                <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversioni" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analisi Drop-off per Step</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.step_data.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{step.step_name}</span>
                    <Badge variant={step.drop_off_rate > 50 ? "destructive" : step.drop_off_rate > 30 ? "secondary" : "default"}>
                      {formatPercentage(step.drop_off_rate)} drop-off
                    </Badge>
                  </div>
                  <Progress value={100 - step.drop_off_rate} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{step.conversions} conversioni</span>
                    <span>{step.visitors} visitatori</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunnelAnalytics;
