import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Bot } from 'lucide-react';

interface FunnelTypeBadgeProps {
  funnel: {
    settings?: any;
  };
  size?: 'sm' | 'default';
}

export const FunnelTypeBadge: React.FC<FunnelTypeBadgeProps> = ({ funnel, size = 'default' }) => {
  const settings = funnel.settings || {};
  
  // Check for Smart Funnel
  if (settings.smart_funnel || settings.ai_generated) {
    return (
      <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
        <Brain className="w-3 h-3 mr-1" />
        Smart AI
      </Badge>
    );
  }
  
  // Check for Ghost Funnel
  if (settings.ghost_funnel || settings.generation_type === 'ghost') {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
        <Sparkles className="w-3 h-3 mr-1" />
        Ghost AI
      </Badge>
    );
  }
  
  // Check for Revolution Funnel
  if (settings.revolution_funnel || settings.generation_type === 'revolution') {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
        <Bot className="w-3 h-3 mr-1" />
        Revolution AI
      </Badge>
    );
  }
  
  // Default manual funnel
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-600">
      Manuale
    </Badge>
  );
};

export default FunnelTypeBadge;