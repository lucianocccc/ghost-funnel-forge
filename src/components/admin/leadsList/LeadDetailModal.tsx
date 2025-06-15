
import React, { useState } from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import LeadAnalysisTable from './LeadAnalysisTable';
import LeadContactModal from './LeadContactModal';

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
  const [isGeneratingFunnel, setIsGeneratingFunnel] = useState(false);
  const { toast } = require('@/hooks/use-toast');

  if (!isOpen) return null;

  // Funzione per chiamare l'edge function "generate-funnel-ai"
  const handleGenerateSmartFunnel = async () => {
    setIsGeneratingFunnel(true);
    toast?.({
      title: "Creazione Funnel Intelligente...",
      description: "Stiamo chiedendo a GPT di progettare il funnel ideale per questo lead.",
    });
    try {
      const resp = await fetch(
        "/functions/v1/generate-funnel-ai", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id })
        }
      );
      const res = await resp.json();
      if (res.success) {
        toast?.({
          title: "Funnel Creato!",
          description: "Il funnel personalizzato è stato generato via GPT e salvato.",
        });
      } else {
        toast?.({
          title: "Errore creazione funnel",
          description: res.error || "",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast?.({
        title: "Errore creazione funnel",
        description: String(err),
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFunnel(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{lead.nome}</h2>
                <p className="text-gray-300">{lead.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="bg-golden hover:bg-yellow-600 text-black font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contatta
                </Button>
                <Button
                  onClick={handleGenerateSmartFunnel}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold"
                  disabled={isGeneratingFunnel}
                  title="Crea Funnel via GPT"
                >
                  {isGeneratingFunnel ? (
                    <span className="flex items-center"><span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />Crea Funnel...</span>
                  ) : (
                    "Crea funnel GPT"
                  )}
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
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

      {/* Modal Contatto */}
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
