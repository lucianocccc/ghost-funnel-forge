
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsolidatedLeadWithDetails, BusinessAreaWithSubAreas } from '@/types/consolidatedLeads';
import ConsolidatedLeadDetailHeader from './ConsolidatedLeadDetailHeader';
import ConsolidatedLeadOverviewTab from './tabs/ConsolidatedLeadOverviewTab';
import ConsolidatedLeadAnalysisTab from './tabs/ConsolidatedLeadAnalysisTab';
import ConsolidatedLeadSubmissionsTab from './tabs/ConsolidatedLeadSubmissionsTab';
import ConsolidatedLeadInteractionsTab from './tabs/ConsolidatedLeadInteractionsTab';

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
        <ConsolidatedLeadDetailHeader
          lead={lead}
          editMode={editMode}
          setEditMode={setEditMode}
          onSave={handleSave}
          getStatusColor={getStatusColor}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="analysis">Analisi AI</TabsTrigger>
            <TabsTrigger value="submissions">Submission</TabsTrigger>
            <TabsTrigger value="interactions">Interazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ConsolidatedLeadOverviewTab
              lead={lead}
              editMode={editMode}
              formData={formData}
              setFormData={setFormData}
              businessAreas={businessAreas}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <ConsolidatedLeadAnalysisTab
              lead={lead}
              onAnalyzeLead={onAnalyzeLead}
            />
          </TabsContent>

          <TabsContent value="submissions">
            <ConsolidatedLeadSubmissionsTab lead={lead} />
          </TabsContent>

          <TabsContent value="interactions">
            <ConsolidatedLeadInteractionsTab
              lead={lead}
              newInteraction={newInteraction}
              setNewInteraction={setNewInteraction}
              onAddInteraction={handleAddInteraction}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ConsolidatedLeadDetail;
