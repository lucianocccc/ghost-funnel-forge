import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Eye, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FunnelStats {
  id: string;
  name: string;
  views_count: number;
  submissions_count: number;
  conversion_rate: number;
}

interface Lead {
  id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  funnel_name: string;
  submission_data: any;
}

const LeadAnalytics = () => {
  const { user } = useAuth();
  const [funnelStats, setFunnelStats] = useState<FunnelStats[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedFunnel) {
      fetchLeads();
    }
  }, [selectedFunnel, user]);

  const fetchData = async () => {
    try {
      // Fetch funnel stats
      const { data: funnels, error: funnelsError } = await supabase
        .from('ai_generated_funnels')
        .select('id, name, views_count')
        .eq('user_id', user?.id);

      if (funnelsError) throw funnelsError;

      // Get submission counts
      const statsPromises = (funnels || []).map(async (funnel) => {
        const { count } = await supabase
          .from('funnel_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('funnel_id', funnel.id);

        return {
          ...funnel,
          submissions_count: count || 0,
          conversion_rate: funnel.views_count > 0 ? ((count || 0) / funnel.views_count) * 100 : 0
        };
      });

      const stats = await Promise.all(statsPromises);
      setFunnelStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      let query = supabase
        .from('funnel_submissions')
        .select(`
          id,
          user_name,
          user_email,
          created_at,
          submission_data,
          funnel_id,
          ai_generated_funnels!inner(name, user_id)
        `)
        .eq('ai_generated_funnels.user_id', user?.id)
        .order('created_at', { ascending: false });

      if (selectedFunnel !== 'all') {
        query = query.eq('funnel_id', selectedFunnel);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedLeads = (data || []).map((lead: any) => ({
        id: lead.id,
        user_name: lead.user_name,
        user_email: lead.user_email,
        created_at: lead.created_at,
        funnel_name: lead.ai_generated_funnels.name,
        submission_data: lead.submission_data
      }));

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Errore nel caricamento dei lead');
    }
  };

  const exportLeads = () => {
    const csvContent = [
      ['Nome', 'Email', 'Funnel', 'Data', 'Dati Aggiuntivi'].join(','),
      ...leads.map(lead => [
        lead.user_name || '',
        lead.user_email || '',
        lead.funnel_name,
        new Date(lead.created_at).toLocaleDateString('it-IT'),
        JSON.stringify(lead.submission_data)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalViews = funnelStats.reduce((sum, f) => sum + (f.views_count || 0), 0);
  const totalSubmissions = funnelStats.reduce((sum, f) => sum + (f.submissions_count || 0), 0);
  const avgConversionRate = funnelStats.length > 0 
    ? funnelStats.reduce((sum, f) => sum + f.conversion_rate, 0) / funnelStats.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizzazioni Totali</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Raccolti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Conversione Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance per Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelStats.map((funnel) => (
              <div key={funnel.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{funnel.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{funnel.views_count} visualizzazioni</span>
                    <span>{funnel.submissions_count} lead</span>
                    <Badge variant="outline">{funnel.conversion_rate.toFixed(1)}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Raccolti</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleziona funnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i funnel</SelectItem>
                  {funnelStats.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={exportLeads} disabled={leads.length === 0}>
                <Download className="w-4 h-4 mr-1" />
                Esporta CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nessun lead trovato per il filtro selezionato.
            </p>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{lead.user_name || 'Nome non fornito'}</p>
                    <p className="text-sm text-muted-foreground">{lead.user_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.funnel_name} • {new Date(lead.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadAnalytics;