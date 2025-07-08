// Ghost Funnel Revolution - Behavioral Intelligence Component

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Eye,
  MousePointer,
  Clock,
  Target,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Brain
} from 'lucide-react';
import { BehavioralIntelligenceService } from '@/services/revolutionServices';

export const BehaviorTracker: React.FC = () => {
  const [sessionData, setSessionData] = useState({
    sessionId: '',
    totalActions: 0,
    engagementScore: 0,
    conversionIntentScore: 0,
    timeOnSite: 0,
    pagesViewed: 0
  });

  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    // Initialize session tracking
    const sessionId = BehavioralIntelligenceService.getOrCreateSessionId();
    setSessionData(prev => ({ ...prev, sessionId }));

    // Track initial page view
    trackAction('page_view', { page: window.location.pathname });

    // Set up behavior tracking listeners
    setupBehaviorTracking();

    // Simulate session data updates
    const interval = setInterval(updateSessionMetrics, 2000);

    return () => {
      clearInterval(interval);
      removeTrackingListeners();
    };
  }, []);

  const setupBehaviorTracking = () => {
    // Track clicks
    document.addEventListener('click', handleClick);
    
    // Track scrolling
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        trackAction('scroll', { scrollPercent });
      }, 250);
    });

    // Track form interactions
    document.addEventListener('focusin', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        trackAction('form_interaction', { 
          fieldType: (e.target as HTMLInputElement).type,
          fieldName: (e.target as HTMLInputElement).name 
        });
      }
    });

    // Track time on page
    setInterval(() => {
      setSessionData(prev => ({ ...prev, timeOnSite: prev.timeOnSite + 1 }));
    }, 1000);
  };

  const removeTrackingListeners = () => {
    document.removeEventListener('click', handleClick);
    // Note: In a real implementation, we'd store and remove all listeners
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    let elementInfo = 'unknown';
    
    if (target.tagName === 'BUTTON') {
      elementInfo = target.textContent?.trim() || 'button';
    } else if (target.tagName === 'A') {
      elementInfo = (target as HTMLAnchorElement).href;
    } else {
      elementInfo = target.className || target.tagName.toLowerCase();
    }

    trackAction('click', { element: elementInfo });
  };

  const trackAction = async (actionType: string, data?: any) => {
    try {
      await BehavioralIntelligenceService.trackUserBehavior({
        actionType,
        pagePath: window.location.pathname,
        actionData: data
      });

      // Update local state
      setRecentActions(prev => [
        {
          type: actionType,
          data,
          timestamp: new Date(),
          score: BehavioralIntelligenceService.calculateEngagementScore(actionType)
        },
        ...prev.slice(0, 9) // Keep last 10 actions
      ]);

      setSessionData(prev => ({
        ...prev,
        totalActions: prev.totalActions + 1
      }));

    } catch (error) {
      console.error('Failed to track action:', error);
    }
  };

  const updateSessionMetrics = () => {
    // Simulate real-time metrics calculation
    setSessionData(prev => {
      const engagementScore = Math.min(prev.totalActions * 5, 100);
      const conversionIntentScore = Math.min(
        (recentActions.filter(a => 
          ['form_interaction', 'download', 'document_upload'].includes(a.type)
        ).length * 20), 100
      );

      return {
        ...prev,
        engagementScore,
        conversionIntentScore,
        pagesViewed: Math.max(1, Math.floor(prev.totalActions / 3))
      };
    });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="w-3 h-3" />;
      case 'click':
        return <MousePointer className="w-3 h-3" />;
      case 'scroll':
        return <Activity className="w-3 h-3" />;
      case 'form_interaction':
        return <Target className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'Visualizzazione Pagina';
      case 'click':
        return 'Click';
      case 'scroll':
        return 'Scroll';
      case 'form_interaction':
        return 'Interazione Form';
      case 'document_upload':
        return 'Upload Documento';
      default:
        return type.replace('_', ' ').toUpperCase();
    }
  };

  const getIntentLevel = (score: number) => {
    if (score >= 80) return { label: 'Molto Alto', color: 'text-red-600 bg-red-100' };
    if (score >= 60) return { label: 'Alto', color: 'text-orange-600 bg-orange-100' };
    if (score >= 40) return { label: 'Medio', color: 'text-yellow-600 bg-yellow-100' };
    if (score >= 20) return { label: 'Basso', color: 'text-blue-600 bg-blue-100' };
    return { label: 'Minimo', color: 'text-gray-600 bg-gray-100' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const intentLevel = getIntentLevel(sessionData.conversionIntentScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Behavioral Intelligence Dashboard
          </CardTitle>
          <CardDescription className="text-white/90">
            Monitoraggio real-time del comportamento utente con AI predittiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionData.totalActions}</div>
              <div className="text-sm text-white/80">Azioni Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(sessionData.timeOnSite)}</div>
              <div className="text-sm text-white/80">Tempo Sessione</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionData.pagesViewed}</div>
              <div className="text-sm text-white/80">Pagine Viste</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionData.engagementScore}</div>
              <div className="text-sm text-white/80">Score Engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Metriche di Engagement
            </CardTitle>
            <CardDescription>
              Analisi comportamentale in tempo reale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Engagement Score</span>
                <span className="text-sm text-muted-foreground">{sessionData.engagementScore}/100</span>
              </div>
              <Progress value={sessionData.engagementScore} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conversion Intent</span>
                <Badge className={`text-xs ${intentLevel.color}`}>
                  {intentLevel.label}
                </Badge>
              </div>
              <Progress value={sessionData.conversionIntentScore} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Session ID</div>
                  <div className="font-mono text-xs">{sessionData.sessionId.slice(0, 8)}...</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status Tracking</div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isTracking ? 'Attivo' : 'Inattivo'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Azioni Recenti
            </CardTitle>
            <CardDescription>
              Stream real-time delle interazioni utente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {recentActions.length > 0 ? (
                <div className="space-y-2">
                  {recentActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-accent/30 rounded-lg"
                    >
                      <div className="p-1 bg-primary/10 rounded">
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {getActionLabel(action.type)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {action.data ? JSON.stringify(action.data) : 'Nessun dato aggiuntivo'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {action.timestamp.toLocaleTimeString()}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{action.score}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-center">
                  <div className="space-y-2">
                    <Activity className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div className="text-sm text-muted-foreground">
                      In attesa di azioni utente...
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Behavioral Insights
          </CardTitle>
          <CardDescription>
            Analisi predittiva del comportamento utente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Tipologia Utente</span>
              </div>
              <div className="text-sm text-blue-700">
                {sessionData.conversionIntentScore > 60 ? 'High-Intent User' :
                 sessionData.engagementScore > 50 ? 'Engaged Explorer' : 'Casual Visitor'}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Prossima Azione Prevista</span>
              </div>
              <div className="text-sm text-green-700">
                {sessionData.conversionIntentScore > 70 ? 'Probabile conversione' :
                 sessionData.engagementScore > 40 ? 'Esplorazione contenuti' : 'Navigazione continuata'}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Raccomandazione AI</span>
              </div>
              <div className="text-sm text-purple-700">
                {sessionData.conversionIntentScore > 60 ? 'Mostra CTA personalizzata' :
                 sessionData.engagementScore > 30 ? 'Offri contenuto rilevante' : 'Migliora engagement'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BehaviorTracker;