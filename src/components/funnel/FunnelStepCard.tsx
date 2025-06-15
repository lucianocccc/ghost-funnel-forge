
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Copy, Edit, Trash2 } from 'lucide-react';

interface FunnelStep {
  id: string;
  step_number: number;
  step_type: string;
  title: string;
  description?: string;
}

interface StepTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface FunnelStepCardProps {
  step: FunnelStep;
  index: number;
  total: number;
  typeConfig: StepTypeConfig;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FunnelStepCard: React.FC<FunnelStepCardProps> = ({
  step,
  index,
  total,
  typeConfig,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onEdit,
  onDelete,
}) => (
  <Card className="relative">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center text-white font-bold">
            {step.step_number}
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{typeConfig.icon}</span>
              {step.title}
            </CardTitle>
            <Badge variant="outline">{typeConfig.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {index > 0 && (
            <Button size="sm" variant="ghost" onClick={onMoveUp}>
              <ArrowUp className="w-4 h-4" />
            </Button>
          )}
          {index < total - 1 && (
            <Button size="sm" variant="ghost" onClick={onMoveDown}>
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">{step.description || typeConfig.description}</p>
    </CardContent>
    {/* Connection Arrow */}
    {index < total - 1 && (
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <ArrowDown className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    )}
  </Card>
);

export default FunnelStepCard;
