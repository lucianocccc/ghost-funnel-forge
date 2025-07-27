
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Sparkles,
  BarChart3,
  Users,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerProfile {
  id: string;
  intelligence_score: number;
  profile_completeness: number;
  psychographic_profile: any;
  behavioral_patterns: any;
  pain_points: any[];
  motivations: any[];
}

interface QuestionSequence {
  id: string;
  question_sequence: any[];
  current_question_index: number;
  completion_status: string;
  intelligence_gathered: number;
}

const RevolutionDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [step, setStep] = useState<'initial' | 'questions' | 'generation' | 'results'>('initial');
  const [customerData, setCustomerData] = useState({
    industry: '',
    targetAudience: '',
    primaryGoal: '',
    currentChallenges: '',
    budget: '',
    timeline: ''
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [funnelResult, setFunnelResult] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadCustomerProfile();
      }
    };
    getUser();
  }, []);

  const loadCustomerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('revolution_customer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCustomerProfile(data as CustomerProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const startRevolutionProcess = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First analyze customer data
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'analyze_customer',
          customerData
        }
      });

      if (analysisError) throw analysisError;

      setCustomerProfile(analysisResult.profile);

      // Generate intelligent questions
      const { data: questionsResult, error: questionsError } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'generate_questions',
          customerData,
          sessionId: crypto.randomUUID()
        }
      });

      if (questionsError) throw questionsError;

      setQuestions(questionsResult.questions);
      setSessionId(questionsResult.sessionId);
      setStep('questions');

      toast({
        title: "Intelligence Analysis Complete",
        description: `Generated ${questionsResult.questions.length} strategic questions for deep customer insights.`,
      });

    } catch (error) {
      console.error('Error starting revolution process:', error);
      toast({
        title: "Error",
        description: "Failed to start revolution process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionResponse = (questionId: string, response: string) => {
    setQuestionResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      generateRevolutionFunnel();
    }
  };

  const generateRevolutionFunnel = async () => {
    setIsLoading(true);
    setStep('generation');

    try {
      const { data: funnelResult, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'create_funnel',
          customerData,
          questionResponses
        }
      });

      if (error) throw error;

      setFunnelResult(funnelResult);
      setStep('results');

      toast({
        title: "Revolutionary Funnel Created!",
        description: "Your hyper-personalized funnel has been generated with advanced AI intelligence.",
      });

    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Error",
        description: "Failed to generate funnel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
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
              Advanced AI that deeply understands your customers, asks intelligent questions, 
              and creates hyper-personalized funnels that convert like magic.
            </p>
          </div>

          {customerProfile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Customer Intelligence Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Intelligence Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={customerProfile.intelligence_score} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(customerProfile.intelligence_score)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Completeness</p>
                    <div className="flex items-center gap-2">
                      <Progress value={customerProfile.profile_completeness} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(customerProfile.profile_completeness)}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pain Points</p>
                    <div className="flex flex-wrap gap-1">
                      {customerProfile.pain_points?.slice(0, 3).map((point: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{point}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Core Motivations</p>
                    <div className="flex flex-wrap gap-1">
                      {customerProfile.motivations?.slice(0, 3).map((motivation: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{motivation}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Initial Customer Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Industry/Niche</label>
                  <Input
                    value={customerData.industry}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, Coaching"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    value={customerData.targetAudience}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., Small business owners, Entrepreneurs"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Primary Goal</label>
                <Input
                  value={customerData.primaryGoal}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                  placeholder="What do you want to achieve with this funnel?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Challenges</label>
                <Textarea
                  value={customerData.currentChallenges}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, currentChallenges: e.target.value }))}
                  placeholder="What specific challenges are you facing with your current approach?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget Range</label>
                  <Input
                    value={customerData.budget}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., $1K-5K, $10K+"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Timeline</label>
                  <Input
                    value={customerData.timeline}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., ASAP, 1 month, 3 months"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={startRevolutionProcess}
              disabled={isLoading || !customerData.industry || !customerData.targetAudience}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isLoading ? (
                <>
                  <Brain className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Customer Intelligence...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Revolution Process
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Deep Customer Intelligence</h2>
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              These strategic questions help create your perfect customer profile
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {currentQuestion?.text}
              </CardTitle>
              {currentQuestion?.purpose && (
                <p className="text-sm text-muted-foreground">
                  Purpose: {currentQuestion.purpose}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={questionResponses[currentQuestion?.id] || ''}
                onChange={(e) => handleQuestionResponse(currentQuestion?.id, e.target.value)}
                placeholder="Please provide a detailed response..."
                rows={5}
              />
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={!questionResponses[currentQuestion?.id]?.trim()}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Generate Funnel' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'generation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
            </div>
            <h2 className="text-3xl font-bold">Creating Your Revolutionary Funnel</h2>
            <p className="text-lg text-muted-foreground">
              Our AI is analyzing your customer intelligence and crafting a hyper-personalized funnel...
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" />
                Applying customer psychology insights
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Target className="w-4 h-4" />
                Optimizing conversion triggers
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                Personalizing copy and design
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && funnelResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
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
                  {customerProfile?.intelligence_score ? Math.round(customerProfile.intelligence_score) : 85}%
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
                  {funnelResult.funnel?.insights?.length || 12}
                </div>
                <p className="text-sm text-muted-foreground">
                  Strategic recommendations generated
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Funnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Conversion Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    {JSON.stringify(funnelResult.funnel?.conversionStrategy?.summary || 'Advanced multi-step conversion strategy tailored to customer psychology')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Badge>Hyper-personalized copy</Badge>
                    <Badge>Psychology-based design</Badge>
                    <Badge>Intelligent objection handling</Badge>
                    <Badge>Trust signal optimization</Badge>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => window.open('/funnels/new', '_blank')}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy Funnel
                  </Button>
                  <Button variant="outline" onClick={() => setStep('initial')}>
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
