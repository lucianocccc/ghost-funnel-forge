
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Send } from 'lucide-react';

interface FunnelNavigationButtonsProps {
  currentStepIndex: number;
  isLastStep: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

const FunnelNavigationButtons: React.FC<FunnelNavigationButtonsProps> = ({
  currentStepIndex,
  isLastStep,
  submitting,
  onBack,
  onNext
}) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStepIndex === 0}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Indietro
      </Button>

      <Button
        onClick={onNext}
        disabled={submitting}
        className="bg-golden hover:bg-yellow-600 text-black"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Invio...
          </div>
        ) : isLastStep ? (
          <>
            <Send className="w-4 h-4 mr-2" />
            Invia
          </>
        ) : (
          <>
            <ArrowRight className="w-4 h-4 mr-2" />
            Avanti
          </>
        )}
      </Button>
    </div>
  );
};

export default FunnelNavigationButtons;
