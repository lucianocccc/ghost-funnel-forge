
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  Target 
} from 'lucide-react';
import { ConsolidatedLeadWithDetails, parseJsonArray, getJsonArrayLength } from '@/types/consolidatedLeads';

interface ConsolidatedLeadAnalysisTabProps {
  lead: ConsolidatedLeadWithDetails;
  onAnalyzeLead: (leadId: string) => void;
}

const ConsolidatedLeadAnalysisTab: React.FC<ConsolidatedLeadAnalysisTabProps> = ({
  lead,
  onAnalyzeLead
}) => {
  const aiInsights = parseJsonArray(lead.ai_insights);
  const aiRecommendations = parseJsonArray(lead.ai_recommendations);
  const actionPlan = parseJsonArray(lead.action_plan);

  if (!lead.ai_analysis) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analisi AI non ancora disponibile
          </h3>
          <p className="text-gray-500 mb-4">
            Analizza questo lead con l'intelligenza artificiale per ottenere insights e raccomandazioni
          </p>
          <Button
            onClick={() => onAnalyzeLead(lead.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Analizza con AI
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Risultati Analisi AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{lead.lead_score}</div>
              <div className="text-sm text-gray-600">Lead Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold capitalize">{lead.priority_level}</div>
              <div className="text-sm text-gray-600">Priorità</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{getJsonArrayLength(lead.ai_insights)}</div>
              <div className="text-sm text-gray-600">Insights</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{getJsonArrayLength(lead.ai_recommendations)}</div>
              <div className="text-sm text-gray-600">Raccomandazioni</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {aiInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Raccomandazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      {actionPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Piano d'Azione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionPlan.map((action: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{action.action}</div>
                    <div className="text-sm text-gray-600">
                      Stima: {action.estimated_days} giorni
                    </div>
                  </div>
                  <Badge variant={
                    action.priority === 'high' ? 'destructive' :
                    action.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {action.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedLeadAnalysisTab;
