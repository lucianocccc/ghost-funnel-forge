
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Mail, Globe } from 'lucide-react';
import { FunnelSubmission } from '@/types/interactiveFunnel';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface LeadsTableProps {
  submissions: FunnelSubmission[];
  onViewDetails: (submission: FunnelSubmission) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ submissions, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
                onClick={() => onViewDetails(submission)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadsTable;
