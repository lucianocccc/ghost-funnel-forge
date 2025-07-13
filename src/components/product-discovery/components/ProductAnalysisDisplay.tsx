
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Star, 
  ArrowRight,
  Brain,
  Award,
  AlertCircle
} from 'lucide-react';

interface ProductAnalysisDisplayProps {
  analysis: any;
  onProceed: () => void;
  isProcessing?: boolean;
}

const ProductAnalysisDisplay: React.FC<ProductAnalysisDisplayProps> = ({
  analysis,
  onProceed,
  isProcessing
}) => {
  if (!analysis) return null;

  const {
    productSummary,
    targetAudience,
    marketOpportunity,
    competitiveAdvantage,
    conversionStrategy,
    riskFactors,
    recommendations
  } = analysis;

  return (
    <div className="space-y-6">
      {/* Main Analysis Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-blue-600" />
            Analisi AI del Prodotto
          </CardTitle>
          <p className="text-muted-foreground">
            Ho analizzato il tuo prodotto e identificato le strategie ottimali per la conversione
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((marketOpportunity?.score || 0.85) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Market Opportunity</div>
              <Progress value={(marketOpportunity?.score || 0.85) * 100} className="mt-2 h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((conversionStrategy?.potential || 0.78) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Potential</div>
              <Progress value={(conversionStrategy?.potential || 0.78) * 100} className="mt-2 h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {competitiveAdvantage?.score ? Math.round(competitiveAdvantage.score * 100) : 92}%
              </div>
              <div className="text-sm text-muted-foreground">Competitive Edge</div>
              <Progress value={competitiveAdvantage?.score ? competitiveAdvantage.score * 100 : 92} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Prodotto Identificato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">{productSummary?.name || 'Il tuo prodotto'}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {productSummary?.description || 'Prodotto innovativo con alto potenziale di mercato'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(productSummary?.keyFeatures || ['Innovativo', 'Efficace', 'Scalabile']).map((feature: string, index: number) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm font-medium">Categoria:</div>
                <div className="text-sm text-muted-foreground">
                  {productSummary?.category || 'Business Solution'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Segmento Primario</h4>
                <p className="text-sm text-muted-foreground">
                  {targetAudience?.primary?.description || 'Professionisti e imprenditori orientati all\'innovazione'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Età:</span> {targetAudience?.primary?.age || '25-45 anni'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Settore:</span> {targetAudience?.primary?.industry || 'Business/Tech'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Pain Points:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(targetAudience?.primary?.painPoints || ['Efficienza', 'Crescita', 'Competitività']).map((pain: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">{pain}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Opportunity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Opportunità di Mercato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dimensione Mercato</span>
                <Badge variant="default">{marketOpportunity?.size || 'Alto Potenziale'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend di Crescita</span>
                <Badge variant="default" className="bg-green-500">
                  {marketOpportunity?.growth || '+15% annuo'}
                </Badge>
              </div>
              
              <div className="pt-2 border-t">
                <h4 className="font-semibold text-sm mb-2">Fattori di Successo:</h4>
                <ul className="text-sm space-y-1">
                  {(marketOpportunity?.successFactors || [
                    'Timing di mercato ottimale',
                    'Soluzione a problema reale',
                    'Scalabilità elevata'
                  ]).map((factor: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Strategia di Conversione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Approccio Consigliato:</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {conversionStrategy?.approach || 'Funnel educativo con focus sui benefici e social proof'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Punti Chiave:</h4>
                {(conversionStrategy?.keyPoints || [
                  'Hero section con proposta di valore chiara',
                  'Benefici specifici e misurabili',
                  'Social proof e testimonial',
                  'Call-to-action ottimizzata'
                ]).map((point: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Target className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Fattori di Attenzione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskFactors.map((risk: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-orange-700">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Award className="w-5 h-5" />
            Raccomandazioni AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(recommendations || [
              'Utilizza un approccio cinematico per coinvolgere emotivamente',
              'Enfatizza i benefici specifici e misurabili',
              'Includi testimonial e case study rilevanti',
              'Ottimizza per mobile-first experience'
            ]).map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-green-700">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={onProceed}
          disabled={isProcessing}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generando Funnel...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Genera Funnel Cinematico
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductAnalysisDisplay;
