
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeadScoring, LeadScoringRule } from '@/hooks/useLeadScoring';
import { Plus, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LeadScoringRuleForm from './leadScoring/LeadScoringRuleForm';
import LeadScoringRulesList from './leadScoring/LeadScoringRulesList';
import RecentScoresList from './leadScoring/RecentScoresList';

const LeadScoringPanel: React.FC = () => {
  const { rules, scores, loading, createRule, updateRule, deleteRule } = useLeadScoring();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadScoringRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'response_time' as LeadScoringRule['rule_type'],
    condition_operator: 'less_than' as LeadScoringRule['condition_operator'],
    condition_value: '',
    points: 0,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rule_type: 'response_time',
      condition_operator: 'less_than',
      condition_value: '',
      points: 0,
      is_active: true
    });
  };

  const handleCreate = async () => {
    try {
      await createRule(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEdit = (rule: LeadScoringRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      rule_type: rule.rule_type,
      condition_operator: rule.condition_operator,
      condition_value: rule.condition_value,
      points: rule.points,
      is_active: rule.is_active
    });
  };

  const handleUpdate = async () => {
    if (!editingRule) return;
    
    try {
      await updateRule(editingRule.id, formData);
      setEditingRule(null);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa regola?')) {
      await deleteRule(id);
    }
  };

  const handleFormSubmit = () => {
    if (editingRule) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setEditingRule(null);
    resetForm();
  };

  const handleEditClick = (rule: LeadScoringRule) => {
    handleEdit(rule);
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento regole di scoring...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5" />
              Lead Scoring Engine
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Regola
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'Modifica Regola' : 'Crea Nuova Regola'}
                  </DialogTitle>
                </DialogHeader>
                <LeadScoringRuleForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  isEditing={!!editingRule}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <LeadScoringRulesList
            rules={rules}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <RecentScoresList scores={scores} />
    </div>
  );
};

export default LeadScoringPanel;
