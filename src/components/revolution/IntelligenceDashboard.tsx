import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Database } from 'lucide-react';

interface DataCategory {
  name: string;
  progress: number;
  confidence: number;
  dataPoints: string[];
}

interface IntelligenceMetrics {
  overall_completeness: number;
  data_quality: number;
  confidence_level: number;
  categories: DataCategory[];
  learning_patterns: string[];
  recommendations: string[];
}

interface IntelligenceDashboardProps {
  metrics: IntelligenceMetrics;
  conversationState?: any;
  className?: string;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  metrics,
  conversationState,
  className = ""
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "hsl(120, 70%, 50%)"; // Green
    if (confidence >= 0.6) return "hsl(60, 70%, 50%)";  // Yellow
    if (confidence >= 0.4) return "hsl(30, 70%, 50%)";  // Orange
    return "hsl(0, 70%, 50%)"; // Red
  };

  const getCompletenessLevel = (completeness: number) => {
    if (completeness >= 85) return { label: "Ready for Funnel", color: "success" };
    if (completeness >= 60) return { label: "Good Progress", color: "warning" };
    if (completeness >= 30) return { label: "Building Knowledge", color: "info" };
    return { label: "Starting Phase", color: "secondary" };
  };

  const completenessLevel = getCompletenessLevel(metrics.overall_completeness);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overall_completeness}%</div>
            <Progress value={metrics.overall_completeness} className="mt-2" />
            <Badge variant={completenessLevel.color as any} className="mt-2">
              {completenessLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.data_quality}%</div>
            <Progress value={metrics.data_quality} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Information depth and relevance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.confidence_level * 100)}%</div>
            <Progress value={metrics.confidence_level * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              AI understanding level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Data Categories Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getConfidenceColor(category.confidence) }}
                    />
                    <span className="font-medium capitalize">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.dataPoints.length} data points
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(category.confidence * 100)}% confident
                  </span>
                </div>
                <Progress value={category.progress} className="h-2" />
                {category.dataPoints.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Collected: </span>
                    {category.dataPoints.slice(0, 3).join(', ')}
                    {category.dataPoints.length > 3 && ` +${category.dataPoints.length - 3} more`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Patterns */}
      {metrics.learning_patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Learning Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.learning_patterns.map((pattern, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">{pattern}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time State Debug (Development) */}
      {process.env.NODE_ENV === 'development' && conversationState && (
        <Card>
          <CardHeader>
            <CardTitle>Debug: Conversation State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(conversationState, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};