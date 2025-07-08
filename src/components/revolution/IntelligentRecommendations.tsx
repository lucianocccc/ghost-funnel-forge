// Ghost Funnel Revolution - Intelligent AI Recommendations Component

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Brain,
  Star
} from 'lucide-react';
import { AIRecommendationService } from '@/services/revolutionServices';
import { AIRecommendation } from '@/types/revolutionTypes';

interface IntelligentRecommendationsProps {
  recommendations: AIRecommendation[];
}

export const IntelligentRecommendations: React.FC<IntelligentRecommendationsProps> = ({
  recommendations
}) => {
  const [implementingId, setImplementingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white border-red-500';
      case 'high':
        return 'bg-orange-500 text-white border-orange-500';
      case 'medium':
        return 'bg-blue-500 text-white border-blue-500';
      case 'low':
        return 'bg-gray-500 text-white border-gray-500';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      case 'high':
        return <TrendingUp className="w-3 h-3" />;
      case 'medium':
        return <Target className="w-3 h-3" />;
      case 'low':
        return <Clock className="w-3 h-3" />;
      default:
        return <Lightbulb className="w-3 h-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'funnel_optimization':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'lead_nurturing':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'content_strategy':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'audience_targeting':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'conversion_improvement':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'funnel_optimization':
        return 'Ottimizzazione Funnel';
      case 'lead_nurturing':
        return 'Lead Nurturing';
      case 'content_strategy':
        return 'Strategia Contenuti';
      case 'audience_targeting':
        return 'Targeting Audience';
      case 'conversion_improvement':
        return 'Miglioramento Conversioni';
      default:
        return 'Raccomandazione AI';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleImplement = async (recommendation: AIRecommendation) => {
    try {
      setImplementingId(recommendation.id);
      
      await AIRecommendationService.markRecommendationAsImplemented(recommendation.id);
      
      toast({
        title: "🚀 Raccomandazione implementata!",
        description: "L'AI continuerà a monitorare i risultati e ti fornirà feedback.",
      });

    } catch (error) {
      console.error('Failed to implement recommendation:', error);
      toast({
        title: "Errore nell'implementazione",
        description: "Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setImplementingId(null);
    }
  };

  const handleView = async (recommendation: AIRecommendation) => {
    try {
      await AIRecommendationService.markRecommendationAsViewed(recommendation.id);
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Tutto ottimizzato!</h3>
        <p className="text-muted-foreground">
          L'AI sta analizzando il tuo account per nuove opportunità di ottimizzazione.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className="transition-all duration-200 hover:shadow-md border-l-4"
            style={{ 
              borderLeftColor: recommendation.priority_level === 'critical' ? '#ef4444' : 
                               recommendation.priority_level === 'high' ? '#f97316' : 
                               recommendation.priority_level === 'medium' ? '#3b82f6' : '#6b7280' 
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getTypeIcon(recommendation.recommendation_type!)}
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight">
                      {recommendation.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {getTypeLabel(recommendation.recommendation_type!)}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(recommendation.priority_level!)}`}>
                    {getPriorityIcon(recommendation.priority_level!)}
                    <span className="ml-1 capitalize">{recommendation.priority_level}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {recommendation.description}
              </p>

              {/* Action Items */}
              {recommendation.action_items && Array.isArray(recommendation.action_items) && recommendation.action_items.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Azioni consigliate:</h5>
                  <ul className="space-y-1">
                    {recommendation.action_items.slice(0, 3).map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{String(action)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expected Impact & Difficulty */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-muted-foreground">
                      Impatto: <span className="font-medium text-foreground">
                        +{recommendation.expected_impact && typeof recommendation.expected_impact === 'object' 
                          ? (recommendation.expected_impact as any).conversionIncrease || 15 
                          : 15}%
                      </span>
                    </span>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getDifficultyColor(recommendation.implementation_difficulty!)}`}
                  >
                    {recommendation.implementation_difficulty === 'easy' ? 'Facile' :
                     recommendation.implementation_difficulty === 'medium' ? 'Medio' : 'Difficile'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleImplement(recommendation)}
                  disabled={implementingId === recommendation.id || recommendation.status !== 'pending'}
                  className="flex-1"
                >
                  {implementingId === recommendation.id ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Implementando...
                    </>
                  ) : recommendation.status === 'implemented' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Implementata
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3 h-3 mr-2" />
                      Implementa
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(recommendation)}
                >
                  Dettagli
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default IntelligentRecommendations;