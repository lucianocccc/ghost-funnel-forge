
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const AdminLeadsEmptyState: React.FC = () => {
  return (
    <Card className="bg-white border-golden border">
      <CardContent className="text-center py-8">
        <Users className="w-12 h-12 text-golden mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-black mb-2">
          Nessun Lead Trovato
        </h3>
        <p className="text-gray-600">
          Non ci sono lead che corrispondono ai filtri selezionati
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminLeadsEmptyState;
