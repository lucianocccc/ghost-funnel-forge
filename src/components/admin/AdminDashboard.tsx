
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminLeadsList from '@/components/admin/AdminLeadsList';
import LeadScoringPanel from '@/components/admin/LeadScoringPanel';
import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
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
  const [activeTab, setActiveTab] = useState('leads');

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
        />

        <AdminStats stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="leads" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Gestione Lead
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Lead Scoring
            </TabsTrigger>
            <TabsTrigger value="email" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="funnels" className="text-white data-[state=active]:bg-golden data-[state=active]:text-black">
              Funnel Editor
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="scoring" className="mt-6">
            <LeadScoringPanel />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="funnels" className="mt-6">
            <div className="text-center py-12 text-gray-400">
              <h3 className="text-xl font-semibold mb-2">Funnel Drag-and-Drop Editor</h3>
              <p>Questa funzionalità sarà implementata nel prossimo aggiornamento</p>
              <p className="text-sm">Permetterà di creare funnel personalizzati con un editor visuale</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
