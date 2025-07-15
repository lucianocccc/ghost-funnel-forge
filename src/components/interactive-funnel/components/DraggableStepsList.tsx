import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import DraggableStepItem from './DraggableStepItem';
import { updateFunnelStep } from '@/services/interactiveFunnelService';
import { useToast } from '@/hooks/use-toast';

interface DraggableStepsListProps {
  steps: InteractiveFunnelStep[];
  onDeleteStep: (stepId: string) => void;
  onEditStep: (step: InteractiveFunnelStep) => void;
  onStepsReorder: (newSteps: InteractiveFunnelStep[]) => void;
}

const DraggableStepsList: React.FC<DraggableStepsListProps> = ({
  steps,
  onDeleteStep,
  onEditStep,
  onStepsReorder
}) => {
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedSteps.findIndex(step => step.id === active.id);
      const newIndex = sortedSteps.findIndex(step => step.id === over?.id);

      const newSteps = arrayMove(sortedSteps, oldIndex, newIndex);

      // Aggiorna l'ordine locale immediatamente per la UI
      const updatedSteps = newSteps.map((step, index) => ({
        ...step,
        step_order: index + 1
      }));

      onStepsReorder(updatedSteps);

      // Aggiorna l'ordine nel database in background
      try {
        await Promise.all(
          updatedSteps.map(step =>
            updateFunnelStep(step.id, { step_order: step.step_order })
          )
        );
        
        toast({
          title: "Successo",
          description: "Ordine dei passi aggiornato",
        });
      } catch (error) {
        console.error('Error updating step order:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiornamento dell'ordine",
          variant: "destructive",
        });
        // Ripristina l'ordine precedente in caso di errore
        onStepsReorder(sortedSteps);
      }
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Passi del Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Trascina i passi per riordinarli
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedSteps.map(step => step.id)} strategy={verticalListSortingStrategy}>
            {sortedSteps.map((step, index) => (
              <DraggableStepItem
                key={step.id}
                step={step}
                index={index}
                onDelete={() => onDeleteStep(step.id)}
                onEdit={() => onEditStep(step)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

export default DraggableStepsList;