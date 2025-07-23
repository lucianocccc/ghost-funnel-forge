
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStrategicInsights } from '@/hooks/useStrategicInsights';
import { Zap, Plus, AlertTriangle } from 'lucide-react';

interface AICreditsWidgetProps {
  showUpgrade?: boolean;
  compact?: boolean;
}

const AICreditsWidget: React.FC<AICreditsWidgetProps> = ({ 
  showUpgrade = true, 
  compact = false 
}) => {
  const { aiCredits, trackBehavior } = useStrategicInsights();

  if (!aiCredits) return null;

  const totalCredits = aiCredits.credits_available + aiCredits.credits_used;
  const usagePercentage = totalCredits > 0 ? (aiCredits.credits_used / totalCredits) * 100 : 0;
  const isLowCredits = aiCredits.credits_available < 10;

  const handleUpgradeClick = () => {
    trackBehavior('ai_credits_upgrade_clicked', {
      current_credits: aiCredits.credits_available,
      credits_used: aiCredits.credits_used,
    });
  };

  const handlePurchaseClick = () => {
    trackBehavior('ai_credits_purchase_clicked', {
      current_credits: aiCredits.credits_available,
    });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
        <Zap className={`h-4 w-4 ${isLowCredits ? 'text-destructive' : 'text-primary'}`} />
        <div className="flex-1">
          <div className="text-sm font-medium">
            {aiCredits.credits_available} credits
          </div>
          <Progress value={100 - usagePercentage} className="h-1 mt-1" />
        </div>
        {isLowCredits && (
          <Button size="sm" variant="outline" onClick={handlePurchaseClick}>
            <Plus className="h-3 w-3 mr-1" />
            Buy
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`${isLowCredits ? 'border-destructive' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            AI Credits
            {isLowCredits && (
              <AlertTriangle className="h-4 w-4 ml-2 text-destructive" />
            )}
          </CardTitle>
          <CardDescription>
            Smart usage for maximum impact
          </CardDescription>
        </div>
        <Badge variant={isLowCredits ? "destructive" : "secondary"}>
          {aiCredits.credits_available} available
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Usage this month</span>
              <span>{aiCredits.credits_used} / {totalCredits}</span>
            </div>
            <Progress value={usagePercentage} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">Available</div>
              <div className="font-medium">{aiCredits.credits_available}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Used</div>
              <div className="font-medium">{aiCredits.credits_used}</div>
            </div>
          </div>

          {new Date(aiCredits.reset_date) && (
            <div className="text-xs text-muted-foreground">
              Resets on {new Date(aiCredits.reset_date).toLocaleDateString()}
            </div>
          )}

          {isLowCredits && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <div className="text-sm font-medium text-destructive mb-1">
                Running low on credits
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                You're running low on AI credits. Consider upgrading your plan or purchasing additional credits.
              </div>
            </div>
          )}

          {showUpgrade && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handlePurchaseClick}
              >
                <Plus className="h-3 w-3 mr-1" />
                Buy Credits
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleUpgradeClick}
              >
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AICreditsWidget;
