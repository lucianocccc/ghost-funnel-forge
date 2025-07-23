
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStrategicInsights } from '@/hooks/useStrategicInsights';
import { TrendingUp, Zap, Target, Crown, BarChart3, Rocket } from 'lucide-react';

const StrategicDashboard = () => {
  const { marketData, aiCredits, subscriptionPlans, loading, loadMarketIntelligence, trackBehavior } = useStrategicInsights();
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    loadMarketIntelligence();
    trackBehavior('strategic_dashboard_view');
  }, []);

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    loadMarketIntelligence(industry);
    trackBehavior('industry_filter', { industry });
  };

  const creditUsagePercentage = aiCredits 
    ? Math.round((aiCredits.credits_used / (aiCredits.credits_used + aiCredits.credits_available)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Command Center</h1>
          <p className="text-muted-foreground">
            Million-dollar product intelligence and scaling insights
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <Crown className="w-4 h-4 mr-1" />
          Strategic Mode
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiCredits?.credits_available || 0}
            </div>
            <Progress value={100 - creditUsagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {aiCredits?.credits_used || 0} used this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active intelligence reports
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
            <p className="text-xs text-muted-foreground mt-2">
              Available tiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scaling Status</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Phase 1</div>
            <p className="text-xs text-muted-foreground mt-2">
              Foundation building
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="intelligence" className="space-y-4">
        <TabsList>
          <TabsTrigger value="intelligence">Market Intelligence</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
          <TabsTrigger value="scaling">Scaling Roadmap</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence Reports</CardTitle>
              <CardDescription>
                Real-time competitive analysis and market opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {['SaaS', 'E-commerce', 'Marketing', 'Healthcare', 'Finance'].map((industry) => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleIndustrySelect(industry)}
                  >
                    {industry}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading intelligence...</p>
                </div>
              ) : marketData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketData.map((intel) => (
                    <Card key={intel.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">{intel.industry} Market</CardTitle>
                        <Badge variant="secondary">
                          {Math.round(intel.confidence_score * 100)}% Confidence
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Key Trends:</strong>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground">
                              {Object.keys(intel.market_trends).slice(0, 3).map((trend, idx) => (
                                <li key={idx}>{trend}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm">
                            <strong>Opportunities:</strong> 
                            <span className="text-muted-foreground ml-1">
                              {Object.keys(intel.opportunity_analysis).length} identified
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedIndustry 
                      ? `No intelligence data for ${selectedIndustry} yet`
                      : 'No market intelligence data available'
                    }
                  </p>
                  <Button className="mt-4" onClick={() => loadMarketIntelligence()}>
                    Generate Intelligence Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`${plan.tier === 'enterprise' ? 'border-2 border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.tier === 'enterprise' && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price_monthly}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.price_yearly}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>AI Credits:</strong> {plan.ai_credits_included.toLocaleString()}
                    </div>
                    <div className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center">
                          ✓ {feature}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant={plan.tier === 'enterprise' ? 'default' : 'outline'}>
                      Choose Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Scaling Roadmap</CardTitle>
              <CardDescription>
                Strategic milestones toward $1M ARR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: 'Phase 1: Foundation (Months 1-3)', progress: 75, status: 'In Progress' },
                  { phase: 'Phase 2: Market Expansion (Months 4-6)', progress: 25, status: 'Planned' },
                  { phase: 'Phase 3: Enterprise Ready (Months 7-9)', progress: 0, status: 'Planned' },
                  { phase: 'Phase 4: Scale & Exit Prep (Months 10-12)', progress: 0, status: 'Planned' },
                ].map((milestone, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{milestone.phase}</h4>
                      <Badge variant={milestone.status === 'In Progress' ? 'default' : 'secondary'}>
                        {milestone.status}
                      </Badge>
                    </div>
                    <Progress value={milestone.progress} />
                    <p className="text-sm text-muted-foreground">{milestone.progress}% Complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Revenue</CardTitle>
                <CardDescription>Monthly recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">
                  Target: $83,333/month for $1M ARR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Marketplace</CardTitle>
                <CardDescription>Premium template sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">
                  Commission-based revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>White Label</CardTitle>
                <CardDescription>Enterprise licensing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">
                  High-margin recurring revenue
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategicDashboard;
