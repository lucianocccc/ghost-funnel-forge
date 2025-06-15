
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadScore } from '@/types/leadScoring';

interface RecentScoresListProps {
  scores: LeadScore[];
}

const RecentScoresList: React.FC<RecentScoresListProps> = ({ scores }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Punteggi Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            Nessun punteggio calcolato
          </div>
        ) : (
          <div className="space-y-2">
            {scores.slice(0, 10).map((score) => (
              <div key={score.id} className="flex justify-between items-center p-3 bg-gray-900 rounded">
                <span className="text-white">Lead ID: {score.lead_id.slice(0, 8)}...</span>
                <Badge variant="outline" className="text-white">
                  {score.total_score} punti
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentScoresList;
