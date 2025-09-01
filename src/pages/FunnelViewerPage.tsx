
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GhostFunnelRenderer } from '@/components/funnel-viewer/GhostFunnelRenderer';
import { 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Loader2,
  Share2,
  Heart,
  Star,
  Users
} from 'lucide-react';

interface FunnelStep {
  id: string;
  title: string;
  description: string;
  step_type: string;
  step_order: number;
  fields_config: any;
  settings: any;
  funnel_id: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

interface InteractiveFunnel {
  id: string;
  name: string;
  description: string;
  status: string;
  is_public: boolean;
  views_count: number;
  submissions_count: number;
  share_token: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  ai_funnel_id: string;
  settings: any;
  interactive_funnel_steps: FunnelStep[];
  revolution_funnel_templates?: any[];
}

const FunnelViewerPage = () => {
  const { shareToken } = useParams();
  const { toast } = useToast();
  const [funnel, setFunnel] = useState<InteractiveFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (shareToken) {
      loadFunnel();
    }
  }, [shareToken]);

  const loadFunnel = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_interactive_funnel_views', {
        share_token_param: shareToken
      });

      // Fetch funnel data using secure function
      const { data, error } = await supabase
        .rpc('get_shared_funnel_safe', {
          share_token_param: shareToken
        })
        .single();

      if (error) {
        console.error('Error loading funnel:', error);
        toast({
          title: "Error",
          description: "Funnel not found or not accessible",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match the expected interface
      const steps = Array.isArray(data.steps) ? (data.steps as unknown as FunnelStep[]) : [];
      
      const transformedData = {
        ...data,
        interactive_funnel_steps: steps,
        created_by: '', // Not needed for viewing
        ai_funnel_id: '', // Not needed for viewing
        settings: {}, // Default empty settings
        revolution_funnel_templates: [] // Default empty array
      };

      // Sort steps by order
      if (transformedData.interactive_funnel_steps && transformedData.interactive_funnel_steps.length > 0) {
        transformedData.interactive_funnel_steps.sort((a: FunnelStep, b: FunnelStep) => 
          a.step_order - b.step_order
        );
      }

      setFunnel(transformedData as InteractiveFunnel);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleNext = async () => {
    const currentStepData = funnel?.interactive_funnel_steps?.[currentStep];
    
    if (currentStepData && currentStep < (funnel?.interactive_funnel_steps?.length || 0) - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final submission
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (customFormData?: Record<string, any>) => {
    if (!funnel) return;

    setSubmitting(true);
    const submissionData = customFormData || formData;
    
    try {
      const { error } = await supabase
        .from('funnel_submissions')
        .insert({
          funnel_id: funnel.id,
          step_id: funnel.settings?.ghost_funnel ? null : funnel.interactive_funnel_steps[currentStep]?.id,
          submission_data: submissionData,
          user_email: submissionData.email,
          user_name: submissionData.name || submissionData.nome,
          source: funnel.settings?.ghost_funnel ? 'ghost_funnel' : 'revolution_funnel',
          utm_source: 'direct',
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      setCompleted(true);
      toast({
        title: "Success!",
        description: "Your submission has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const { type, label, name, required, options, placeholder } = field;

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            <Input
              type={type}
              placeholder={placeholder || label}
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            <Textarea
              placeholder={placeholder || label}
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
              rows={4}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
            >
              <option value="">Select an option...</option>
              {options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading funnel...</p>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funnel Not Found</h3>
            <p className="text-muted-foreground">
              This funnel is not available or has been made private.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-6">
              Your submission has been received successfully.
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = funnel.interactive_funnel_steps?.[currentStep];
  // Check if this is a Ghost Funnel
  const isGhostFunnel = funnel.settings?.ghost_funnel && funnel.settings?.original_ghost_data;
  
  if (isGhostFunnel) {
    return (
      <GhostFunnelRenderer
        funnelData={funnel.settings.original_ghost_data}
        onFormSubmit={handleSubmit}
        formData={formData}
        onFormChange={handleFieldChange}
        submitting={submitting}
      />
    );
  }

  const progress = ((currentStep + 1) / (funnel.interactive_funnel_steps?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{funnel.name}</h1>
          {funnel.description && (
            <p className="text-muted-foreground">{funnel.description}</p>
          )}
          
          {/* Funnel Type Badges */}
          <div className="mt-4 flex justify-center space-x-2">
            {funnel.settings?.smart_funnel && (
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-600 border-purple-200">
                🧠 Smart AI Funnel
              </Badge>
            )}
            {funnel.settings?.ghost_funnel && (
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-600 border-orange-200">
                👻 Ghost AI Funnel
              </Badge>
            )}
            {funnel.revolution_funnel_templates && funnel.revolution_funnel_templates.length > 0 && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-200">
                ⚡ Revolution AI Funnel
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {funnel.interactive_funnel_steps?.length || 0}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData?.title}</CardTitle>
            {currentStepData?.description && (
              <p className="text-muted-foreground">{currentStepData.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {Array.isArray(currentStepData?.fields_config) 
                ? currentStepData.fields_config.map((field: any) => renderField(field))
                : currentStepData?.fields_config 
                  ? [currentStepData.fields_config].map((field: any) => renderField(field))
                  : []
              }
              
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : currentStep === (funnel.interactive_funnel_steps?.length || 0) - 1 ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {currentStep === (funnel.interactive_funnel_steps?.length || 0) - 1 ? 'Submit' : 'Next'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stats Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{funnel.views_count} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{funnel.submissions_count} submissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelViewerPage;
