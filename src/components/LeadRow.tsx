
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, User, Target, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { LeadAnalysis } from '@/hooks/useLeads';

interface LeadRowProps {
  lead: LeadAnalysis;
  onAnalyze: (lead: LeadAnalysis) => void;
}

const LeadRow: React.FC<LeadRowProps> = ({ lead, onAnalyze }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'bassa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white border-golden border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-golden" />
            <div>
              <CardTitle className="text-black">{lead.nome}</CardTitle>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead.gpt_analysis ? (
              <Badge className="bg-green-100 text-green-800">
                <Brain className="w-3 h-3 mr-1" />
                Analizzato
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => onAnalyze(lead)}
                className="bg-golden hover:bg-yellow-600 text-black"
              >
                <Brain className="w-4 h-4 mr-1" />
                Analizza
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Servizio di interesse:</p>
            <p className="font-medium text-black">{lead.servizio}</p>
          </div>
          {lead.bio && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Bio:</p>
              <p className="text-sm text-black">{lead.bio}</p>
            </div>
          )}
        </div>

        {lead.gpt_analysis && (
          <div className="space-y-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-golden" />
              <h3 className="font-semibold text-black">Analisi GPT</h3>
              {lead.gpt_analysis.priorita && (
                <Badge className={getPriorityColor(lead.gpt_analysis.priorita)}>
                  {lead.gpt_analysis.priorita}
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {lead.gpt_analysis.categoria_cliente && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-golden" />
                    <p className="font-medium text-black">Categoria Cliente</p>
                  </div>
                  <p className="text-sm text-gray-700">{lead.gpt_analysis.categoria_cliente}</p>
                </div>
              )}

              {lead.gpt_analysis.analisi_profilo && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-golden" />
                    <p className="font-medium text-black">Profilo</p>
                  </div>
                  <p className="text-sm text-gray-700">{lead.gpt_analysis.analisi_profilo}</p>
                </div>
              )}
            </div>

            {lead.gpt_analysis.funnel_personalizzato && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Funnel Personalizzato</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.gpt_analysis.funnel_personalizzato.map((step: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {index + 1}. {step}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {lead.gpt_analysis.opportunita && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Opportunità</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {lead.gpt_analysis.opportunita.map((opp: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-golden mt-1">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lead.gpt_analysis.next_steps && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Prossimi Passi</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {lead.gpt_analysis.next_steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-golden mt-1">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadRow;
