
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AdminLead } from '@/hooks/useAdminLeads';

interface LeadStatusBadgeProps {
  status: AdminLead['status'];
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status }) => {
  const getStatusBadge = (status: AdminLead['status']) => {
    const statusConfig = {
      nuovo: { label: 'Nuovo', variant: 'default' as const },
      contattato: { label: 'Contattato', variant: 'secondary' as const },
      in_trattativa: { label: 'In Trattativa', variant: 'outline' as const },
      chiuso_vinto: { label: 'Chiuso Vinto', variant: 'default' as const },
      chiuso_perso: { label: 'Chiuso Perso', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return getStatusBadge(status);
};

export default LeadStatusBadge;
