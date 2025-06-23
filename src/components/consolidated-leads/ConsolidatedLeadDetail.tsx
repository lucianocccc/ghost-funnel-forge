import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Brain, 
  Calendar,
  MessageSquare,
  Target,
  Lightbulb,
  CheckCircle,
  Star,
  Plus
} from 'lucide-react';
import { ConsolidatedLeadWithDetails, BusinessAreaWithSubAreas, parseJsonArray, getJsonArrayLength } from '@/types/consolidatedLeads';
import { format } from 'date-fns';

interface ConsolidatedLeadDetailProps {
  lead: ConsolidatedLeadWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeLead: (leadId: string) => void;
  onUpdateLead: (leadId: string, updates: any) => void;
  onAddInteraction: (interaction: any) => void;
  businessAreas: BusinessAreaWithSubAreas[];
}

const ConsolidatedLeadDetail: React.FC<ConsolidatedLeadDetailProps> = ({
  lead,
  isOpen,
  onClose,
  onAnalyzeLead,
  onUpdateLead,
  onAddInteraction,
  businessAreas
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: lead.status,
    priority_level: lead.priority_level,
    business_area_id: lead.business_area_id,
    business_sub_area_id: lead.business_sub_area_id,
    notes: lead.notes || ''
  });
  const [newInteraction, setNewInteraction] = useState({
    type: 'note',
    subject: '',
    content: ''
  });

  const selectedBusinessArea = businessAreas.find(area => area.id === formData.business_area_id);
  const subAreas = selectedBusinessArea?.business_sub_areas || [];

  // Safely parse JSON arrays
  const aiInsights = parseJsonArray(lead.ai_insights);
  const aiRecommendations = parseJsonArray(lead.ai_recommendations);
  const actionPlan = parseJsonArray(lead.action_plan);

  const handleSave = () => {
    onUpdateLead(lead.id, formData);
    setEditMode(false);
  };

  const handleAddInteraction = () => {
    if (newInteraction.content.trim()) {
      onAddInteraction({
        consolidated_lead_id: lead.id,
        interaction_type: newInteraction.type,
        subject: newInteraction.subject,
        content: newInteraction.content
      });
      setNewInteraction({ type: 'note', subject: '', content: '' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-orange-100 text-orange-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                <Button onClick={handleSave}>
                  Salva
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="analysis">Analisi AI</TabsTrigger>
            <TabsTrigger value="submissions">Submission</TabsTrigger>
            <TabsTrigger value="interactions">Interazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {lead.ai_analysis ? (
              <div className="space-y-4">
                {/* Analysis Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Risultati Analisi AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{lead.lead_score}</div>
                        <div className="text-sm text-gray-600">Lead Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold capitalize">{lead.priority_level}</div>
                        <div className="text-sm text-gray-600">Priorità</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getJsonArrayLength(lead.ai_insights)}</div>
                        <div className="text-sm text-gray-600">Insights</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{getJsonArrayLength(lead.ai_recommendations)}</div>
                        <div className="text-sm text-gray-600">Raccomandazioni</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                {aiInsights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiInsights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {aiRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Raccomandazioni
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiRecommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Action Plan */}
                {actionPlan.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Piano d'Azione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {actionPlan.map((action: any, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{action.action}</div>
                              <div className="text-sm text-gray-600">
                                Stima: {action.estimated_days} giorni
                              </div>
                            </div>
                            <Badge variant={
                              action.priority === 'high' ? 'destructive' :
                              action.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {action.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analisi AI non ancora disponibile
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Analizza questo lead con l'intelligenza artificiale per ottenere insights e raccomandazioni
                  </p>
                  <Button
                    onClick={() => onAnalyzeLead(lead.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Analizza con AI
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submission del Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.lead_submissions_mapping && lead.lead_submissions_mapping.length > 0 ? (
                  <div className="space-y-4">
                    {lead.lead_submissions_mapping.map((mapping) => (
                      <div key={mapping.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            Submission #{mapping.submission_id?.slice(0, 8)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(mapping.created_at!), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(mapping.submission_data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nessuna submission disponibile per questo lead
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
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
                <Button onClick={handleAddInteraction} disabled={!newInteraction.content.trim()}>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ConsolidatedLeadDetail;
