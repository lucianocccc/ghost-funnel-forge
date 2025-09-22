import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LegalComplianceValidator } from '@/services/legalComplianceValidator';
import { supabase } from '@/integrations/supabase/client';

export interface LegalFunnelRequest {
  studioType: 'penale' | 'civile' | 'commerciale' | 'societario' | 'tributario' | 'notarile';
  servizi: string[];
  targetAudience: 'privati' | 'pmi' | 'grandi_aziende' | 'enti_pubblici';
  budgetMedio: string;
  urgenza: 'bassa' | 'media' | 'alta';
  nomeStudio: string;
  citta: string;
  specializzazioni: string[];
  anni_esperienza: number;
}

export interface GeneratedLegalFunnel {
  id: string;
  name: string;
  description: string;
  html_content: string;
  compliance_status: {
    isCompliant: boolean;
    issues: any[];
    score: number;
  };
  legal_elements: {
    disclaimer: string;
    privacy_policy: string;
    gdpr_consent: string;
    professional_credentials: string;
  };
  funnel_structure: {
    steps: Array<{
      type: 'legal_assessment' | 'document_upload' | 'calendar_booking' | 'contact_form';
      title: string;
      description: string;
      fields: any[];
    }>;
  };
  visual_theme: {
    primary_color: string;
    secondary_color: string;
    font_family: string;
    layout_style: string;
  };
}

export const useLegalFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedLegalFunnel | null>(null);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateLegalFunnel = async (request: LegalFunnelRequest): Promise<GeneratedLegalFunnel | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel legali",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    console.log('🏛️ Generating legal funnel:', {
      studioType: request.studioType,
      servizi: request.servizi,
      nomeStudio: request.nomeStudio
    });

    try {
      // Chiama la funzione edge specializzata per studi legali
      const { data, error } = await supabase.functions.invoke('legal-funnel-generator', {
        body: {
          ...request,
          userId: user.id,
          compliance_guidelines: LegalComplianceValidator.getComplianceGuidelines()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data.funnel) {
        // Validazione compliance automatica
        const complianceResult = LegalComplianceValidator.validateFunnelContent(data.funnel);
        
        const legalFunnel: GeneratedLegalFunnel = {
          ...data.funnel,
          compliance_status: {
            isCompliant: complianceResult.isCompliant,
            issues: complianceResult.issues,
            score: complianceResult.isCompliant ? 100 : Math.max(0, 100 - (complianceResult.issues.length * 10))
          }
        };

        setGeneratedFunnel(legalFunnel);
        setComplianceReport(complianceResult);

        toast({
          title: "🎉 Funnel Legale Generato!",
          description: `Funnel professionale per ${request.nomeStudio} creato con conformità deontologica verificata`,
          duration: 5000,
        });

        console.log('✅ Legal funnel generated successfully:', {
          complianceScore: legalFunnel.compliance_status.score,
          stepsCount: legalFunnel.funnel_structure?.steps?.length || 0,
          hasHtml: !!legalFunnel.html_content
        });

        return legalFunnel;
      } else {
        throw new Error(data.error || 'Generazione non riuscita');
      }

    } catch (error) {
      console.error('💥 Legal funnel generation failed:', error);
      
      let errorMessage = "Errore nella generazione del funnel legale";
      
      if (error instanceof Error) {
        if (error.message.includes('compliance')) {
          errorMessage = "Errore di conformità deontologica. Rivedere i parametri.";
        } else if (error.message.includes('autenticazione')) {
          errorMessage = "Errore di autenticazione. Rieffettua il login.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLegalFunnel = async (funnel: GeneratedLegalFunnel) => {
    try {
      const { data, error } = await supabase.functions.invoke('save-legal-funnel', {
        body: {
          userId: user?.id,
          funnel,
          complianceReport
        }
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Funnel Salvato",
        description: "Il funnel legale è stato salvato con successo",
      });

      return data;
    } catch (error) {
      console.error('Error saving legal funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del funnel",
        variant: "destructive",
      });
      return null;
    }
  };

  const clearResults = () => {
    setGeneratedFunnel(null);
    setComplianceReport(null);
  };

  return {
    isGenerating,
    generatedFunnel,
    complianceReport,
    generateLegalFunnel,
    saveLegalFunnel,
    clearResults
  };
};