
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminLeadsList from '@/components/admin/AdminLeadsList';
import { AdminLead, LeadFilters } from '@/hooks/useAdminLeads';

interface AdminDashboardProps {
  profileName?: string;
  onSignOut: () => Promise<void>;
  leads: AdminLead[];
  filters: LeadFilters;
  setFilters: (filters: LeadFilters) => void;
  updateLeadStatus: (leadId: string, newStatus: AdminLead['status']) => void;
  triggerAnalysis: (lead: AdminLead) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profileName,
  onSignOut,
  leads,
  filters,
  setFilters,
  updateLeadStatus,
  triggerAnalysis
}) => {
  const { toast } = useToast();

  const handleSendEmail = (lead: AdminLead) => {
    toast({
      title: "Funzione in Sviluppo",
      description: `Invio email a ${lead.nome} - Funzione in arrivo`,
    });
  };

  const handleCreateOffer = (lead: AdminLead) => {
    toast({
      title: "Funzione in Sviluppo",
      description: `Creazione offerta per ${lead.nome} - Funzione in arrivo`,
    });
  };

  // Statistics
  const stats = {
    total: leads.length,
    analyzed: leads.filter(lead => lead.gpt_analysis).length,
    nuovo: leads.filter(lead => lead.status === 'nuovo').length,
    inTrattativa: leads.filter(lead => lead.status === 'in_trattativa').length,
    chiusoVinto: leads.filter(lead => lead.status === 'chiuso_vinto').length,
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader 
          profileName={profileName}
          onSignOut={onSignOut}
        />

        <AdminStats stats={stats} />

        <AdminLeadsList
          leads={leads}
          filters={filters}
          setFilters={setFilters}
          updateLeadStatus={updateLeadStatus}
          triggerAnalysis={triggerAnalysis}
          handleSendEmail={handleSendEmail}
          handleCreateOffer={handleCreateOffer}
          totalLeads={stats.total}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
