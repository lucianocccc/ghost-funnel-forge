
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building } from 'lucide-react';
import { ConsolidatedLeadWithDetails, BusinessAreaWithSubAreas } from '@/types/consolidatedLeads';

interface ConsolidatedLeadOverviewTabProps {
  lead: ConsolidatedLeadWithDetails;
  editMode: boolean;
  formData: {
    status: string;
    priority_level: string;
    business_area_id: string;
    business_sub_area_id: string;
    notes: string;
  };
  setFormData: (data: any) => void;
  businessAreas: BusinessAreaWithSubAreas[];
  getStatusColor: (status: string) => string;
}

const ConsolidatedLeadOverviewTab: React.FC<ConsolidatedLeadOverviewTabProps> = ({
  lead,
  editMode,
  formData,
  setFormData,
  businessAreas,
  getStatusColor
}) => {
  const selectedBusinessArea = businessAreas.find(area => area.id === formData.business_area_id);
  const subAreas = selectedBusinessArea?.business_sub_areas || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informazioni di Contatto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{lead.email || 'Email non disponibile'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{lead.phone || 'Telefono non disponibile'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{lead.company || 'Azienda non specificata'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Lead Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestione Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {editMode ? (
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuovo</SelectItem>
                    <SelectItem value="contacted">Contattato</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="qualified">Qualificato</SelectItem>
                    <SelectItem value="converted">Convertito</SelectItem>
                    <SelectItem value="lost">Perso</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(lead.status!)}>
                  {lead.status}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priorità</Label>
              {editMode ? (
                <Select
                  value={formData.priority_level || ''}
                  onValueChange={(value) => setFormData({...formData, priority_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bassa</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">
                  {lead.priority_level}
                </Badge>
              )}
            </div>

            {editMode && (
              <>
                <div className="space-y-2">
                  <Label>Area Business</Label>
                  <Select
                    value={formData.business_area_id || ''}
                    onValueChange={(value) => setFormData({...formData, business_area_id: value, business_sub_area_id: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona area" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sottoarea</Label>
                  <Select
                    value={formData.business_sub_area_id || ''}
                    onValueChange={(value) => setFormData({...formData, business_sub_area_id: value})}
                    disabled={!formData.business_area_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona sottoarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {subAreas.map((subArea) => (
                        <SelectItem key={subArea.id} value={subArea.id}>
                          {subArea.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Note</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Aggiungi note su questo lead..."
              rows={4}
            />
          ) : (
            <p className="text-gray-600">
              {lead.notes || 'Nessuna nota disponibile'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsolidatedLeadOverviewTab;
