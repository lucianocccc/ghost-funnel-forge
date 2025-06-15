
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { AdminLead, LeadFilters } from '@/hooks/useAdminLeads';
import LeadFilters from '@/components/admin/LeadFilters';
import AdminLeadRow from '@/components/admin/AdminLeadRow';

interface AdminLeadsListProps {
  leads: AdminLead[];
  filters: LeadFilters;
  setFilters: (filters: LeadFilters) => void;
  updateLeadStatus: (leadId: string, newStatus: AdminLead['status']) => void;
  triggerAnalysis: (lead: AdminLead) => void;
  handleSendEmail: (lead: AdminLead) => void;
  handleCreateOffer: (lead: AdminLead) => void;
  totalLeads: number;
}

const AdminLeadsList: React.FC<AdminLeadsListProps> = ({
  leads,
  filters,
  setFilters,
  updateLeadStatus,
  triggerAnalysis,
  handleSendEmail,
  handleCreateOffer,
  totalLeads
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalLeads={totalLeads}
        filteredLeads={leads.length}
      />

      {/* Leads List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Gestione Lead
          </h2>
          <Badge variant="outline" className="text-white border-golden">
            {leads.length} lead trovati
          </Badge>
        </div>

        {leads.length === 0 ? (
          <Card className="bg-white border-golden border">
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-golden mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                Nessun Lead Trovato
              </h3>
              <p className="text-gray-600">
                Non ci sono lead che corrispondono ai filtri selezionati
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {leads.map((lead) => (
              <AdminLeadRow
                key={lead.id}
                lead={lead}
                onAnalyze={triggerAnalysis}
                onStatusChange={updateLeadStatus}
                onSendEmail={handleSendEmail}
                onCreateOffer={handleCreateOffer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeadsList;
