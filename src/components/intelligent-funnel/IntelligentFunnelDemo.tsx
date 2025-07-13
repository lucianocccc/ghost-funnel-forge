// Ghost Funnel Revolution - Intelligent Funnel Demo

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IntelligentFunnelEngine } from './IntelligentFunnelEngine';
import QuickFunnelGenerator from '@/components/ai-funnel/QuickFunnelGenerator';
import { useBehavioralIntelligence } from '@/hooks/useBehavioralIntelligence';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp,
  Users,
  RefreshCw,
  Play,
  BarChart3
} from 'lucide-react';

export const IntelligentFunnelDemo: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'creator' | 'intelligence'>('creator');

  const {
    engagementScore,
    conversionIntent,
    behaviorPattern,
    getRecommendedNextAction
  } = useBehavioralIntelligence({ 
    trackingEnabled: true, 
    funnelId: 'demo-funnel'
  });

  const handleDemoStart = () => {
    setIsRunning(true);
    setDemoResults(null);
  };

  const handleConversion = (data: any) => {
    setDemoResults({
      type: 'conversion',
      data,
      message: '🎉 Conversione ad Alto Valore! L\'AI ha identificato un utente pronto all\'acquisto.'
    });
    setIsRunning(false);
    
    toast({
      title: "🚀 Conversione Riuscita!",
      description: "L'AI ha guidato l'utente verso una conversione ad alto valore.",
    });
  };

  const handleLeadCapture = (data: any) => {
    setDemoResults({
      type: 'lead',
      data,
      message: '📧 Lead Catturato per Marketing! L\'AI ha diretto l\'utente verso la nurturing sequence.'
    });
    setIsRunning(false);
    
    toast({
      title: "✅ Lead Acquisito!",
      description: "L'AI ha catturato un lead qualificato per il marketing automation.",
    });
  };

  const recommendation = getRecommendedNextAction();

  if (isRunning) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🧠 Intelligent Funnel in Azione</h1>
          <p className="text-muted-foreground">
            Osserva come l'AI adatta il funnel in tempo reale basandosi sul comportamento dell'utente
          </p>
        </div>

        <IntelligentFunnelEngine
          funnelId="demo-funnel"
          funnelData={{}}
          onConversion={handleConversion}
          onLeadCapture={handleLeadCapture}
        />

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setIsRunning(false)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Torna alla Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🚀 Ghost Funnel Revolution
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          La prima piattaforma al mondo con <strong>Intelligenza Comportamentale AI</strong> che genera 
          automaticamente funnel dinamici e landing page animate per qualsiasi prodotto.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'creator'
                ? 'bg-white shadow-sm text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎨 Creatore Dinamico
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'intelligence'
                ? 'bg-white shadow-sm text-purple-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧠 Intelligenza Comportamentale
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'creator' ? (
        <QuickFunnelGenerator />
      ) : (
        <div className="space-y-8">

      {/* Current Intelligence Status */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            Stato Intelligenza Comportamentale
          </CardTitle>
          <CardDescription>
            L'AI sta già analizzando il tuo comportamento su questa pagina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{engagementScore}</div>
              <div className="text-sm text-muted-foreground">Engagement Score</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(conversionIntent * 100)}%</div>
              <div className="text-sm text-muted-foreground">Conversion Intent</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Badge className="text-sm">{behaviorPattern.replace('_', ' ')}</Badge>
              <div className="text-sm text-muted-foreground mt-1">Behavior Pattern</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-lg font-semibold text-green-600">{recommendation.priority}</div>
              <div className="text-sm text-muted-foreground">Priority Level</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg">
            <div className="text-sm font-medium mb-2">Raccomandazione AI Attuale:</div>
            <div className="text-sm text-muted-foreground">{recommendation.message}</div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Results */}
      {demoResults && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Risultato Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg mb-4">{demoResults.message}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Tipo di Risultato:</div>
                <Badge variant={demoResults.type === 'conversion' ? 'default' : 'secondary'}>
                  {demoResults.type === 'conversion' ? 'High-Value Conversion' : 'Marketing Lead'}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Dati Catturati:</div>
                <div className="text-sm text-muted-foreground">
                  {Object.keys(demoResults.data).length} campi completati
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              AI Comportamentale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Tracking in tempo reale</li>
              <li>• Analisi intent utente</li>
              <li>• Pattern recognition</li>
              <li>• Predictive scoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Adattamento Dinamico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Funnel multi-path</li>
              <li>• Decision engine intelligente</li>
              <li>• Personalizzazione automatica</li>
              <li>• A/B testing continuo</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Risultati Ottimizzati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• +300% conversioni high-value</li>
              <li>• +150% lead qualified</li>
              <li>• -60% dispersione utenti</li>
              <li>• ROI automaticamente ottimizzato</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Prova l'Intelligenza Comportamentale in Azione
          </h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Testa il nostro caso d'uso <strong>CamperGo</strong>: l'AI determinerà automaticamente 
            se sei pronto per prenotare o se preferisci ricevere prima contenuti educativi.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleDemoStart}
              className="bg-white text-purple-600 hover:bg-purple-50 min-w-[200px]"
            >
              <Play className="w-5 h-5 mr-2" />
              Inizia Demo Interattiva
            </Button>
            
            <div className="text-sm text-purple-200">
              <Users className="w-4 h-4 inline mr-1" />
              Testato da 1000+ utenti
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 Come Funziona l'Intelligenza Comportamentale</CardTitle>
          <CardDescription>
            Il processo AI che trasforma ogni interazione in insights azionabili
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Tracking Comportamentale</h3>
              <p className="text-sm text-muted-foreground">
                Monitora scroll, click, tempo di permanenza, interazioni con form
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Analisi AI in Tempo Reale</h3>
              <p className="text-sm text-muted-foreground">
                Calcola engagement score e conversion intent istantaneamente
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Decision Engine</h3>
              <p className="text-sm text-muted-foreground">
                Decide automaticamente il path ottimale per ogni utente
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Adattamento Dinamico</h3>
              <p className="text-sm text-muted-foreground">
                Modifica il funnel in tempo reale per massimizzare le conversioni
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
};