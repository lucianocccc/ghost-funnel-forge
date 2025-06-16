
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, ChevronRight, Brain, Mail } from 'lucide-react';
import LeadDetailModal from './LeadDetailModal';
import LeadContactModal from './LeadContactModal';

interface AdminLeadsGridProps {
  leads: AdminLead[];
  updateLeadStatus: (leadId: string, newStatus: AdminLead['status']) => void;
  triggerAnalysis: (lead: AdminLead) => void;
  handleSendEmail: (lead: AdminLead) => void;
  handleCreateOffer: (lead: AdminLead) => void;
}

const AdminLeadsGrid: React.FC<AdminLeadsGridProps> = ({
  leads,
  updateLeadStatus,
  triggerAnalysis,
  handleSendEmail,
  handleCreateOffer
}) => {
  const [selectedLead, setSelectedLead] = React.useState<AdminLead | null>(null);
  const [contactLead, setContactLead] = React.useState<AdminLead | null>(null);

  const handleCardClick = (lead: AdminLead) => {
    setSelectedLead(lead);
  };

  const handleContactClick = (e: React.MouseEvent, lead: AdminLead) => {
    e.stopPropagation(); // Previene l'apertura della modal dei dettagli
    setContactLead(lead);
  };

  return (
    <>
      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card 
            key={lead.id}
            className="bg-gray-800 border-gray-700 hover:border-golden cursor-pointer transition-colors"
            onClick={() => handleCardClick(lead)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-golden rounded-full">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{lead.nome}</h3>
                    <p className="text-sm text-gray-300">{lead.servizio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bottone Contatta */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleContactClick(e, lead)}
                    className="text-golden hover:bg-transparent hover:text-golden border-0"
                    title="Contatta Cliente"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>

                  {lead.gpt_analysis && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      <Brain className="w-3 h-3 mr-1" />
                      Analizzato
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dettagli Lead */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          updateLeadStatus={updateLeadStatus}
          triggerAnalysis={triggerAnalysis}
          handleSendEmail={handleSendEmail}
          handleCreateOffer={handleCreateOffer}
        />
      )}

      {/* Modal Contatto */}
      {contactLead && (
        <LeadContactModal
          lead={contactLead}
          isOpen={!!contactLead}
          onClose={() => setContactLead(null)}
        />
      )}
    </>
  );
};

export default AdminLeadsGrid;
