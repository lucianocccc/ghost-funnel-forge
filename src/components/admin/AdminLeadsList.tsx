
import React from 'react';
import { AdminLead, LeadFilters } from '@/hooks/useAdminLeads';
import LeadFiltersComponent from '@/components/admin/LeadFilters';
import AdminLeadsHeader from '@/components/admin/leadsList/AdminLeadsHeader';
import AdminLeadsEmptyState from '@/components/admin/leadsList/AdminLeadsEmptyState';
import AdminLeadsGrid from '@/components/admin/leadsList/AdminLeadsGrid';

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
      <LeadFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalLeads={totalLeads}
        filteredLeads={leads.length}
      />

      {/* Leads List */}
      <div className="space-y-6">
        <AdminLeadsHeader leadsCount={leads.length} />

        {leads.length === 0 ? (
          <AdminLeadsEmptyState />
        ) : (
          <AdminLeadsGrid
            leads={leads}
            updateLeadStatus={updateLeadStatus}
            triggerAnalysis={triggerAnalysis}
            handleSendEmail={handleSendEmail}
            handleCreateOffer={handleCreateOffer}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLeadsList;
