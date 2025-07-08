import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AdvancedInteractiveDemoProps {
  data: any;
  theme: any;
  productName: string;
  onNext: () => void;
  onInteraction: () => void;
}

export const AdvancedInteractiveDemo: React.FC<AdvancedInteractiveDemoProps> = ({
  data, theme, productName, onNext, onInteraction
}) => {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
    onInteraction();
    setTimeout(() => {
      if (questionIndex < (data?.content?.questions?.length || 1) - 1) {
        setCurrentQuiz(questionIndex + 1);
      }
    }, 1000);
  };

  return (
    <div className="space-y-8 py-12 text-center">
      <h2 className="text-3xl font-bold mb-4">
        {data?.title || `Scopri ${productName}`}
      </h2>
      <p className="text-xl text-muted-foreground mb-8">
        {data?.description || 'Un\'esperienza interattiva personalizzata per te'}
      </p>
      
      <Card className="max-w-2xl mx-auto p-8">
        <CardContent className="p-0">
          {data?.type === 'quiz' && data?.content?.questions ? (
            <div className="space-y-6">
              <div className="text-lg font-semibold">
                {data.content.questions[currentQuiz]?.question}
              </div>
              <div className="grid gap-3">
                {data.content.questions[currentQuiz]?.options?.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={answers[currentQuiz] === index ? "default" : "outline"}
                    onClick={() => handleQuizAnswer(currentQuiz, index)}
                    className="p-4 text-left justify-start"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Domanda {currentQuiz + 1} di {data.content.questions.length}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto animate-pulse" />
                <p className="text-lg font-semibold">Esperienza {productName}</p>
                <p className="text-muted-foreground">
                  {data?.content || 'Immagina di poter godere di tutti questi benefici ogni giorno!'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        size="lg" 
        onClick={onNext} 
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        Voglio saperne di più!
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};