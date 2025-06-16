
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Calculator, Eye, Target, ExternalLink, Loader2 } from 'lucide-react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';

interface LeadActionButtonsProps {
  lead: AdminLead;
  onAnalyze: (lead: AdminLead) => void;
  onShowAnalysis: () => void;
  onShowScore: () => void;
  isAnalyzing?: boolean;
  leadScore?: any;
}

const LeadActionButtons: React.FC<LeadActionButtonsProps> = ({
  lead,
  onAnalyze,
  onShowAnalysis,
  onShowScore,
  isAnalyzing = false,
  leadScore
}) => {
  const { calculateLeadScore } = useLeadScoring();
  const [isCalculatingScore, setIsCalculatingScore] = React.useState(false);

  const handleCalculateScore = async () => {
    setIsCalculatingScore(true);
    try {
      await calculateLeadScore(lead.id);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsCalculatingScore(false);
    }
  };

  const handleFunnelCreated = () => {
    console.log('Funnel created for lead:', lead.id);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onAnalyze(lead)}
        disabled={isAnalyzing}
        className="text-white hover:bg-transparent hover:text-white border-0"
        title="Analizza con GPT"
      >
        {isAnalyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleCalculateScore}
        disabled={isCalculatingScore}
        className="text-white hover:bg-transparent hover:text-white border-0"
        title="Calcola Punteggio"
      >
        {isCalculatingScore ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Calculator className="w-4 h-4" />
        )}
      </Button>

      {lead.gpt_analysis && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onShowAnalysis}
          className="text-white hover:bg-transparent hover:text-white border-0"
          title="Mostra Analisi"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}

      {leadScore && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onShowScore}
          className="text-white hover:bg-transparent hover:text-white border-0"
          title="Dettagli Punteggio"
        >
          <Target className="w-4 h-4" />
        </Button>
      )}

      <FunnelTemplateSelector 
        leadId={lead.id} 
        onFunnelCreated={handleFunnelCreated}
      />

      <Button
        size="sm"
        variant="ghost"
        asChild
        className="text-white hover:bg-transparent hover:text-white border-0"
        title="Vai ai Funnel"
      >
        <a href={`/funnels`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
};

export default LeadActionButtons;
