
import React, { useState, useCallback, useMemo } from 'react';
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
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    description: '',
    rule_type: 'response_time' as LeadScoringRule['rule_type'],
    condition_operator: 'less_than' as LeadScoringRule['condition_operator'],
    condition_value: '',
    points: 0,
    is_active: true
  }));

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      rule_type: 'response_time',
      condition_operator: 'less_than',
      condition_value: '',
      points: 0,
      is_active: true
    });
  }, []);

  const handleCreate = useCallback(async () => {
    try {
      await createRule(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  }, [createRule, formData, resetForm]);

  const handleEdit = useCallback((rule: LeadScoringRule) => {
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
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingRule) return;
    
    try {
      await updateRule(editingRule.id, formData);
      setEditingRule(null);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  }, [editingRule, formData, updateRule, resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa regola?')) {
      await deleteRule(id);
    }
  }, [deleteRule]);

  const handleFormSubmit = useCallback(() => {
    if (editingRule) {
      handleUpdate();
    } else {
      handleCreate();
    }
  }, [editingRule, handleUpdate, handleCreate]);

  const handleFormCancel = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingRule(null);
    resetForm();
  }, [resetForm]);

  const handleEditClick = useCallback((rule: LeadScoringRule) => {
    handleEdit(rule);
    setIsCreateDialogOpen(true);
  }, [handleEdit]);

  const handleNewRuleClick = useCallback(() => {
    resetForm(); 
    setEditingRule(null);
    setIsCreateDialogOpen(true);
  }, [resetForm]);

  const memoizedRulesList = useMemo(() => (
    <LeadScoringRulesList
      rules={rules}
      onEdit={handleEditClick}
      onDelete={handleDelete}
    />
  ), [rules, handleEditClick, handleDelete]);

  const memoizedScoresList = useMemo(() => (
    <RecentScoresList scores={scores} />
  ), [scores]);

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
                <Button onClick={handleNewRuleClick}>
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
          {memoizedRulesList}
        </CardContent>
      </Card>

      {memoizedScoresList}
    </div>
  );
};

export default LeadScoringPanel;
