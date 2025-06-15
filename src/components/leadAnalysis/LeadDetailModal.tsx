
import React from 'react';
import { Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LeadAnalysisTable from './LeadAnalysisTable';

interface LeadDetailModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  triggerAnalysis: (lead: any) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead, isOpen, onClose, triggerAnalysis
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{lead.nome}</h2>
              <p className="text-gray-300">{lead.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {!lead.gpt_analysis && (
                <button
                  onClick={() => triggerAnalysis(lead)}
                  className="bg-golden hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Analizza con GPT
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <LeadAnalysisTable lead={lead} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
