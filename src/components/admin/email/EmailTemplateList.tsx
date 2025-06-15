
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Mail } from 'lucide-react';
import { EmailTemplate } from '@/types/email';

interface EmailTemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
}

const EmailTemplateList: React.FC<EmailTemplateListProps> = ({
  templates,
  onEdit,
  onDelete
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nessun template email configurato</p>
        <p className="text-sm">Crea il primo template per iniziare</p>
      </div>
    );
  }

  return (
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
                onClick={() => onEdit(template)}
                className="text-white border-gray-600 hover:bg-gray-800"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(template.id)}
                className="text-red-400 border-red-600 hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailTemplateList;
