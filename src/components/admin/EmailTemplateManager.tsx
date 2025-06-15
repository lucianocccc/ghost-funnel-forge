
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { Plus, Edit2, Trash2, Mail, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EmailTemplateManager: React.FC = () => {
  const { templates, sentEmails, loading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    variables: ['nome', 'email', 'servizio'],
    category: 'general',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      variables: ['nome', 'email', 'servizio'],
      category: 'general',
      is_active: true
    });
  };

  const handleCreate = async () => {
    try {
      await createTemplate(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      category: template.category,
      is_active: template.is_active
    });
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate(editingTemplate.id, formData);
      setEditingTemplate(null);
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo template?')) {
      await deleteTemplate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'In Coda', variant: 'secondary' as const },
      sent: { label: 'Inviata', variant: 'default' as const },
      failed: { label: 'Fallita', variant: 'destructive' as const },
      delivered: { label: 'Consegnata', variant: 'default' as const },
      opened: { label: 'Aperta', variant: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento template email...</div>
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
              <Mail className="w-5 h-5" />
              Email Template Manager
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingTemplate(null); setIsCreateDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Modifica Template' : 'Crea Nuovo Template'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Template</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Es: Benvenuto Lead"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Generale</SelectItem>
                          <SelectItem value="welcome">Benvenuto</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="promotion">Promozione</SelectItem>
                          <SelectItem value="reminder">Promemoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Oggetto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Es: Ciao {{nome}}, grazie per il tuo interesse!"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Contenuto</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Scrivi il contenuto dell'email qui..."
                      rows={10}
                    />
                  </div>

                  <div>
                    <Label>Variabili Disponibili</Label>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Puoi usare queste variabili nel tuo template:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Template attivo</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingTemplate(null);
                        resetForm();
                      }}
                    >
                      Annulla
                    </Button>
                    <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
                      {editingTemplate ? 'Aggiorna' : 'Crea'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun template email configurato</p>
              <p className="text-sm">Crea il primo template per iniziare</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                        <Badge variant="outline" className="text-white">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        <strong>Oggetto:</strong> {template.subject}
                      </p>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {template.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleEdit(template);
                          setIsCreateDialogOpen(true);
                        }}
                        className="text-white border-gray-600 hover:bg-gray-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
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

      {/* Recent Sent Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="w-5 h-5" />
            Email Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentEmails.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Nessuna email inviata
            </div>
          ) : (
            <div className="space-y-2">
              {sentEmails.slice(0, 10).map((email) => (
                <div key={email.id} className="flex justify-between items-center p-3 bg-gray-900 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{email.to_email}</span>
                      {getStatusBadge(email.status)}
                    </div>
                    <p className="text-gray-400 text-sm">{email.subject}</p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(email.created_at).toLocaleDateString('it-IT')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateManager;
