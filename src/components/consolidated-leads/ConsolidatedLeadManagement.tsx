
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsolidatedLeadsList from './ConsolidatedLeadsList';
import ConsolidatedLeadsStats from './ConsolidatedLeadsStats';
import ConsolidatedLeadsFilters from './ConsolidatedLeadsFilters';
import ConsolidatedLeadDetail from './ConsolidatedLeadDetail';
import { useConsolidatedLeads } from '@/hooks/useConsolidatedLeads';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';

const ConsolidatedLeadManagement: React.FC = () => {
  const {
    leads,
    businessAreas,
    loading,
    filters,
    setFilters,
    stats,
    analyzeLead,
    updateLead,
    addInteraction,
    refreshLeads,
    refreshStats
  } = useConsolidatedLeads();

  const [selectedLead, setSelectedLead] = useState<ConsolidatedLeadWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management Avanzato</h1>
          <p className="text-gray-600">Sistema completo di gestione e analisi dei lead consolidati</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="leads">Gestione Lead</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ConsolidatedLeadsStats stats={stats} />
          
          <Card>
            <CardHeader>
              <CardTitle>Lead Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsolidatedLeadsList
                leads={leads.slice(0, 5)}
                loading={loading}
                onLeadSelect={setSelectedLead}
                onAnalyzeLead={analyzeLead}
                onUpdateLead={updateLead}
                compact={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <ConsolidatedLeadsFilters
            filters={filters}
            onFiltersChange={setFilters}
            businessAreas={businessAreas}
          />
          
          <ConsolidatedLeadsList
            leads={leads}
            loading={loading}
            onLeadSelect={setSelectedLead}
            onAnalyzeLead={analyzeLead}
            onUpdateLead={updateLead}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ConsolidatedLeadsStats stats={stats} detailed={true} />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <ConsolidatedLeadDetail
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onAnalyzeLead={analyzeLead}
          onUpdateLead={updateLead}
          onAddInteraction={addInteraction}
          businessAreas={businessAreas}
        />
      )}
    </div>
  );
};

export default ConsolidatedLeadManagement;
