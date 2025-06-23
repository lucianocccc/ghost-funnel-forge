
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Star } from 'lucide-react';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';
import { format } from 'date-fns';

interface ConsolidatedLeadDetailHeaderProps {
  lead: ConsolidatedLeadWithDetails;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onSave: () => void;
  getStatusColor: (status: string) => string;
}

const ConsolidatedLeadDetailHeader: React.FC<ConsolidatedLeadDetailHeaderProps> = ({
  lead,
  editMode,
  setEditMode,
  onSave,
  getStatusColor
}) => {
  return (
    <DialogHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl">
              {lead.name || 'Lead senza nome'}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Creato il {format(new Date(lead.created_at!), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(lead.status!)}>
            {lead.status}
          </Badge>
          {lead.lead_score > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {lead.lead_score}
            </Badge>
          )}
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Annulla" : "Modifica"}
          </Button>
          {editMode && (
            <Button onClick={onSave}>
              Salva
            </Button>
          )}
        </div>
      </div>
    </DialogHeader>
  );
};

export default ConsolidatedLeadDetailHeader;
