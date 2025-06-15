
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AdminLeadsHeaderProps {
  leadsCount: number;
}

const AdminLeadsHeader: React.FC<AdminLeadsHeaderProps> = ({ leadsCount }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">
        Gestione Lead
      </h2>
      <Badge variant="outline" className="text-white border-golden">
        {leadsCount} lead trovati
      </Badge>
    </div>
  );
};

export default AdminLeadsHeader;
