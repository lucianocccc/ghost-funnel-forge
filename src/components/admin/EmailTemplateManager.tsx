
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { EmailTemplate } from '@/types/email';
import { Plus, Mail, Send } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import EmailTemplateForm from './email/EmailTemplateForm';
import EmailTemplateList from './email/EmailTemplateList';
import SentEmailsList from './email/SentEmailsList';

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
    setIsCreateDialogOpen(true);
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

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
    setEditingTemplate(null);
    resetForm();
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
            <Button onClick={() => { resetForm(); setEditingTemplate(null); setIsCreateDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmailTemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="w-5 h-5" />
            Email Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SentEmailsList sentEmails={sentEmails} />
        </CardContent>
      </Card>

      <EmailTemplateForm
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        editingTemplate={editingTemplate}
        formData={formData}
        setFormData={setFormData}
        onSubmit={editingTemplate ? handleUpdate : handleCreate}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EmailTemplateManager;
