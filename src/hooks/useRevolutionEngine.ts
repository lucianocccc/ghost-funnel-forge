import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CustomerData {
  industry: string;
  targetAudience: string;
  primaryGoal: string;
  currentChallenges: string;
  budget: string;
  timeline: string;
}

interface RevolutionProfile {
  id: string;
  customer_data: any;
  psychographic_profile: any;
  behavioral_patterns: any;
  pain_points: any[];
  motivations: any[];
  intelligence_score: number;
  profile_completeness: number;
}

interface QuestionSequence {
  id: string;
  session_id: string;
  question_sequence: any[];
  current_question_index: number;
  responses: Record<string, string>;
  completion_status: string;
}

export const useRevolutionEngine = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerProfiles, setCustomerProfiles] = useState<RevolutionProfile[]>([]);
  const [currentQuestionSequence, setCurrentQuestionSequence] = useState<QuestionSequence | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const analyzeCustomer = async (customerData: CustomerData) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'analyze_customer',
          customerData
        }
      });

      if (error) throw error;

      await loadCustomerProfiles();
      
      toast({
        title: "Customer Analysis Complete",
        description: `Intelligence score: ${Math.round(data.profile.intelligence_score)}%`,
      });

      return data;
    } catch (error) {
      console.error('Error analyzing customer:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze customer data. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async (customerData: CustomerData, sessionId?: string) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'generate_questions',
          customerData,
          sessionId
        }
      });

      if (error) throw error;

      toast({
        title: "Intelligent Questions Generated",
        description: `${data.questions.length} strategic questions created for deep insights.`,
      });

      return data;
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Question Generation Failed",
        description: "Could not generate questions. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createRevolutionFunnel = async (customerData: CustomerData, questionResponses: Record<string, string>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revolution-funnel-engine', {
        body: {
          action: 'create_funnel',
          customerData,
          questionResponses
        }
      });

      if (error) throw error;

      toast({
        title: "Revolutionary Funnel Created!",
        description: "Your hyper-personalized funnel is ready for deployment.",
      });

      return data;
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast({
        title: "Funnel Creation Failed",
        description: "Could not create funnel. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('revolution_customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomerProfiles((data || []) as RevolutionProfile[]);
    } catch (error) {
      console.error('Error loading customer profiles:', error);
    }
  };

  const loadQuestionSequences = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('revolution_question_sequences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading question sequences:', error);
      return [];
    }
  };

  const updateQuestionResponse = async (sequenceId: string, questionId: string, response: string) => {
    try {
      const { data: sequence } = await supabase
        .from('revolution_question_sequences')
        .select('responses')
        .eq('id', sequenceId)
        .single();

      const currentResponses = (sequence?.responses as Record<string, string>) || {};
      const updatedResponses = {
        ...currentResponses,
        [questionId]: response
      };

      const { error } = await supabase
        .from('revolution_question_sequences')
        .update({ responses: updatedResponses })
        .eq('id', sequenceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating question response:', error);
      throw error;
    }
  };

  const getFunnelTemplates = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('revolution_funnel_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading funnel templates:', error);
      return [];
    }
  };

  const getLearningMemory = async (memoryType?: string) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('revolution_learning_memory')
        .select('*')
        .eq('user_id', user.id);

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      const { data, error } = await query
        .order('success_rate', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading learning memory:', error);
      return [];
    }
  };

  const getPerformanceAnalytics = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('revolution_performance_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading performance analytics:', error);
      return [];
    }
  };

  return {
    isLoading,
    customerProfiles,
    currentQuestionSequence,
    analyzeCustomer,
    generateQuestions,
    createRevolutionFunnel,
    loadCustomerProfiles,
    loadQuestionSequences,
    updateQuestionResponse,
    getFunnelTemplates,
    getLearningMemory,
    getPerformanceAnalytics,
  };
};