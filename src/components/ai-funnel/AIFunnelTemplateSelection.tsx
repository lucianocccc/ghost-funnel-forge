
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';
import { useFunnels } from '@/hooks/useFunnels';

interface AIFunnelTemplateSelectionProps {
  onTemplateSelect: (templateId: string, templateName: string) => void;
}

const AIFunnelTemplateSelection: React.FC<AIFunnelTemplateSelectionProps> = ({
  onTemplateSelect
}) => {
  const { templates } = useFunnels();

  if (templates.length === 0) return null;

  return (
    <div className="border-t border-gray-700 p-4">
      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-golden" />
        Scegli un Template:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.slice(0, 4).map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="text-left h-auto p-3 border-gray-600 hover:border-golden"
            onClick={() => onTemplateSelect(template.id, template.name)}
          >
            <div className="w-full">
              <div className="font-medium text-golden">{template.name}</div>
              <div className="text-xs text-gray-400 mt-1">{template.description}</div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <ArrowRight className="w-3 h-3 text-golden" />
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIFunnelTemplateSelection;
