
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, RotateCcw } from 'lucide-react';
import { AdminLead } from '@/hooks/useLeadTypes';

const AdminRecentLeads: React.FC = () => {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLead = async (leadId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { leadId }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Lead analizzato con successo",
      });

      // Refresh leads list
      fetchLeads();
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast({
        title: "Errore",
        description: "Errore nell'analisi del lead",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'nuovo': 'bg-blue-500',
      'contattato': 'bg-yellow-500',
      'in_trattativa': 'bg-orange-500',
      'chiuso_vinto': 'bg-green-500',
      'chiuso_perso': 'bg-red-500'
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Caricamento lead...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          Lead Recenti
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Nessun lead trovato
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Servizio</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Data</TableHead>
                  <TableHead className="text-gray-300">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-white">
                      {lead.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {lead.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {lead.servizio || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(lead.created_at).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeLead(lead.id)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Analizza
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRecentLeads;
