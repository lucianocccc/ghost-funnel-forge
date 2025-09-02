import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Target, Zap, Globe, FileText, Eye } from 'lucide-react';
import FunnelHTMLPreview from './FunnelHTMLPreview';

interface SmartFunnelResultsProps {
  generatedExperience: any;
  analysisResults: any;
  metadata: any;
}

const SmartFunnelResults: React.FC<SmartFunnelResultsProps> = ({
  generatedExperience,
  analysisResults,
  metadata
}) => {
  // Handle both old and new data structures
  const funnelData = generatedExperience?.funnel || generatedExperience;
  const hasHtmlContent = !!funnelData?.html_content;
  const smartMetadata = generatedExperience?.smart_generation_metadata || metadata;

  if (!funnelData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Nessun funnel generato disponibile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {funnelData.business_name || 'Funnel Generato'}
              </CardTitle>
              <CardDescription>
                {funnelData.business_type} - Sistema Dual-AI
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                <Target className="h-3 w-3 mr-1" />
                Smart Funnel
              </Badge>
              {hasHtmlContent && (
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  HTML Ready
                </Badge>
              )}
              {smartMetadata?.conversion_optimized && (
                <Badge variant="default">
                  <Zap className="h-3 w-3 mr-1" />
                  Neuro-Copy
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {smartMetadata?.questions_asked || 0}
              </div>
              <div className="text-sm text-muted-foreground">Domande Analizzate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round((smartMetadata?.confidence_score || 0) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Confidence Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {funnelData.funnel_structure?.funnel_structure?.sections?.length || 
                 funnelData.metadata?.structure?.sectionsCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Sezioni Generate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTML Preview (if available) */}
      {hasHtmlContent && (
        <FunnelHTMLPreview 
          htmlContent={funnelData.html_content}
          funnelData={funnelData}
          metadata={funnelData.metadata}
        />
      )}

      {/* Funnel Structure Analysis */}
      {funnelData.funnel_structure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Struttura del Funnel
            </CardTitle>
            <CardDescription>
              Analisi e architettura del funnel generato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Business Analysis */}
              {funnelData.funnel_structure.business_analysis && (
                <div>
                  <h4 className="font-semibold mb-2">Analisi Business</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Settore:</span> {funnelData.funnel_structure.business_analysis.industry}
                    </div>
                    <div>
                      <span className="font-medium">Target:</span> {funnelData.funnel_structure.business_analysis.target_audience}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Value Proposition:</span> {funnelData.funnel_structure.business_analysis.value_proposition}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Sections Overview */}
              {funnelData.funnel_structure.funnel_structure?.sections && (
                <div>
                  <h4 className="font-semibold mb-3">Sezioni del Funnel</h4>
                  <div className="space-y-3">
                    {funnelData.funnel_structure.funnel_structure.sections.map((section: any, index: number) => (
                      <div key={section.id || index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {section.priority || index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{section.type.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">{section.conversion_goal}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {section.psychological_triggers?.map((trigger: string) => (
                              <Badge key={trigger} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neuro-Copy Enhancements */}
      {funnelData.neuro_copy_enhanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Neuro-Copywriting
            </CardTitle>
            <CardDescription>
              Elementi psicologici e di conversione integrati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.neuro_copy_enhanced.hero && (
                <div>
                  <h4 className="font-semibold mb-2">Hero Section</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {funnelData.neuro_copy_enhanced.hero.title}
                    </div>
                    <div>
                      <span className="font-medium">Subtitle:</span> {funnelData.neuro_copy_enhanced.hero.subtitle}
                    </div>
                    <div>
                      <span className="font-medium">CTA:</span> {funnelData.neuro_copy_enhanced.hero.cta}
                    </div>
                  </div>
                </div>
              )}

              {funnelData.neuro_copy_enhanced.conversion && (
                <div>
                  <h4 className="font-semibold mb-2">Conversion Elements</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Urgency:</span> {funnelData.neuro_copy_enhanced.conversion.urgency}
                    </div>
                    <div>
                      <span className="font-medium">Garanzia:</span> {funnelData.neuro_copy_enhanced.conversion.guarantee}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Metadata */}
      {smartMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Dettagli Generazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo:</span> {smartMetadata.generation_type?.replace('_', ' ') || 'Smart Funnel'}
              </div>
              <div>
                <span className="font-medium">Buyer Persona:</span> {smartMetadata.buyer_persona?.replace('_', ' ') || 'Professional'}
              </div>
              <div>
                <span className="font-medium">Conversione Ottimizzata:</span> {smartMetadata.conversion_optimized ? 'Sì' : 'No'}
              </div>
              <div>
                <span className="font-medium">HTML Disponibile:</span> {smartMetadata.html_available ? 'Sì' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartFunnelResults;