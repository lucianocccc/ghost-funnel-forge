
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SentEmail } from '@/types/email';

interface SentEmailsListProps {
  sentEmails: SentEmail[];
}

const SentEmailsList: React.FC<SentEmailsListProps> = ({ sentEmails }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'In Coda', variant: 'secondary' as const },
      sent: { label: 'Inviata', variant: 'default' as const },
      failed: { label: 'Fallita', variant: 'destructive' as const },
      delivered: { label: 'Consegnata', variant: 'default' as const },
      opened: { label: 'Aperta', variant: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (sentEmails.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        Nessuna email inviata
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sentEmails.slice(0, 10).map((email) => (
        <div key={email.id} className="flex justify-between items-center p-3 bg-gray-900 rounded">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{email.to_email}</span>
              {getStatusBadge(email.status)}
            </div>
            <p className="text-gray-400 text-sm">{email.subject}</p>
          </div>
          <span className="text-gray-500 text-sm">
            {new Date(email.created_at).toLocaleDateString('it-IT')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SentEmailsList;
