import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Settings, Eye } from 'lucide-react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

interface DraggableStepItemProps {
  step: InteractiveFunnelStep;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
}

const DraggableStepItem: React.FC<DraggableStepItemProps> = ({
  step,
  index,
  onDelete,
  onEdit
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border rounded-lg bg-card transition-all duration-200 ${
        isDragging 
          ? 'shadow-lg border-primary/50 bg-primary/5 scale-105' 
          : 'hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
        {index + 1}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{step.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {step.description}
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {step.step_type}
          </Badge>
          {step.is_required && (
            <Badge variant="secondary" className="text-xs">
              Obbligatorio
            </Badge>
          )}
          {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {step.fields_config.length} campi
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onEdit}
          className="hover:bg-muted"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DraggableStepItem;