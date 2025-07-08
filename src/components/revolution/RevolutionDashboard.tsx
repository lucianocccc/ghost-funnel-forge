// Ghost Funnel Revolution - Main Dashboard Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Zap,
  TrendingUp,
  Target,
  Users,
  Rocket,
  BarChart3,
  FileText,
  Lightbulb,
  Crown,
  Star,
  ArrowUpRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { AIRecommendationService } from '@/services/revolutionServices';
import { AIRecommendation } from '@/types/revolutionTypes';
import DocumentAnalysisUploader from './DocumentAnalysisUploader';
import IntelligentRecommendations from './IntelligentRecommendations';
import BehaviorTracker from './BehaviorTracker';

export const RevolutionDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    aiOptimizations: 0,
    revenueGrowth: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load AI recommendations
      const recs = await AIRecommendationService.getUserRecommendations();
      setRecommendations(recs);

      // Simulate loading dashboard stats (implement with real data)
      setTimeout(() => {
        setStats({
          totalLeads: 247,
          conversionRate: 18.5,
          aiOptimizations: 12,
          revenueGrowth: 34.7
        });
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Errore di caricamento",
        description: "Impossibile caricare i dati della dashboard",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    gradient 
  }: {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    gradient: string;
  }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600 font-medium">{change}</span> vs mese scorso
        </p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Caricamento Intelligence...</h3>
            <p className="text-muted-foreground">Preparazione della dashboard rivoluzionaria</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white rounded-lg p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ghost Funnel Revolution</h1>
              <p className="text-white/90">La piattaforma SaaS più intelligente per lead generation</p>
            </div>
            <Badge className="ml-auto bg-yellow-500 text-yellow-900 border-0">
              <Crown className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Analisi Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Targeting Intelligente</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>Ottimizzazione Automatica</span>
            </div>
          </div>
        </div>
        
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lead Totali"
          value={stats.totalLeads}
          change="+23%"
          icon={Users}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="+5.2%"
          icon={TrendingUp}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Ottimizzazioni AI"
          value={stats.aiOptimizations}
          change="+8"
          icon={Brain}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Crescita Revenue"
          value={`+${stats.revenueGrowth}%`}
          change="+12.3%"
          icon={DollarSign}
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Intelligence Hub
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Analisi Documenti
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Behavior Tracking
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Raccomandazioni AI
                </CardTitle>
                <CardDescription>
                  Insights intelligenti per ottimizzare le performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntelligentRecommendations recommendations={recommendations} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-500" />
                  Azioni Rapide
                </CardTitle>
                <CardDescription>
                  Accelera il tuo workflow con funzioni smart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Genera Funnel AI
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Analizza Audience
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Market Intelligence
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Ottimizza Conversioni
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Monitoraggio real-time delle metriche chiave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-sm text-muted-foreground">18.5%</span>
                </div>
                <Progress value={85} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lead Quality Score</span>
                  <span className="text-sm text-muted-foreground">92/100</span>
                </div>
                <Progress value={92} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Optimization Level</span>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentAnalysisUploader onAnalysisComplete={(analysis) => {
            toast({
              title: "✨ Analisi completata!",
              description: "I risultati sono disponibili nella sezione Intelligence",
            });
          }} />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorTracker />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>
                Analytics avanzate e predittive per il tuo business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Analytics Avanzate</h3>
                  <p className="text-muted-foreground max-w-md">
                    Pannello di controllo completo con metriche predittive, 
                    analisi comportamentali e insights di mercato in tempo reale.
                  </p>
                  <Button className="mt-4">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Esplora Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevolutionDashboard;