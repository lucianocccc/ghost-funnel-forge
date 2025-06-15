
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  User, 
  Mail, 
  FileText, 
  Calendar,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { AdminLead } from '@/hooks/useAdminLeads';

interface AdminLeadRowProps {
  lead: AdminLead;
  onAnalyze: (lead: AdminLead) => void;
  onStatusChange: (leadId: string, status: AdminLead['status']) => void;
  onSendEmail: (lead: AdminLead) => void;
  onCreateOffer: (lead: AdminLead) => void;
}

const AdminLeadRow: React.FC<AdminLeadRowProps> = ({
  lead,
  onAnalyze,
  onStatusChange,
  onSendEmail,
  onCreateOffer
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuovo': return 'bg-blue-100 text-blue-800';
      case 'contattato': return 'bg-yellow-100 text-yellow-800';
      case 'in_trattativa': return 'bg-orange-100 text-orange-800';
      case 'chiuso_vinto': return 'bg-green-100 text-green-800';
      case 'chiuso_perso': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'bassa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'nuovo', label: 'Nuovo' },
    { value: 'contattato', label: 'Contattato' },
    { value: 'in_trattativa', label: 'In Trattativa' },
    { value: 'chiuso_vinto', label: 'Chiuso Vinto' },
    { value: 'chiuso_perso', label: 'Chiuso Perso' }
  ];

  return (
    <Card className="bg-white border-golden border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-golden" />
            <div>
              <CardTitle className="text-black">{lead.nome}</CardTitle>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(lead.status)}>
              {statusOptions.find(opt => opt.value === lead.status)?.label}
            </Badge>
            {lead.gpt_analysis ? (
              <Badge className="bg-green-100 text-green-800">
                <Brain className="w-3 h-3 mr-1" />
                Analizzato
              </Badge>
            ) : (
              <Badge variant="outline">
                Non Analizzato
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Servizio di interesse:</p>
            <p className="font-medium text-black">{lead.servizio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Data creazione:</p>
            <p className="text-sm text-black flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(lead.created_at)}
            </p>
          </div>
        </div>

        {lead.bio && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Bio:</p>
            <p className="text-sm text-black">{lead.bio}</p>
          </div>
        )}

        {/* Status Change and Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
          <Select
            value={lead.status}
            onValueChange={(value) => onStatusChange(lead.id, value as AdminLead['status'])}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!lead.gpt_analysis && (
            <Button
              size="sm"
              onClick={() => onAnalyze(lead)}
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              <Brain className="w-4 h-4 mr-1" />
              Analizza
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendEmail(lead)}
          >
            <Mail className="w-4 h-4 mr-1" />
            Invia Email
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateOffer(lead)}
          >
            <FileText className="w-4 h-4 mr-1" />
            Crea Offerta
          </Button>
        </div>

        {/* GPT Analysis Display */}
        {lead.gpt_analysis && (
          <div className="space-y-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-golden" />
              <h3 className="font-semibold text-black">Analisi GPT</h3>
              {lead.gpt_analysis.priorita && (
                <Badge className={getPriorityColor(lead.gpt_analysis.priorita)}>
                  {lead.gpt_analysis.priorita}
                </Badge>
              )}
              {lead.analyzed_at && (
                <span className="text-xs text-gray-500 ml-auto">
                  Analizzato il {formatDate(lead.analyzed_at)}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {lead.gpt_analysis.categoria_cliente && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-golden" />
                    <p className="font-medium text-black">Categoria Cliente</p>
                  </div>
                  <p className="text-sm text-gray-700">{lead.gpt_analysis.categoria_cliente}</p>
                </div>
              )}

              {lead.gpt_analysis.analisi_profilo && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-golden" />
                    <p className="font-medium text-black">Profilo</p>
                  </div>
                  <p className="text-sm text-gray-700">{lead.gpt_analysis.analisi_profilo}</p>
                </div>
              )}
            </div>

            {lead.gpt_analysis.funnel_personalizzato && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Funnel Personalizzato</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.gpt_analysis.funnel_personalizzato.map((step: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {index + 1}. {step}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {lead.gpt_analysis.opportunita && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Opportunità</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {lead.gpt_analysis.opportunita.map((opp: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-golden mt-1">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lead.gpt_analysis.next_steps && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-golden" />
                  <p className="font-medium text-black">Prossimi Passi</p>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {lead.gpt_analysis.next_steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-golden mt-1">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLeadRow;
