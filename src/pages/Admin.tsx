
import React from 'react';
import AdminRoute from '@/components/AdminRoute';
import { useAdminLeads } from '@/hooks/useAdminLeads';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminLeadsList from '@/components/admin/AdminLeadsList';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { profile, signOut } = useAuth();
  const { 
    leads, 
    loading, 
    filters, 
    setFilters, 
    updateLeadStatus, 
    triggerAnalysis 
  } = useAdminLeads();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = (lead: any) => {
    toast({
      title: "Funzione in Sviluppo",
      description: `Invio email a ${lead.nome} - Funzione in arrivo`,
    });
  };

  const handleCreateOffer = (lead: any) => {
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

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Caricamento dashboard admin...</span>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminHeader 
            profileName={profile?.first_name}
            onSignOut={handleSignOut}
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
    </AdminRoute>
  );
};

export default Admin;
