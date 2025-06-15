
import React from 'react';
import AdminRoute from '@/components/AdminRoute';
import { useAdminLeads } from '@/hooks/useAdminLeads';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import LeadFilters from '@/components/admin/LeadFilters';
import AdminLeadRow from '@/components/admin/AdminLeadRow';
import { 
  Shield, 
  Users, 
  Brain, 
  TrendingUp,
  LogOut,
  Loader2
} from 'lucide-react';

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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-golden" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Admin <span className="text-golden">Dashboard</span>
                </h1>
                <p className="text-gray-300">
                  Benvenuto, {profile?.first_name || 'Admin'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-golden text-golden hover:bg-golden hover:text-black"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white border-golden border">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-golden mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{stats.total}</p>
                <p className="text-sm text-gray-600">Lead Totali</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-golden border">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{stats.analyzed}</p>
                <p className="text-sm text-gray-600">Analizzati</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-golden border">
              <CardContent className="p-4 text-center">
                <Badge className="w-8 h-8 bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                  N
                </Badge>
                <p className="text-2xl font-bold text-black">{stats.nuovo}</p>
                <p className="text-sm text-gray-600">Nuovi</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-golden border">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{stats.inTrattativa}</p>
                <p className="text-sm text-gray-600">In Trattativa</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-golden border">
              <CardContent className="p-4 text-center">
                <Badge className="w-8 h-8 bg-green-100 text-green-800 flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                  ✓
                </Badge>
                <p className="text-2xl font-bold text-black">{stats.chiusoVinto}</p>
                <p className="text-sm text-gray-600">Chiusi Vinti</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <LeadFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalLeads={stats.total}
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
      </div>
    </AdminRoute>
  );
};

export default Admin;
