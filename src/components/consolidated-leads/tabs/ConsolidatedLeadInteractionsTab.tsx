import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus } from 'lucide-react';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';
import { format } from 'date-fns';

interface ConsolidatedLeadInteractionsTabProps {
  lead: ConsolidatedLeadWithDetails;
  newInteraction: {
    type: string;
    subject: string;
    content: string;
  };
  setNewInteraction: (interaction: any) => void;
  onAddInteraction: () => void;
}

const ConsolidatedLeadInteractionsTab: React.FC<ConsolidatedLeadInteractionsTabProps> = ({
  lead,
  newInteraction,
  setNewInteraction,
  onAddInteraction
}) => {
  return (
    <div className="space-y-4">
      {/* Add New Interaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Aggiungi Interazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newInteraction.type}
                onValueChange={(value) => setNewInteraction({...newInteraction, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Chiamata</SelectItem>
                  <SelectItem value="meeting">Incontro</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Oggetto</Label>
              <Input
                value={newInteraction.subject}
                onChange={(e) => setNewInteraction({...newInteraction, subject: e.target.value})}
                placeholder="Oggetto dell'interazione"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contenuto</Label>
            <Textarea
              value={newInteraction.content}
              onChange={(e) => setNewInteraction({...newInteraction, content: e.target.value})}
              placeholder="Descrivi l'interazione..."
              rows={3}
            />
          </div>
          <Button onClick={onAddInteraction} disabled={!newInteraction.content.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Interazione
          </Button>
        </CardContent>
      </Card>

      {/* Existing Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Storico Interazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lead.lead_interactions && lead.lead_interactions.length > 0 ? (
            <div className="space-y-4">
              {lead.lead_interactions
                .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
                .map((interaction) => (
                <div key={interaction.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="capitalize">
                      {interaction.interaction_type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(interaction.created_at!), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  {interaction.subject && (
                    <div className="font-medium mb-1">{interaction.subject}</div>
                  )}
                  <div className="text-gray-700">{interaction.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nessuna interazione registrata per questo lead
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsolidatedLeadInteractionsTab;
