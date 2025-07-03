
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  User,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Zap,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import {
  fetchEnhancedAnalysis,
  fetchAdvancedScoring,
  fetchPredictiveAnalytics,
  analyzeLeadWithEnhancedAI
} from '@/services/enhancedLeadAnalysisService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedLeadAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

const EnhancedLeadAnalysisModal: React.FC<EnhancedLeadAnalysisModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName
}) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<any>(null);
  const [advancedScoring, setAdvancedScoring] = useState<any>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && leadId) {
      loadAnalysisData();
    }
  }, [isOpen, leadId]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      const [enhanced, scoring, predictive] = await Promise.all([
        fetchEnhancedAnalysis(leadId),
        fetchAdvancedScoring(leadId),
        fetchPredictiveAnalytics(leadId)
      ]);

      setEnhancedAnalysis(enhanced);
      setAdvancedScoring(scoring);
      setPredictiveAnalytics(predictive);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeLeadWithEnhancedAI(leadId);
      toast({
        title: "Analisi Completata",
        description: "L'analisi avanzata del lead è stata completata con successo.",
      });
      await loadAnalysisData();
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'analisi del lead.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTemperatureText = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'Caldo';
      case 'warm': return 'Tiepido';
      case 'cold': return 'Freddo';
      default: return 'Non definito';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Analisi Avanzata Lead: {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!enhancedAnalysis ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analisi Non Disponibile
                </h3>
                <p className="text-gray-500 mb-4">
                  Questo lead non è ancora stato analizzato con il sistema avanzato.
                </p>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analizzando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Avvia Analisi Avanzata
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Panoramica</TabsTrigger>
                <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                <TabsTrigger value="strategy">Strategia</TabsTrigger>
                <TabsTrigger value="predictions">Predizioni</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Temperatura Lead</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getTemperatureColor(enhancedAnalysis?.lead_temperature)}`}></div>
                        <span className="font-semibold">{getTemperatureText(enhancedAnalysis?.lead_temperature)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Score Coinvolgimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Progress value={enhancedAnalysis?.engagement_score || 0} className="flex-1" />
                        <span className="font-semibold">{enhancedAnalysis?.engagement_score || 0}/100</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Probabilità Conversione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Progress value={(enhancedAnalysis?.conversion_probability || 0) * 100} className="flex-1" />
                        <span className="font-semibold">
                          {Math.round((enhancedAnalysis?.conversion_probability || 0) * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {advancedScoring && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Punteggio Avanzato
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{advancedScoring.demographic_score}</div>
                          <div className="text-sm text-gray-500">Demografico</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{advancedScoring.behavioral_score}</div>
                          <div className="text-sm text-gray-500">Comportamentale</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{advancedScoring.engagement_score}</div>
                          <div className="text-sm text-gray-500">Coinvolgimento</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{advancedScoring.timing_score}</div>
                          <div className="text-sm text-gray-500">Timing</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{advancedScoring.total_score}</div>
                          <div className="text-sm text-gray-500">Totale</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                {enhancedAnalysis?.behavioral_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Analisi Comportamentale
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Livello di Coinvolgimento</h4>
                        <Badge variant="outline" className="capitalize">
                          {enhancedAnalysis.behavioral_analysis.engagement_level}
                        </Badge>
                      </div>
                      
                      {enhancedAnalysis.behavioral_analysis.interaction_patterns?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Pattern di Interazione</h4>
                          <div className="flex flex-wrap gap-2">
                            {enhancedAnalysis.behavioral_analysis.interaction_patterns.map((pattern: string, index: number) => (
                              <Badge key={index} variant="secondary">{pattern}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {enhancedAnalysis?.engagement_patterns && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Pattern di Coinvolgimento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhancedAnalysis.engagement_patterns.preferred_contact_times?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Orari Preferiti per il Contatto</h4>
                          <div className="flex flex-wrap gap-2">
                            {enhancedAnalysis.engagement_patterns.preferred_contact_times.map((time: string, index: number) => (
                              <Badge key={index} variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {enhancedAnalysis.engagement_patterns.communication_style && (
                        <div>
                          <h4 className="font-medium mb-2">Stile di Comunicazione</h4>
                          <Badge variant="secondary" className="capitalize">
                            {enhancedAnalysis.engagement_patterns.communication_style}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                {enhancedAnalysis?.personalized_strategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Strategia Personalizzata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhancedAnalysis.personalized_strategy.recommended_approach && (
                        <div>
                          <h4 className="font-medium mb-2">Approccio Raccomandato</h4>
                          <p className="text-gray-700">{enhancedAnalysis.personalized_strategy.recommended_approach}</p>
                        </div>
                      )}

                      {enhancedAnalysis.personalized_strategy.priority_pain_points?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Punti Dolore Prioritari</h4>
                          <div className="space-y-2">
                            {enhancedAnalysis.personalized_strategy.priority_pain_points.map((point: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {enhancedAnalysis.personalized_strategy.next_actions?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Prossime Azioni</h4>
                          <div className="space-y-2">
                            {enhancedAnalysis.personalized_strategy.next_actions.map((action: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {enhancedAnalysis?.optimal_contact_timing && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Timing Ottimale per il Contatto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhancedAnalysis.optimal_contact_timing.best_days?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Giorni Migliori</h4>
                          <div className="flex flex-wrap gap-2">
                            {enhancedAnalysis.optimal_contact_timing.best_days.map((day: string, index: number) => (
                              <Badge key={index} variant="outline">{day}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {enhancedAnalysis.optimal_contact_timing.channel_preferences?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Canali Preferiti</h4>
                          <div className="flex flex-wrap gap-2">
                            {enhancedAnalysis.optimal_contact_timing.channel_preferences.map((channel: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                                {channel === 'phone' && <Phone className="w-3 h-3 mr-1" />}
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                {predictiveAnalytics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Valore Vita Predetto</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            €{predictiveAnalytics.predicted_lifetime_value?.toFixed(2) || '0.00'}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Rischio Abbandono</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(predictiveAnalytics.churn_risk_score || 0) * 100} 
                              className="flex-1"
                            />
                            <span className="font-semibold text-red-600">
                              {Math.round((predictiveAnalytics.churn_risk_score || 0) * 100)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {predictiveAnalytics.predicted_actions?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            Azioni Predette
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {predictiveAnalytics.predicted_actions.map((action: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{action}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {enhancedAnalysis?.analyzed_at && (
                <>Ultima analisi: {new Date(enhancedAnalysis.analyzed_at).toLocaleString()}</>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleAnalyze} 
                disabled={analyzing}
                size="sm"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Rianalizzando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Rianalizza
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedLeadAnalysisModal;
