
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import AdminLeadRow from '@/components/admin/AdminLeadRow';

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
  return (
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
  );
};

export default AdminLeadsGrid;
