
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Button } from '@/components/ui/button';
import { Mail, Eye, EyeOff, Zap, X } from 'lucide-react';

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
    <div className="p-4 md:p-6 border-b border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white truncate">{lead.nome}</h2>
          <p className="text-sm md:text-base text-gray-300 truncate">{lead.email}</p>
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mobile: Stack buttons vertically */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        <Button
          onClick={onContactClick}
          className="bg-golden hover:bg-yellow-600 text-black font-semibold w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Contatta
        </Button>
        
        <Button
          onClick={onGenerateFunnel}
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold w-full"
          disabled={isGeneratingFunnel}
          title="Genera Funnel con GPT"
        >
          {isGeneratingFunnel ? (
            <span className="flex items-center justify-center">
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
            className="text-white hover:bg-gray-800 hover:text-white border-0 w-full"
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
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-center gap-3 mt-4">
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
      </div>
    </div>
  );
};

export default LeadDetailModalHeader;
