import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLeadScoring, LeadScoringRule } from '@/hooks/useLeadScoring';
import { Plus, Edit2, Trash2, Calculator, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const LeadScoringPanel: React.FC = () => {
  const { rules, scores, loading, createRule, updateRule, deleteRule, calculateLeadScore } = useLeadScoring();
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

  const getRuleTypeLabel = (type: string) => {
    const labels = {
      response_time: 'Tempo di Risposta',
      message_length: 'Lunghezza Messaggio',
      source: 'Fonte',
      tone: 'Tono'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      less_than: 'Minore di',
      greater_than: 'Maggiore di',
      equals: 'Uguale a',
      contains: 'Contiene'
    };
    return labels[operator as keyof typeof labels] || operator;
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Regola</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Es: Lead premium da LinkedIn"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrizione della regola..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rule_type">Tipo di Regola</Label>
                      <Select
                        value={formData.rule_type}
                        onValueChange={(value: LeadScoringRule['rule_type']) => setFormData({ ...formData, rule_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="response_time">Tempo di Risposta</SelectItem>
                          <SelectItem value="message_length">Lunghezza Messaggio</SelectItem>
                          <SelectItem value="source">Fonte</SelectItem>
                          <SelectItem value="tone">Tono</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="condition_operator">Operatore</Label>
                      <Select
                        value={formData.condition_operator}
                        onValueChange={(value: LeadScoringRule['condition_operator']) => setFormData({ ...formData, condition_operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than">Minore di</SelectItem>
                          <SelectItem value="greater_than">Maggiore di</SelectItem>
                          <SelectItem value="equals">Uguale a</SelectItem>
                          <SelectItem value="contains">Contiene</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition_value">Valore</Label>
                      <Input
                        id="condition_value"
                        value={formData.condition_value}
                        onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                        placeholder="Es: 60, LinkedIn, urgente"
                      />
                    </div>

                    <div>
                      <Label htmlFor="points">Punti</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        placeholder="Es: 10, -5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Regola attiva</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingRule(null);
                        resetForm();
                      }}
                    >
                      Annulla
                    </Button>
                    <Button onClick={editingRule ? handleUpdate : handleCreate}>
                      {editingRule ? 'Aggiorna' : 'Crea'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna regola di scoring configurata</p>
              <p className="text-sm">Crea la prima regola per iniziare a valutare i lead</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{rule.name}</h3>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Attiva' : 'Inattiva'}
                        </Badge>
                        <Badge variant="outline" className="text-white">
                          {rule.points > 0 ? '+' : ''}{rule.points} punti
                        </Badge>
                      </div>
                      {rule.description && (
                        <p className="text-gray-400 text-sm mb-2">{rule.description}</p>
                      )}
                      <div className="text-sm text-gray-300">
                        <span className="font-medium">{getRuleTypeLabel(rule.rule_type)}</span>
                        {' '}
                        <span>{getOperatorLabel(rule.condition_operator)}</span>
                        {' '}
                        <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {rule.condition_value}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleEdit(rule);
                          setIsCreateDialogOpen(true);
                        }}
                        className="text-white border-gray-600 hover:bg-gray-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-400 border-red-600 hover:bg-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Punteggi Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Nessun punteggio calcolato
            </div>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 10).map((score) => (
                <div key={score.id} className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <span className="text-white">Lead ID: {score.lead_id.slice(0, 8)}...</span>
                  <Badge variant="outline" className="text-white">
                    {score.total_score} punti
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadScoringPanel;
