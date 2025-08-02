import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye, Settings, Trash2 } from 'lucide-react';
import { FunnelSection } from '@/hooks/useModularFunnelConfig';

interface SortableItemProps {
  id: string;
  section: FunnelSection;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FunnelSection>) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  section,
  index,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return '🎯';
      case 'problem_solution': return '❓';
      case 'social_proof': return '⭐';
      case 'lead_capture': return '📧';
      case 'urgency': return '⏰';
      default: return '📄';
    }
  };

  const getSectionPreview = (section: FunnelSection) => {
    const content = section.config?.content || {};
    return {
      title: content.headline || content.title || section.config?.template_name || 'Sezione senza titolo',
      subtitle: content.subheadline || content.subtitle || section.section_type,
      hasContent: Object.keys(content).length > 0
    };
  };

  const preview = getSectionPreview(section);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-lg">{getSectionIcon(section.section_type)}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{preview.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {preview.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Open preview modal
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="bg-muted/50 rounded-md p-4 min-h-[100px] flex items-center justify-center">
          {preview.hasContent ? (
            <div className="text-center">
              <div className="text-sm font-medium mb-1">{preview.title}</div>
              <div className="text-xs text-muted-foreground">{preview.subtitle}</div>
              <div className="mt-2 text-xs">
                <Badge variant="secondary">
                  {section.section_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Settings className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">Clicca per configurare</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Tipo: {section.section_type}</span>
          <span className={section.is_enabled ? 'text-green-600' : 'text-orange-600'}>
            {section.is_enabled ? 'Attiva' : 'Disattiva'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};