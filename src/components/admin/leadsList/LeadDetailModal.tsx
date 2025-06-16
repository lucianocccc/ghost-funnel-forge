
import React, { useState } from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import LeadDetailModalHeader from './LeadDetailModalHeader';
import LeadDetailModalBaseInfo from './LeadDetailModalBaseInfo';
import LeadDetailModalAnalysis from './LeadDetailModalAnalysis';
import LeadContactModal from './LeadContactModal';
import { useFunnelGeneration } from './useFunnelGeneration';

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
  onClose,
  updateLeadStatus,
  triggerAnalysis,
  handleSendEmail,
  handleCreateOffer
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const { isGeneratingFunnel, handleGenerateSmartFunnel } = useFunnelGeneration();

  if (!isOpen) return null;

  const handleContactClick = () => setShowContactModal(true);
  const handleToggleAnalysis = () => setShowAnalysisDetails(!showAnalysisDetails);
  const handleGenerateFunnel = () => handleGenerateSmartFunnel(lead);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
          <LeadDetailModalHeader
            lead={lead}
            onClose={onClose}
            onContactClick={handleContactClick}
            onGenerateFunnel={handleGenerateFunnel}
            onToggleAnalysis={handleToggleAnalysis}
            showAnalysisDetails={showAnalysisDetails}
            isGeneratingFunnel={isGeneratingFunnel}
          />
          
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <LeadDetailModalBaseInfo lead={lead} />
            <LeadDetailModalAnalysis
              lead={lead}
              showAnalysisDetails={showAnalysisDetails}
              triggerAnalysis={triggerAnalysis}
            />
          </div>
        </div>
      </div>

      {showContactModal && (
        <LeadContactModal
          lead={lead}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
};

export default LeadDetailModal;
