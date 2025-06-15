
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, CheckCircle, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { LeadAnalysis } from '@/hooks/useLeads';
import LeadRowAnalysisSection from './LeadRowAnalysisSection';

interface LeadRowAnalysisDisplayProps {
  lead: LeadAnalysis;
}

const LeadRowAnalysisDisplay: React.FC<LeadRowAnalysisDisplayProps> = ({ lead }) => {
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
    <div className="space-y-6 border-t border-golden/20 pt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-golden rounded-full">
          <Brain className="w-5 h-5 text-black" />
        </div>
        <h3 className="text-xl font-bold text-black">Analisi Intelligente GPT</h3>
        {lead.gpt_analysis.priorita && (
          <Badge className={`${getPriorityColor(lead.gpt_analysis.priorita)} px-3 py-1 flex items-center gap-1`}>
            {getPriorityIcon(lead.gpt_analysis.priorita)}
            Priorità {lead.gpt_analysis.priorita}
          </Badge>
        )}
      </div>

      {/* Profilo Cliente */}
      {(lead.gpt_analysis.categoria_cliente || lead.gpt_analysis.analisi_profilo) && (
        <LeadRowAnalysisSection
          type="profile"
          title="Profilo Cliente"
          icon={<Target className="w-5 h-5 text-golden" />}
          data={lead.gpt_analysis}
          bgColor="bg-gray-50"
        />
      )}

      {/* Funnel Personalizzato */}
      {lead.gpt_analysis.funnel_personalizzato && (
        <LeadRowAnalysisSection
          type="funnel"
          title="Strategia Funnel Consigliata"
          icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
          data={lead.gpt_analysis.funnel_personalizzato}
          bgColor="bg-blue-50"
        />
      )}

      {/* Opportunità */}
      {lead.gpt_analysis.opportunita && (
        <LeadRowAnalysisSection
          type="opportunities"
          title="Opportunità di Business"
          icon={<Lightbulb className="w-5 h-5 text-green-600" />}
          data={lead.gpt_analysis.opportunita}
          bgColor="bg-green-50"
        />
      )}

      {/* Prossimi Passi */}
      {lead.gpt_analysis.next_steps && (
        <LeadRowAnalysisSection
          type="nextSteps"
          title="Piano d'Azione Consigliato"
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
          data={lead.gpt_analysis.next_steps}
          bgColor="bg-orange-50"
        />
      )}
    </div>
  );
};

export default LeadRowAnalysisDisplay;
