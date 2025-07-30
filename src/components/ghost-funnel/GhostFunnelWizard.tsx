import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGhostFunnelFormState } from '@/hooks/useGhostFunnelFormState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GhostFunnelWizardProps {
  onFunnelGenerated: (funnel: any) => void;
  onBack: () => void;
}

const questions = [
  {
    id: 'nome',
    title: 'Come si chiama la tua azienda?',
    description: 'Il nome della tua azienda o del tuo progetto',
    type: 'text',
    placeholder: 'Es. Bella Vista Ristorante'
  },
  {
    id: 'servizio',
    title: 'Che tipo di business hai?',
    description: 'Seleziona la categoria che meglio descrive la tua attività',
    type: 'select',
    options: [
      { value: 'restaurant', label: 'Ristorante/Bar' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'services', label: 'Servizi Professionali' },
      { value: 'consulting', label: 'Consulenza' },
      { value: 'health', label: 'Salute e Benessere' },
      { value: 'education', label: 'Formazione/Corsi' },
      { value: 'tech', label: 'Tecnologia/Software' },
      { value: 'beauty', label: 'Beauty/Estetica' },
      { value: 'real-estate', label: 'Immobiliare' },
      { value: 'other', label: 'Altro' }
    ]
  },
  {
    id: 'email',
    title: 'Qual è la tua email?',
    description: 'Ti servirà per salvare il tuo funnel',
    type: 'email',
    placeholder: 'nome@azienda.com'
  },
  {
    id: 'bio',
    title: 'Descrivi il tuo prodotto/servizio',
    description: 'Spiega in 2-3 frasi cosa offri e quale problema risolvi per i tuoi clienti',
    type: 'textarea',
    placeholder: 'Es. Offriamo cucina italiana autentica con ingredienti freschi e locali. I nostri piatti sono preparati con ricette tradizionali che soddisfano anche i palati più esigenti...'
  }
];

const GhostFunnelWizard: React.FC<GhostFunnelWizardProps> = ({ onFunnelGenerated, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { formData, handleInputChange } = useGhostFunnelFormState();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      generateFunnel();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const getCurrentFieldValue = () => {
    const question = questions[currentQuestion];
    return formData[question.id as keyof typeof formData] || '';
  };

  const isCurrentQuestionValid = () => {
    const value = getCurrentFieldValue();
    return value.trim().length > 0;
  };

  const generateFunnel = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ghost-funnel', {
        body: {
          businessName: formData.nome,
          businessType: formData.servizio,
          email: formData.email,
          description: formData.bio
        }
      });

      if (error) throw error;

      onFunnelGenerated(data);
      toast.success('Funnel generato con successo!');
    } catch (error) {
      console.error('Errore nella generazione del funnel:', error);
      toast.error('Errore nella generazione del funnel. Riprova.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Ghost Funnel AI
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Raccontaci del tuo business
            </h1>
            <p className="text-muted-foreground">
              Domanda {currentQuestion + 1} di {questions.length}
            </p>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Progress value={progress} className="h-2" />
          </motion.div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {currentQuestionData.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {currentQuestionData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestionData.type === 'text' && (
                    <div>
                      <Label htmlFor={currentQuestionData.id}>Risposta</Label>
                      <Input
                        id={currentQuestionData.id}
                        type="text"
                        placeholder={currentQuestionData.placeholder}
                        value={getCurrentFieldValue()}
                        onChange={(e) => handleInputChange(currentQuestionData.id as keyof typeof formData, e.target.value)}
                        className="text-lg py-6"
                      />
                    </div>
                  )}

                  {currentQuestionData.type === 'email' && (
                    <div>
                      <Label htmlFor={currentQuestionData.id}>Email</Label>
                      <Input
                        id={currentQuestionData.id}
                        type="email"
                        placeholder={currentQuestionData.placeholder}
                        value={getCurrentFieldValue()}
                        onChange={(e) => handleInputChange(currentQuestionData.id as keyof typeof formData, e.target.value)}
                        className="text-lg py-6"
                      />
                    </div>
                  )}

                  {currentQuestionData.type === 'select' && (
                    <div>
                      <Label htmlFor={currentQuestionData.id}>Categoria</Label>
                      <Select
                        value={getCurrentFieldValue()}
                        onValueChange={(value) => handleInputChange(currentQuestionData.id as keyof typeof formData, value)}
                      >
                        <SelectTrigger className="text-lg py-6">
                          <SelectValue placeholder="Seleziona una categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentQuestionData.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {currentQuestionData.type === 'textarea' && (
                    <div>
                      <Label htmlFor={currentQuestionData.id}>Descrizione</Label>
                      <Textarea
                        id={currentQuestionData.id}
                        placeholder={currentQuestionData.placeholder}
                        value={getCurrentFieldValue()}
                        onChange={(e) => handleInputChange(currentQuestionData.id as keyof typeof formData, e.target.value)}
                        className="min-h-[120px] text-base"
                        rows={5}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentQuestion === 0 ? 'Indietro' : 'Precedente'}
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>

            <Button
              onClick={handleNext}
              disabled={!isCurrentQuestionValid() || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                <>
                  Genera Funnel
                  <Brain className="w-4 h-4" />
                </>
              ) : (
                <>
                  Avanti
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostFunnelWizard;