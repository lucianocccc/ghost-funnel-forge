
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Brain } from 'lucide-react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  isAnalyzing: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, isAnalyzing }) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || isAnalyzing}
      className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 transition-all duration-300 hover:shadow-lg"
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
          Invio in corso...
        </div>
      ) : isAnalyzing ? (
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 animate-pulse" />
          Analisi GPT in corso...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Invia Richiesta
        </div>
      )}
    </Button>
  );
};

export default SubmitButton;
