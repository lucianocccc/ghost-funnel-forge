
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailTemplate } from '@/types/email';

interface EmailTemplateFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: EmailTemplate | null;
  formData: {
    name: string;
    subject: string;
    content: string;
    variables: string[];
    category: string;
    is_active: boolean;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  isOpen,
  onOpenChange,
  editingTemplate,
  formData,
  setFormData,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button onClick={onSubmit}>
              {editingTemplate ? 'Aggiorna' : 'Crea'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateForm;
