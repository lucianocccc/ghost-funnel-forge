import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { FunnelSection } from '@/hooks/useModularFunnelConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, MousePointer } from 'lucide-react';

interface FunnelCanvasProps {
  sections: FunnelSection[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionsReorder: (sections: FunnelSection[]) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<FunnelSection>) => void;
}

export const FunnelCanvas: React.FC<FunnelCanvasProps> = ({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionsReorder,
  onSectionUpdate
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        onSectionsReorder(newSections);
      }
    }
  };

  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Canvas Vuoto</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Inizia aggiungendo sezioni dalla libreria o genera un funnel con l'AI
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MousePointer className="h-4 w-4" />
            <span>Vai su "Libreria" o "AI Generator" per iniziare</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-muted/20 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Canvas del Funnel</h2>
            <p className="text-muted-foreground">
              Trascina per riordinare • Clicca per modificare
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {sections.length} sezioni
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section, index) => (
                <SortableItem
                  key={section.id}
                  id={section.id}
                  section={section}
                  index={index}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => onSectionSelect(section.id)}
                  onUpdate={(updates) => onSectionUpdate(section.id, updates)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Section Placeholder */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-8 text-center">
            <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Aggiungi una nuova sezione dalla libreria
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};