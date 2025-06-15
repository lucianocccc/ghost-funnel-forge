
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import AdminLeadRowBase from './leadRow/AdminLeadRowBase';

interface AdminLeadRowProps {
  lead: AdminLead;
  onStatusChange: (leadId: string, newStatus: AdminLead['status']) => void;
  onAnalyze: (lead: AdminLead) => void;
  onSendEmail: (lead: AdminLead) => void;
  onCreateOffer: (lead: AdminLead) => void;
  isAnalyzing?: boolean;
}

const AdminLeadRow: React.FC<AdminLeadRowProps> = (props) => {
  return <AdminLeadRowBase {...props} />;
};

export default AdminLeadRow;
