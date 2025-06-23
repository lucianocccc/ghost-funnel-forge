
import { useState, useEffect } from 'react';
import { fetchFunnelSubmissions } from '@/services/interactiveFunnelService';
import { FunnelSubmission } from '@/types/interactiveFunnel';
import { format } from 'date-fns';

interface UseInteractiveFunnelLeadsProps {
  funnelId: string;
  funnelName: string;
  isOpen: boolean;
}

export const useInteractiveFunnelLeads = ({ funnelId, funnelName, isOpen }: UseInteractiveFunnelLeadsProps) => {
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

  return {
    submissions,
    loading,
    selectedSubmission,
    setSelectedSubmission,
    exportToCSV
  };
};
