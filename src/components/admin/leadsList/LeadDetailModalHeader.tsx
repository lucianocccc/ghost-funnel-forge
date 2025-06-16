
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Button } from '@/components/ui/button';
import { Mail, Eye, EyeOff, Zap } from 'lucide-react';

interface LeadDetailModalHeaderProps {
  lead: AdminLead;
  onClose: () => void;
  onContactClick: () => void;
  onGenerateFunnel: () => void;
  onToggleAnalysis: () => void;
  showAnalysisDetails: boolean;
  isGeneratingFunnel: boolean;
}

const LeadDetailModalHeader: React.FC<LeadDetailModalHeaderProps> = ({
  lead,
  onClose,
  onContactClick,
  onGenerateFunnel,
  onToggleAnalysis,
  showAnalysisDetails,
  isGeneratingFunnel
}) => {
  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{lead.nome}</h2>
          <p className="text-gray-300">{lead.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onContactClick}
            className="bg-golden hover:bg-yellow-600 text-black font-semibold"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contatta
          </Button>
          
          <Button
            onClick={onGenerateFunnel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold"
            disabled={isGeneratingFunnel}
            title="Genera Funnel con GPT"
          >
            {isGeneratingFunnel ? (
              <span className="flex items-center">
                <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                Generando...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Genera Funnel
              </>
            )}
          </Button>

          {lead.gpt_analysis && (
            <Button
              onClick={onToggleAnalysis}
              variant="ghost"
              className="text-white hover:bg-transparent hover:text-white border-0"
              title={showAnalysisDetails ? "Nascondi analisi dettagliata" : "Mostra analisi dettagliata"}
            >
              {showAnalysisDetails ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Nascondi Analisi
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostra Analisi
                </>
              )}
            </Button>
          )}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModalHeader;
