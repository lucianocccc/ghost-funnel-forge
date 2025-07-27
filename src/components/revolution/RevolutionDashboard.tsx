import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Sparkles, BarChart3, Users, Lightbulb, Rocket, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import RevolutionChatInterface from './RevolutionChatInterface';

const RevolutionDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [step, setStep] = useState<'chat' | 'results'>('chat');
  const [funnelResult, setFunnelResult] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleFunnelGenerated = (funnel: any) => {
    setFunnelResult(funnel);
    setStep('results');
    
    toast({
      title: "Revolutionary Funnel Created!",
      description: "Your hyper-personalized funnel has been generated and saved.",
    });
  };

  if (step === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-10 h-10 text-primary" />
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Revolution Funnel Engine
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI that deeply understands your customers through natural conversation 
              and creates hyper-personalized funnels that convert like magic.
            </p>
          </div>

          <RevolutionChatInterface onFunnelGenerated={handleFunnelGenerated} />
        </div>
      </div>
    );
  }

  if (step === 'results' && funnelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Your Revolutionary Funnel is Ready!</h2>
            <p className="text-lg text-muted-foreground">
              Hyper-personalized based on deep customer intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {funnelResult.performancePrediction?.score || 85}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Predicted conversion rate based on customer psychology analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personalization Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {funnelResult.personalization?.level || 92}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on customer intelligence depth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-2">
                  {funnelResult.insights?.length || 12}
                </div>
                <p className="text-sm text-muted-foreground">
                  Strategic recommendations generated
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Funnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Conversion Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    {funnelResult.conversionStrategy?.summary || 'Advanced multi-step conversion strategy tailored to customer psychology'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Badge variant="secondary">Hyper-personalized copy</Badge>
                    <Badge variant="secondary">Psychology-based design</Badge>
                    <Badge variant="secondary">Intelligent objection handling</Badge>
                    <Badge variant="secondary">Trust signal optimization</Badge>
                  </div>
                </div>
                
                {funnelResult.insights && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Insights</h4>
                    <div className="space-y-2">
                      {funnelResult.insights.slice(0, 3).map((insight: string, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/revolution/funnels'}
                  >
                    View All Funnels
                  </Button>
                  <Button onClick={() => {
                    setStep('chat');
                    setFunnelResult(null);
                  }}>
                    Create Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default RevolutionDashboard;