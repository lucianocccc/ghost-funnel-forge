
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Button } from '@/components/ui/button';
import LeadAnalysisTable from './LeadAnalysisTable';

interface LeadDetailModalAnalysisProps {
  lead: AdminLead;
  showAnalysisDetails: boolean;
  triggerAnalysis?: (lead: AdminLead) => void;
}

const LeadDetailModalAnalysis: React.FC<LeadDetailModalAnalysisProps> = ({
  lead,
  showAnalysisDetails,
  triggerAnalysis
}) => {
  if (showAnalysisDetails && lead.gpt_analysis) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-golden">Analisi Dettagliata GPT</h3>
        <LeadAnalysisTable lead={lead} />
      </div>
    );
  }

  if (!lead.gpt_analysis) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Questo lead non è ancora stato analizzato con GPT</p>
        {triggerAnalysis && (
          <Button
            onClick={() => triggerAnalysis(lead)}
            className="mt-4 bg-golden hover:bg-yellow-600 text-black"
          >
            Analizza con GPT
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default LeadDetailModalAnalysis;
