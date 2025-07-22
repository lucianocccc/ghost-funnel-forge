
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Target, TrendingUp, Users, Lightbulb, Shield, Zap, BarChart3 } from 'lucide-react';
import { EmpathicAnalysis, AdvancedTargetAudience, AdvancedStrategy, PersonalizationData } from '@/types/interactiveFunnel';

interface SmartFunnelAnalysisProps {
  empathicAnalysis?: EmpathicAnalysis;
  targetAudience?: AdvancedTargetAudience;
  strategy?: AdvancedStrategy;
  personalizationData?: PersonalizationData;
  estimatedConversionRate?: string;
  roiProjection?: string;
  personalizationLevel?: string;
}

export const SmartFunnelAnalysis: React.FC<SmartFunnelAnalysisProps> = ({
  empathicAnalysis,
  targetAudience,
  strategy,
  personalizationData,
  estimatedConversionRate,
  roiProjection,
  personalizationLevel
}) => {
  return (
    <div className="space-y-6">
      {/* Header con metriche principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{estimatedConversionRate || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Conversione Stimata</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{roiProjection || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">ROI Proiettato</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-purple-500" />
              <div>
                <Badge variant={personalizationLevel === 'advanced' ? 'default' : 'secondary'}>
                  {personalizationLevel || 'Basic'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Personalizzazione</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analisi Empatica */}
      {empathicAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analisi Empatica AI
            </CardTitle>
            <CardDescription>
              Insights profondi sul tuo business e mercato di riferimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {empathicAnalysis.business_model_insights && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Insights Business Model
                </h4>
                <div className="space-y-1">
                  {empathicAnalysis.business_model_insights.map((insight, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {insight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {empathicAnalysis.market_opportunities && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Opportunità di Mercato
                </h4>
                <div className="space-y-1">
                  {empathicAnalysis.market_opportunities.map((opportunity, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {opportunity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {empathicAnalysis.psychological_triggers && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Trigger Psicologici
                </h4>
                <div className="space-y-1">
                  {empathicAnalysis.psychological_triggers.map((trigger, index) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {empathicAnalysis.competitive_advantages && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Vantaggi Competitivi
                </h4>
                <div className="space-y-1">
                  {empathicAnalysis.competitive_advantages.map((advantage, index) => (
                    <Badge key={index} variant="default" className="mr-2 mb-2">
                      {advantage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {empathicAnalysis.growth_potential && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Potenziale di Crescita:</span>
                <Badge 
                  variant={
                    empathicAnalysis.growth_potential === 'alto' ? 'default' :
                    empathicAnalysis.growth_potential === 'medio' ? 'secondary' : 'outline'
                  }
                >
                  {empathicAnalysis.growth_potential}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Target Audience Avanzata */}
      {targetAudience && typeof targetAudience === 'object' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Analisi Target Avanzata
            </CardTitle>
            <CardDescription>
              Profilo psicografico e comportamentale del tuo cliente ideale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Target Primario</h4>
                <p className="text-sm text-muted-foreground">{targetAudience.primary}</p>
              </div>
              
              {targetAudience.demographics && (
                <div>
                  <h4 className="font-medium mb-2">Demografia</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {targetAudience.demographics.age_range && <p>Età: {targetAudience.demographics.age_range}</p>}
                    {targetAudience.demographics.gender && <p>Genere: {targetAudience.demographics.gender}</p>}
                    {targetAudience.demographics.income_level && <p>Reddito: {targetAudience.demographics.income_level}</p>}
                    {targetAudience.demographics.education && <p>Educazione: {targetAudience.demographics.education}</p>}
                    {targetAudience.demographics.occupation && <p>Occupazione: {targetAudience.demographics.occupation}</p>}
                  </div>
                </div>
              )}
            </div>

            {targetAudience.pain_points && (
              <div>
                <h4 className="font-medium mb-2">Pain Points Identificati</h4>
                <div className="space-y-1">
                  {targetAudience.pain_points.map((pain, index) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {pain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {targetAudience.desires && (
              <div>
                <h4 className="font-medium mb-2">Desideri e Aspirazioni</h4>
                <div className="space-y-1">
                  {targetAudience.desires.map((desire, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {desire}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {targetAudience.objections && (
              <div>
                <h4 className="font-medium mb-2">Obiezioni Comuni</h4>
                <div className="space-y-1">
                  {targetAudience.objections.map((objection, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {objection}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategia Avanzata */}
      {strategy && typeof strategy === 'object' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategia di Implementazione
            </CardTitle>
            <CardDescription>
              Roadmap dettagliata per massimizzare i risultati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategy.implementation_approach && (
              <div>
                <h4 className="font-medium mb-2">Approccio Implementazione</h4>
                <p className="text-sm text-muted-foreground">{strategy.implementation_approach}</p>
              </div>
            )}

            {strategy.traffic_sources && (
              <div>
                <h4 className="font-medium mb-2">Fonti di Traffico Consigliate</h4>
                <div className="space-y-1">
                  {strategy.traffic_sources.map((source, index) => (
                    <Badge key={index} variant="default" className="mr-2 mb-2">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {strategy.kpi_tracking && (
              <div>
                <h4 className="font-medium mb-2">KPI da Monitorare</h4>
                <div className="space-y-1">
                  {strategy.kpi_tracking.map((kpi, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {kpi}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {strategy.ab_testing_priorities && (
              <div>
                <h4 className="font-medium mb-2">Test A/B Prioritari</h4>
                <div className="space-y-1">
                  {strategy.ab_testing_priorities.map((test, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {strategy.scaling_roadmap && (
              <div>
                <h4 className="font-medium mb-2">Roadmap di Scaling</h4>
                <p className="text-sm text-muted-foreground">{strategy.scaling_roadmap}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personalizzazione */}
      {personalizationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Motore di Personalizzazione
            </CardTitle>
            <CardDescription>
              Elementi dinamici e adattivi del funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {personalizationData.dynamic_content_rules && (
              <div>
                <h4 className="font-medium mb-2">Aree di Contenuto Dinamico</h4>
                <div className="space-y-1">
                  {personalizationData.dynamic_content_rules.map((area, index) => (
                    <Badge key={index} variant="default" className="mr-2 mb-2">
                      {typeof area === 'string' ? area : 'Dynamic Content Rule'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {personalizationData.behavioral_triggers && (
              <div>
                <h4 className="font-medium mb-2">Trigger Comportamentali</h4>
                <div className="space-y-1">
                  {personalizationData.behavioral_triggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {personalizationData.segmentation_logic && (
              <div>
                <h4 className="font-medium mb-2">Logica di Segmentazione</h4>
                <p className="text-sm text-muted-foreground">{personalizationData.segmentation_logic}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
