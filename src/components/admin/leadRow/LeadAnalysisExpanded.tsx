
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, CheckCircle, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import LeadAnalysisSection from './LeadAnalysisSection';

interface LeadAnalysisExpandedProps {
  lead: AdminLead;
}

const LeadAnalysisExpanded: React.FC<LeadAnalysisExpandedProps> = ({ lead }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'bassa': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return <AlertTriangle className="w-4 h-4" />;
      case 'media': return <TrendingUp className="w-4 h-4" />;
      case 'bassa': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (!lead.gpt_analysis) return null;

  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-gray-900 p-6">
        <Card className="bg-black border-golden">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-golden">
              <Brain className="w-6 h-6" />
              Analisi GPT Completa
              {lead.gpt_analysis.priorita && (
                <Badge className={`${getPriorityColor(lead.gpt_analysis.priorita)} px-3 py-1 flex items-center gap-1 ml-auto`}>
                  {getPriorityIcon(lead.gpt_analysis.priorita)}
                  Priorità {lead.gpt_analysis.priorita}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profilo Cliente */}
            {(lead.gpt_analysis.categoria_cliente || lead.gpt_analysis.analisi_profilo) && (
              <LeadAnalysisSection
                type="profile"
                title="Profilo Cliente"
                icon={<Target className="w-5 h-5 text-golden" />}
                data={lead.gpt_analysis}
                bgColor="bg-gray-800"
              />
            )}

            {/* Funnel Personalizzato */}
            {lead.gpt_analysis.funnel_personalizzato && (
              <LeadAnalysisSection
                type="funnel"
                title="Strategia Funnel Consigliata"
                icon={<CheckCircle className="w-5 h-5 text-blue-400" />}
                data={lead.gpt_analysis.funnel_personalizzato}
                bgColor="bg-blue-900/50"
              />
            )}

            {/* Opportunità */}
            {lead.gpt_analysis.opportunita && (
              <LeadAnalysisSection
                type="opportunities"
                title="Opportunità di Business"
                icon={<Lightbulb className="w-5 h-5 text-green-400" />}
                data={lead.gpt_analysis.opportunita}
                bgColor="bg-green-900/50"
              />
            )}

            {/* Prossimi Passi */}
            {lead.gpt_analysis.next_steps && (
              <LeadAnalysisSection
                type="nextSteps"
                title="Piano d'Azione Consigliato"
                icon={<TrendingUp className="w-5 h-5 text-orange-400" />}
                data={lead.gpt_analysis.next_steps}
                bgColor="bg-orange-900/50"
              />
            )}

            {lead.analyzed_at && (
              <p className="text-sm text-gray-400 text-center mt-4">
                Analisi completata il: {format(new Date(lead.analyzed_at), 'dd/MM/yyyy HH:mm', { locale: it })}
              </p>
            )}
          </CardContent>
        </Card>
      </TableCell>
    </TableRow>
  );
};

export default LeadAnalysisExpanded;
