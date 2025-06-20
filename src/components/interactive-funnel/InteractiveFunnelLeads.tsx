
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Download, Mail, User, Calendar, MapPin, Globe } from 'lucide-react';
import { fetchFunnelSubmissions } from '@/services/interactiveFunnelService';
import { FunnelSubmission } from '@/types/interactiveFunnel';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface InteractiveFunnelLeadsProps {
  funnelId: string;
  funnelName: string;
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveFunnelLeads: React.FC<InteractiveFunnelLeadsProps> = ({
  funnelId,
  funnelName,
  isOpen,
  onClose
}) => {
  const [submissions, setSubmissions] = useState<FunnelSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FunnelSubmission | null>(null);

  useEffect(() => {
    if (isOpen && funnelId) {
      loadSubmissions();
    }
  }, [isOpen, funnelId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchFunnelSubmissions(funnelId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Data', 'Stato', 'Sorgente', 'Dati'];
    const csvData = submissions.map(sub => [
      sub.user_name || 'N/A',
      sub.user_email || 'N/A',
      format(new Date(sub.created_at!), 'dd/MM/yyyy HH:mm'),
      sub.lead_status || 'new',
      sub.source || 'direct',
      JSON.stringify(sub.submission_data)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${funnelName}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Lead raccolti: {funnelName}
              </DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </Button>
                <Badge variant="secondary">
                  {submissions.length} lead
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun lead ancora</h3>
              <p className="text-gray-500">I lead verranno visualizzati qui quando qualcuno compilerà il funnel</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Contatto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Sorgente</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {submission.user_name || 'Nome non fornito'}
                          </div>
                          {submission.user_email && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {submission.user_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {submission.user_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {submission.user_email}
                            </div>
                          )}
                          {submission.source && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-gray-400" />
                              {submission.source}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(submission.created_at!), 'dd MMM yyyy', { locale: it })}</div>
                          <div className="text-gray-500">
                            {format(new Date(submission.created_at!), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.lead_status || 'new')}>
                          {submission.lead_status || 'new'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{submission.source || 'direct'}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal dettaglio submission */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dettagli Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informazioni di base</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {selectedSubmission.user_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedSubmission.user_email || 'N/A'}</div>
                    <div><strong>Data:</strong> {format(new Date(selectedSubmission.created_at!), 'dd/MM/yyyy HH:mm')}</div>
                    <div><strong>Stato:</strong> {selectedSubmission.lead_status || 'new'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Metadati</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Sorgente:</strong> {selectedSubmission.source || 'direct'}</div>
                    <div><strong>Sessione:</strong> {selectedSubmission.session_id || 'N/A'}</div>
                    {selectedSubmission.referrer_url && (
                      <div><strong>Referrer:</strong> {selectedSubmission.referrer_url}</div>
                    )}
                    {selectedSubmission.completion_time && (
                      <div><strong>Tempo completamento:</strong> {selectedSubmission.completion_time}s</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dati del form</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedSubmission.submission_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InteractiveFunnelLeads;
