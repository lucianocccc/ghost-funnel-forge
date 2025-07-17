
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminLeadsList from '@/components/admin/AdminLeadsList';
import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import AdminRecentLeads from '@/components/admin/AdminRecentLeads';
import AdminSentEmails from '@/components/admin/AdminSentEmails';
import FunnelHealthCheckPanel from '@/components/admin/FunnelHealthCheckPanel';
import ScoringSettingsDialog from '@/components/admin/dialogs/ScoringSettingsDialog';
import TestPanelDialog from '@/components/admin/dialogs/TestPanelDialog';
import { AdminLead, LeadFilters } from '@/hooks/useAdminLeads';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

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
  const { calculateLeadScore } = useLeadScoring();
  const { sendEmail } = useEmailTemplates();
  const [activeTab, setActiveTab] = useState('overview');
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const handleSendEmail = (lead: AdminLead) => {
    toast({
      title: "Funzione in Sviluppo",
      description: `Invio email a ${lead.nome} - Usa il tab Email Templates per gestire le email`,
    });
  };

  const handleCreateOffer = (lead: AdminLead) => {
    toast({
      title: "Funzione in Sviluppo",
      description: `Creazione offerta per ${lead.nome} - Funzione in arrivo`,
    });
  };

  const handleCalculateScore = async (lead: AdminLead) => {
    try {
      await calculateLeadScore(lead.id);
    } catch (error) {
      // Error is handled in the hook
    }
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
          onOpenScoringSettings={() => setScoringDialogOpen(true)}
          onOpenTestPanel={() => setTestDialogOpen(true)}
        />

        <AdminStats stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Gestione Lead
            </TabsTrigger>
            <TabsTrigger value="email" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Template Email
            </TabsTrigger>
            <TabsTrigger value="funnels" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Health Check
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminRecentLeads />
              <AdminSentEmails />
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
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
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="funnels" className="mt-6">
            <FunnelHealthCheckPanel />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminRecentLeads />
              <AdminSentEmails />
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs for Settings */}
        <ScoringSettingsDialog 
          open={scoringDialogOpen}
          onOpenChange={setScoringDialogOpen}
        />
        
        <TestPanelDialog 
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
