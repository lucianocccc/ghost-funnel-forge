
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import InteractiveFunnelCreator from '@/components/interactive-funnel/InteractiveFunnelCreator';

interface FunnelManagementEmptyProps {
  searchQuery: string;
}

const FunnelManagementEmpty: React.FC<FunnelManagementEmptyProps> = ({ searchQuery }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'Nessun funnel trovato' : 'Nessun funnel creato'}
        </h3>
        <p className="text-gray-500 mb-4">
          {searchQuery 
            ? 'Prova a modificare i termini di ricerca'
            : 'Inizia creando il tuo primo funnel interattivo'
          }
        </p>
        {!searchQuery && <InteractiveFunnelCreator />}
      </CardContent>
    </Card>
  );
};

export default FunnelManagementEmpty;
