
import { useState } from 'react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useToast } from '@/hooks/use-toast';
import { calculateScoreForRules } from '@/utils/scoringCalculation';

export const useTestPanel = () => {
  const { templates, sendEmail } = useEmailTemplates();
  const { rules } = useLeadScoring();
  const { toast } = useToast();
  
  const [testData, setTestData] = useState({
    message: '',
    tone: '',
    urgency: '',
    email: 'test@example.com'
  });
  
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    breakdown: Record<string, any>;
    suggestedTemplate?: any;
  } | null>(null);

  const handleSimulateScoring = () => {
    const mockLeadData = {
      bio: testData.message,
      message_length: testData.message.length,
      source: 'test',
      response_time_minutes: 5
    };

    const { totalScore, breakdown } = calculateScoreForRules(mockLeadData, rules);
    
    // Simple template suggestion based on score
    let suggestedTemplate = null;
    if (templates.length > 0) {
      if (totalScore > 50) {
        suggestedTemplate = templates.find(t => t.name.toLowerCase().includes('premium')) || templates[0];
      } else {
        suggestedTemplate = templates.find(t => t.name.toLowerCase().includes('basic')) || templates[0];
      }
    }

    setScoreResult({
      score: totalScore,
      breakdown,
      suggestedTemplate
    });

    toast({
      title: "Scoring Simulato",
      description: `Punteggio calcolato: ${totalScore} punti`,
    });
  };

  const handleSendTestEmail = async () => {
    if (!scoreResult?.suggestedTemplate) {
      toast({
        title: "Errore",
        description: "Prima simula il scoring per ottenere un template suggerito",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendEmail('00000000-0000-0000-0000-000000000000', scoreResult.suggestedTemplate.id, {
        nome: 'Test User',
        messaggio: testData.message,
        punteggio: scoreResult.score.toString()
      });
      
      toast({
        title: "Email Test Inviata",
        description: `Email di test inviata a ${testData.email}`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio dell'email di test",
        variant: "destructive",
      });
    }
  };

  return {
    testData,
    setTestData,
    scoreResult,
    handleSimulateScoring,
    handleSendTestEmail
  };
};
