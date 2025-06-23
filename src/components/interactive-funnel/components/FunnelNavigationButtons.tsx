
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';

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
    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
      <div>
        {currentStepIndex > 0 && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex justify-end">
        <Button
          onClick={onNext}
          disabled={submitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 flex items-center gap-2 shadow-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Elaborazione...
            </>
          ) : (
            <>
              {isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Completa
                </>
              ) : (
                <>
                  Continua
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FunnelNavigationButtons;
