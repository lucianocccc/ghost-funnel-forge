
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FunnelManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const FunnelManagementHeader: React.FC<FunnelManagementHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">I Miei Funnel</h2>
        <p className="text-gray-600">Gestisci e monitora tutti i tuoi funnel interattivi</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cerca funnel..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>
    </div>
  );
};

export default FunnelManagementHeader;
