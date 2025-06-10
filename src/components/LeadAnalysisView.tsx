
import React from 'react';
import LeadTable from './LeadTable';
import { useLeads } from '@/hooks/useLeads';

const LeadAnalysisView = () => {
  const { leads, loading, triggerAnalysis } = useLeads();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Lead <span className="text-golden">Analysis</span>
        </h1>
        <p className="text-gray-300">
          Analisi GPT dei tuoi potenziali clienti
        </p>
      </div>

      <LeadTable
        leads={leads}
        onAnalyze={triggerAnalysis}
      />
    </div>
  );
};

export default LeadAnalysisView;
