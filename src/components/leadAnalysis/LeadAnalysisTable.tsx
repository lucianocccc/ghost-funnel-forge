
import React from 'react';
import { Brain } from 'lucide-react';
import LeadAnalysisInfoBase from './LeadAnalysisInfoBase';
import LeadAnalysisProfile from './LeadAnalysisProfile';
import LeadAnalysisFunnel from './LeadAnalysisFunnel';
import LeadAnalysisStrategie from './LeadAnalysisStrategie';
import LeadAnalysisPuntiDolore from './LeadAnalysisPuntiDolore';
import LeadAnalysisOpportunita from './LeadAnalysisOpportunita';
import LeadAnalysisNextSteps from './LeadAnalysisNextSteps';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';

const LeadAnalysisTable: React.FC<{ lead: any }> = ({ lead }) => {
  if (!lead.gpt_analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Analisi Non Disponibile</h3>
        <p className="text-gray-400">Questo lead non è ancora stato analizzato con GPT</p>
      </div>
    );
  }

  const analysis = lead.gpt_analysis;

  return (
    <div className="space-y-6">
      <LeadAnalysisInfoBase lead={lead} analysis={analysis} />
      <LeadAnalysisProfile analysis={analysis} />
      <LeadAnalysisFunnel funnel={analysis.funnel_personalizzato} />
      <LeadAnalysisStrategie strategie={analysis.strategie_approccio} />
      <LeadAnalysisPuntiDolore punti={analysis.punti_dolore} />
      <LeadAnalysisOpportunita opportunita={analysis.opportunita} />
      <LeadAnalysisNextSteps nextSteps={analysis.next_steps} />
      {/* Bio se presente */}
      {lead.bio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Biografia</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Bio</TableCell>
                <TableCell className="text-white leading-relaxed">{lead.bio}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeadAnalysisTable;
