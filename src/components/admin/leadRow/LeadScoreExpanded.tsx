
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface LeadScoreExpandedProps {
  leadScore: any;
}

const LeadScoreExpanded: React.FC<LeadScoreExpandedProps> = ({ leadScore }) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-gray-900 p-4">
        <div className="text-white space-y-3">
          <h4 className="font-semibold text-golden flex items-center gap-2">
            <Target className="w-4 h-4" />
            Dettagli Punteggio ({leadScore.total_score} punti)
          </h4>
          <div className="bg-black p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(leadScore.score_breakdown).map(([ruleName, details]: [string, any]) => (
                <div key={ruleName} className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{ruleName}</span>
                    <Badge variant={details.applies ? "default" : "secondary"}>
                      {details.applies ? `+${details.points}` : '0'} punti
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Tipo: {details.rule_type} | Applicata: {details.applies ? 'Sì' : 'No'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Calcolato il: {format(new Date(leadScore.calculated_at), 'dd/MM/yyyy HH:mm', { locale: it })}
          </p>
          {leadScore.motivation && (
            <div className="mt-3">
              <h5 className="font-medium text-golden mb-2">Motivazione:</h5>
              <p className="text-gray-300">{leadScore.motivation}</p>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LeadScoreExpanded;
