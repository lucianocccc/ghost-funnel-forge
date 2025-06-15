
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Brain, Eye, Zap, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';

interface AdminLeadRowProps {
  lead: AdminLead;
  onStatusChange: (leadId: string, newStatus: AdminLead['status']) => void;
  onAnalyze: (lead: AdminLead) => void;
  isAnalyzing?: boolean;
}

const AdminLeadRow: React.FC<AdminLeadRowProps> = ({ 
  lead, 
  onStatusChange, 
  onAnalyze,
  isAnalyzing = false 
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getStatusBadge = (status: AdminLead['status']) => {
    const statusConfig = {
      nuovo: { label: 'Nuovo', variant: 'default' as const },
      contattato: { label: 'Contattato', variant: 'secondary' as const },
      in_trattativa: { label: 'In Trattativa', variant: 'outline' as const },
      chiuso_vinto: { label: 'Chiuso Vinto', variant: 'default' as const },
      chiuso_perso: { label: 'Chiuso Perso', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleFunnelCreated = () => {
    // Refresh leads or show success message
    console.log('Funnel created for lead:', lead.id);
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-white">{lead.nome}</TableCell>
        <TableCell className="text-gray-300">{lead.email}</TableCell>
        <TableCell className="text-gray-300">{lead.servizio}</TableCell>
        <TableCell>{getStatusBadge(lead.status)}</TableCell>
        <TableCell className="text-gray-300">
          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
        </TableCell>
        <TableCell>
          {lead.gpt_analysis ? (
            <Badge variant="default" className="bg-green-600">
              Analizzato
            </Badge>
          ) : (
            <Badge variant="secondary">
              Non Analizzato
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Select
              value={lead.status}
              onValueChange={(value) => onStatusChange(lead.id, value as AdminLead['status'])}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuovo">Nuovo</SelectItem>
                <SelectItem value="contattato">Contattato</SelectItem>
                <SelectItem value="in_trattativa">In Trattativa</SelectItem>
                <SelectItem value="chiuso_vinto">Chiuso Vinto</SelectItem>
                <SelectItem value="chiuso_perso">Chiuso Perso</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onAnalyze(lead)}
              disabled={isAnalyzing}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
            </Button>

            {lead.gpt_analysis && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-white border-gray-600 hover:bg-gray-800"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            <FunnelTemplateSelector 
              leadId={lead.id} 
              onFunnelCreated={handleFunnelCreated}
            />

            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <a href={`/funnels`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {showAnalysis && lead.gpt_analysis && (
        <TableRow>
          <TableCell colSpan={7} className="bg-gray-900 p-4">
            <div className="text-white space-y-3">
              <h4 className="font-semibold text-golden flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Analisi GPT
              </h4>
              <div className="bg-black p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-300">
                  {JSON.stringify(lead.gpt_analysis, null, 2)}
                </pre>
              </div>
              {lead.analyzed_at && (
                <p className="text-sm text-gray-400">
                  Analizzato il: {format(new Date(lead.analyzed_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default AdminLeadRow;
