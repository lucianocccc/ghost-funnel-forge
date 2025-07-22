
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import InteractiveFunnelCreator from '@/components/interactive-funnel/InteractiveFunnelCreator';

interface FunnelManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FunnelManagementHeader: React.FC<FunnelManagementHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Funnel</h1>
          <p className="text-gray-600 mt-1">
            Crea, modifica e gestisci i tuoi funnel interattivi
          </p>
        </div>

        <div className="relative w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cerca funnel..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>
      
      <InteractiveFunnelCreator />
    </div>
  );
};

export default FunnelManagementHeader;
