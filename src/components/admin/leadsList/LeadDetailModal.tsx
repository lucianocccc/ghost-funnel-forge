
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import LeadAnalysisTable from './LeadAnalysisTable';

interface LeadDetailModalProps {
  lead: AdminLead;
  isOpen: boolean;
  onClose: () => void;
  updateLeadStatus?: (leadId: string, newStatus: AdminLead['status']) => void;
  triggerAnalysis?: (lead: AdminLead) => void;
  handleSendEmail?: (lead: AdminLead) => void;
  handleCreateOffer?: (lead: AdminLead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose
  // Altri callback potrebbero essere passati qui se servono in futuro
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
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
