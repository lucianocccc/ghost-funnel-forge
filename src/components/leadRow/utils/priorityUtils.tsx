
import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Target } from 'lucide-react';

export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'alta': return 'bg-red-500 text-white';
    case 'media': return 'bg-yellow-500 text-white';
    case 'bassa': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const getPriorityIcon = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'alta': return <AlertTriangle className="w-4 h-4" />;
    case 'media': return <TrendingUp className="w-4 h-4" />;
    case 'bassa': return <CheckCircle className="w-4 h-4" />;
    default: return <Target className="w-4 h-4" />;
  }
};
