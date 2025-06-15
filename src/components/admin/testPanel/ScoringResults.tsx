
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ScoringResultsProps {
  scoreResult: {
    score: number;
    breakdown: Record<string, any>;
    suggestedTemplate?: any;
  } | null;
  onSendTestEmail: () => void;
}

const ScoringResults: React.FC<ScoringResultsProps> = ({
  scoreResult,
  onSendTestEmail
}) => {
  if (!scoreResult) {
    return null;
  }

  return (
    <div className="space-y-4">
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

      <Button 
        onClick={onSendTestEmail}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Send className="w-4 h-4 mr-2" />
        Invia Email Test
      </Button>
    </div>
  );
};

export default ScoringResults;
