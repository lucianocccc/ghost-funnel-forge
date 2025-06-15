
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';
import { SentEmail } from '@/types/email';

const AdminSentEmails: React.FC = () => {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSentEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('sent_emails')
        .select(`
          *,
          email_templates(name),
          leads(nome, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        status: item.status as SentEmail['status'],
        template_name: item.email_templates?.name || 'Template Eliminato',
        lead_name: item.leads?.nome || 'Lead Eliminato',
        lead_email: item.leads?.email || item.to_email
      }));

      setSentEmails(formattedData);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle email inviate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'bg-yellow-500',
      'sent': 'bg-green-500',
      'failed': 'bg-red-500',
      'delivered': 'bg-blue-500',
      'opened': 'bg-purple-500'
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-500'} text-white`}>
        {status}
      </Badge>
    );
  };

  useEffect(() => {
    fetchSentEmails();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Caricamento email inviate...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Send className="w-5 h-5" />
          Email Inviate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sentEmails.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Nessuna email inviata
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Destinatario</TableHead>
                  <TableHead className="text-gray-300">Template</TableHead>
                  <TableHead className="text-gray-300">Oggetto</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Data Invio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{email.lead_name}</div>
                        <div className="text-sm text-gray-400">{email.lead_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {email.template_name}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(email.status)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {email.sent_at 
                        ? new Date(email.sent_at).toLocaleDateString('it-IT', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Non inviata'
                      }
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

export default AdminSentEmails;
