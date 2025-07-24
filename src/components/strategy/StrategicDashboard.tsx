
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Users, 
  BarChart3, 
  Lightbulb,
  Zap,
  Crown,
  RefreshCw
} from 'lucide-react';
import { useStrategicInsights } from '@/hooks/useStrategicInsights';
import AICreditsWidget from '@/components/strategy/AICreditsWidget';
import { useToast } from '@/hooks/use-toast';

const StrategicDashboard: React.FC = () => {
  const { 
    marketData, 
    aiCredits, 
    subscriptionPlans, 
    premiumTemplates,
    loading,
    loadMarketIntelligence,
    consumeAICredits,
    trackBehavior
  } = useStrategicInsights();
  
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadMarketIntelligence();
    trackBehavior('strategic_dashboard_view');
  }, []);

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
    loadMarketIntelligence(industry);
    trackBehavior('industry_filter_change', { industry });
  };

  const handleAnalyzeMarket = async () => {
    try {
      const consumed = await consumeAICredits(5);
      if (consumed) {
        toast({
          title: "Analisi di Mercato",
          description: "Stiamo analizzando le tendenze del mercato...",
        });
        trackBehavior('market_analysis_started');
      }
    } catch (error) {
      toast({
        title: "Crediti Insufficienti",
        description: "Non hai abbastanza crediti AI per questa analisi",
        variant: "destructive",
      });
    }
  };

  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered market insights and strategic analysis
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <AICreditsWidget compact />
          <Button onClick={handleAnalyzeMarket} className="gap-2">
            <Brain className="h-4 w-4" />
            Analyze Market
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
          <TabsTrigger value="templates">Premium Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Insights</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active market analyses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiCredits?.credits_available || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Templates</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{premiumTemplates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Plans</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available plans
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Latest market intelligence and strategic recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : marketData.length > 0 ? (
                  <div className="space-y-4">
                    {marketData.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="border-l-4 border-primary pl-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{insight.industry}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(insight.analyzed_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-2">
                          Confidence: {insight.confidence_score}%
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No market insights available yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={handleAnalyzeMarket}
                    >
                      Generate Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <AICreditsWidget />
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Market Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered market analysis and competitive insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedIndustry} 
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <Button onClick={handleAnalyzeMarket} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {marketData.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{insight.industry}</CardTitle>
                      <Badge variant="outline">
                        {insight.confidence_score}% confidence
                      </Badge>
                    </div>
                    <CardDescription>
                      Analyzed {new Date(insight.analyzed_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm">Market Trends</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.market_trends?.summary || 'No trends available'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Key Opportunities</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.opportunity_analysis?.summary || 'No opportunities identified'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Premium Templates</h3>
              <p className="text-sm text-muted-foreground">
                High-converting templates designed by experts
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {premiumTemplates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">
                      €{template.price}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.description || 'Premium template'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Category</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rating</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{template.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sales</span>
                      <span>{template.sales_count}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Crown className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Credits Used</span>
                    <span className="font-semibold">{aiCredits?.credits_used || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Analyses</span>
                    <span className="font-semibold">{marketData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Templates Used</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Plan</span>
                    <Badge>Free</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credits Remaining</span>
                    <span className="font-semibold">{aiCredits?.credits_available || 0}</span>
                  </div>
                  <Button className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategicDashboard;
