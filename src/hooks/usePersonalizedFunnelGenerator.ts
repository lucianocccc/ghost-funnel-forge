import { useState, useCallback } from 'react';
import { revolutionFunnelIntegrator, CustomerProfileData, PersonalizedFunnelRequest } from '@/services/revolutionFunnelIntegrator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface PersonalizedFunnelOptions {
  customerData?: any;
  questionResponses?: Record<string, string>;
  prompt?: string;
  saveToLibrary?: boolean;
  funnelTypeId?: string;
}

export interface PersonalizedFunnelResult {
  success: boolean;
  funnel?: any;
  customerProfile?: CustomerProfileData;
  error?: string;
}

export const usePersonalizedFunnelGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileData | null>(null);
  const [lastGeneratedFunnel, setLastGeneratedFunnel] = useState<any>(null);

  const generatePersonalizedFunnel = useCallback(async (
    options: PersonalizedFunnelOptions
  ): Promise<PersonalizedFunnelResult> => {
    if (!user?.id) {
      return {
        success: false,
        error: 'Utente non autenticato'
      };
    }

    setIsGenerating(true);

    try {
      console.log('🚀 Starting personalized funnel generation...');

      // Step 1: Extract customer profile from Revolution Engine data
      let profile: CustomerProfileData;
      
      if (options.customerData && options.questionResponses) {
        console.log('📊 Extracting customer profile from Revolution Engine data...');
        profile = revolutionFunnelIntegrator.extractCustomerProfile(
          options.customerData,
          options.questionResponses
        );
        setCustomerProfile(profile);
      } else {
        console.log('⚡ Using fallback customer profile...');
        profile = {
          businessInfo: {
            name: 'Cliente',
            industry: 'generale',
            targetAudience: 'Professionisti',
            keyBenefits: ['Soluzioni innovative', 'Risultati garantiti']
          },
          psychographics: {
            painPoints: ['Inefficienze operative'],
            motivations: ['Crescita del business'],
            preferredTone: 'professionale',
            communicationStyle: 'bilanciato'
          },
          behavioralData: {
            engagementLevel: 7,
            conversionIntent: 6,
            informationGatheringStyle: 'standard'
          },
          conversionStrategy: {
            primaryGoal: 'Generare lead qualificati',
            secondaryGoals: ['Aumentare la brand awareness'],
            keyMessages: ['Soluzioni innovative', 'Approccio personalizzato']
          }
        };
        setCustomerProfile(profile);
      }

      // Step 2: Generate intelligent prompt
      const intelligentPrompt = options.prompt || `
        Crea un funnel di conversione ottimizzato per:
        - Business: ${profile.businessInfo?.name}
        - Settore: ${profile.businessInfo?.industry}
        - Target: ${profile.businessInfo?.targetAudience}
        - Pain points principali: ${profile.psychographics?.painPoints.join(', ')}
        - Obiettivo: ${profile.conversionStrategy?.primaryGoal}
        
        Il funnel deve essere personalizzato per questo specifico cliente e ottimizzato per massimizzare le conversioni.
      `;

      console.log('🎯 Generated intelligent prompt:', intelligentPrompt);

      // Step 3: Generate personalized funnel
      console.log('🔄 Calling Revolution Funnel Integrator...');
      const result = await revolutionFunnelIntegrator.generatePersonalizedFunnel({
        prompt: intelligentPrompt,
        userId: user.id,
        customerProfile: profile,
        saveToLibrary: options.saveToLibrary ?? true,
        funnelTypeId: options.funnelTypeId
      });

      if (result.success && result.funnel) {
        console.log('✅ Personalized funnel generated successfully');
        setLastGeneratedFunnel(result.funnel);
        
        toast({
          title: "Funnel personalizzato creato!",
          description: "Il tuo funnel è stato generato utilizzando i dati raccolti dal Revolution Engine.",
        });

        return {
          success: true,
          funnel: result.funnel,
          customerProfile: profile
        };
      } else {
        throw new Error(result.error || 'Errore nella generazione del funnel');
      }

    } catch (error) {
      console.error('❌ Error generating personalized funnel:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      
      toast({
        title: "Errore nella generazione",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage,
        customerProfile: customerProfile
      };
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, toast, customerProfile]);

  const generateFormConfiguration = useCallback((stepType: string) => {
    if (!customerProfile) {
      return { fields: [], validation: {}, flow: {}, personalization: {} };
    }

    console.log('🔧 Generating personalized form configuration for step:', stepType);
    return revolutionFunnelIntegrator.generatePersonalizedFormConfig(customerProfile, stepType);
  }, [customerProfile]);

  const resetGenerator = useCallback(() => {
    setCustomerProfile(null);
    setLastGeneratedFunnel(null);
    setIsGenerating(false);
  }, []);

  const updateCustomerProfile = useCallback((newProfile: Partial<CustomerProfileData>) => {
    setCustomerProfile(prev => prev ? { ...prev, ...newProfile } : newProfile as CustomerProfileData);
  }, []);

  return {
    // State
    isGenerating,
    customerProfile,
    lastGeneratedFunnel,
    
    // Actions
    generatePersonalizedFunnel,
    generateFormConfiguration,
    resetGenerator,
    updateCustomerProfile,
    
    // Utilities
    hasCustomerProfile: !!customerProfile,
    isReady: !!user?.id
  };
};

export default usePersonalizedFunnelGenerator;