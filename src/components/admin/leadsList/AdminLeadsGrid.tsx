
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, ChevronRight, Brain, Mail, Phone } from 'lucide-react';
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
    e.stopPropagation();
    setContactLead(lead);
  };

  return (
    <>
      <div className="grid gap-3 pb-20 md:pb-0">
        {leads.map((lead) => (
          <Card 
            key={lead.id}
            className="bg-gray-800 border-gray-700 hover:border-golden cursor-pointer transition-colors"
            onClick={() => handleCardClick(lead)}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-golden rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">
                      {lead.nome}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-300 truncate">
                      {lead.servizio}
                    </p>
                    <p className="text-xs text-gray-400 truncate md:hidden">
                      {lead.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  {/* Mobile: Show only contact button */}
                  <div className="md:hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleContactClick(e, lead)}
                      className="text-golden hover:bg-transparent hover:text-golden border-0 p-2"
                      title="Contatta Cliente"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Desktop: Show email button */}
                  <div className="hidden md:block">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleContactClick(e, lead)}
                      className="text-golden hover:bg-transparent hover:text-golden border-0"
                      title="Contatta Cliente"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>

                  {lead.gpt_analysis && (
                    <Badge variant="default" className="bg-green-600 text-white text-xs hidden md:flex">
                      <Brain className="w-3 h-3 mr-1" />
                      <span className="hidden lg:inline">Analizzato</span>
                    </Badge>
                  )}
                  
                  {/* Mobile: Show analysis badge as dot */}
                  {lead.gpt_analysis && (
                    <div className="md:hidden">
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Analizzato" />
                    </div>
                  )}
                  
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
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
