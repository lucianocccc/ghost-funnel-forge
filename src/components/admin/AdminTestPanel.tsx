
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useToast } from '@/hooks/use-toast';
import { calculateScoreForRules } from '@/utils/scoringCalculation';
import { TestTube, Send } from 'lucide-react';

const AdminTestPanel: React.FC = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TestTube className="w-5 h-5" />
          Test AI/Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Messaggio Lead
              </label>
              <Textarea
                placeholder="Inserisci il messaggio del lead..."
                value={testData.message}
                onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tono
                </label>
                <Select value={testData.tone} onValueChange={(value) => setTestData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Seleziona tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positivo">Positivo</SelectItem>
                    <SelectItem value="neutro">Neutro</SelectItem>
                    <SelectItem value="negativo">Negativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Urgenza
                </label>
                <Select value={testData.urgency} onValueChange={(value) => setTestData(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Seleziona urgenza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="bassa">Bassa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Test
              </label>
              <Input
                type="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button 
              onClick={handleSimulateScoring}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!testData.message}
            >
              Simula Scoring
            </Button>
          </div>

          <div className="space-y-4">
            {scoreResult && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Risultato Scoring</h4>
                <div className="space-y-2">
                  <p className="text-golden text-xl font-bold">
                    Punteggio: {scoreResult.score} punti
                  </p>
                  
                  {Object.keys(scoreResult.breakdown).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Breakdown:</p>
                      {Object.entries(scoreResult.breakdown).map(([rule, data]: [string, any]) => (
                        <p key={rule} className="text-xs text-gray-400">
                          {rule}: +{data.points} ({data.reason})
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {scoreResult.suggestedTemplate && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Template Suggerito:</p>
                      <p className="text-sm text-golden">{scoreResult.suggestedTemplate.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {scoreResult && (
              <Button 
                onClick={handleSendTestEmail}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Invia Email Test
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTestPanel;
