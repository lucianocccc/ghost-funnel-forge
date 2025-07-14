
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import IntelligentProductDiscovery from './IntelligentProductDiscovery';
import CinematicFunnelPreview from './components/CinematicFunnelPreview';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  TrendingUp, 
  Eye,
  BarChart3,
  Rocket,
  CheckCircle,
  Star,
  ArrowRight,
  Lightbulb,
  Users
} from 'lucide-react';

interface ProductDiscoveryEngineProps {
  onFunnelGenerated?: (funnelData: any) => void;
}

const ProductDiscoveryEngine: React.FC<ProductDiscoveryEngineProps> = ({ onFunnelGenerated }) => {
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'discovery' | 'analysis' | 'preview'>('intro');
  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartDiscovery = () => {
    setCurrentPhase('discovery');
    toast({
      title: "🚀 Iniziamo la Discovery!",
      description: "L'AI ti guiderà attraverso domande intelligenti per creare il funnel perfetto",
    });
  };

  const handleDiscoveryComplete = async (data: any) => {
    setIsProcessing(true);
    setDiscoveryData(data);
    
    try {
      // Simula elaborazione avanzata
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentPhase('preview');
      onFunnelGenerated?.(data.funnel);
      
      toast({
        title: "🎬 Funnel Cinematico Creato!",
        description: "Il tuo funnel personalizzato è pronto per conquistare il mercato",
      });
    } catch (error) {
      console.error('Errore:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione del funnel. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDiscovery = () => {
    setCurrentPhase('intro');
    setDiscoveryData(null);
  };

  if (currentPhase === 'discovery') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetDiscovery}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            ← Torna all'Inizio
          </Button>
          
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Brain className="w-4 h-4 mr-2" />
            AI Discovery in Corso
          </Badge>
        </div>
        
        <IntelligentProductDiscovery onComplete={handleDiscoveryComplete} />
      </div>
    );
  }

  if (currentPhase === 'preview' && discoveryData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetDiscovery}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            ← Nuova Discovery
          </Button>
          
          <div className="flex gap-2">
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completato
            </Badge>
            <Badge className="bg-blue-500 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Funnel Pronto
            </Badge>
          </div>
        </div>
        
        <CinematicFunnelPreview 
          funnel={discoveryData.funnel}
          analysis={discoveryData.analysis}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
          <Brain className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Product Discovery Engine
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          L'intelligenza artificiale più avanzata per scoprire il tuo prodotto e creare 
          <span className="font-semibold text-purple-600"> funnel cinematici personalizzati</span> 
          che convertono davvero
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: Zap, label: "Analisi AI Avanzata", color: "bg-yellow-100 text-yellow-700" },
            { icon: Target, label: "Targeting Intelligente", color: "bg-blue-100 text-blue-700" },
            { icon: Sparkles, label: "Personalizzazione Totale", color: "bg-purple-100 text-purple-700" },
            { icon: TrendingUp, label: "Ottimizzazione Conversioni", color: "bg-green-100 text-green-700" }
          ].map((item, index) => (
            <Badge key={index} className={`${item.color} px-3 py-1`}>
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Analisi Intelligente</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              L'AI analizza il tuo prodotto, identifica il target perfetto e studia il mercato
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Market Intelligence
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Competitor Analysis
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Audience Insights
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Personalizzazione Avanzata</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Ogni elemento del funnel è personalizzato per il tuo prodotto specifico
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Copy Personalizzato
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Visual Adaptativi
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Form Intelligenti
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Risultati Garantiti</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Funnel ottimizzati per massimizzare conversioni e ROI
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                +300% Conversioni
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Lead Quality Score
              </div>
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Analytics Avanzate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Steps */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-orange-800">
            <Lightbulb className="w-6 h-6 inline mr-2" />
            Come Funziona il Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Discovery Intelligente",
                description: "L'AI ti fa domande specifiche sul tuo prodotto",
                icon: Brain,
                color: "bg-purple-500"
              },
              {
                step: 2,
                title: "Analisi Approfondita",
                description: "Analisi completa di mercato, competitor e target",
                icon: BarChart3,
                color: "bg-blue-500"
              },
              {
                step: 3,
                title: "Generazione Funnel",
                description: "Creazione del funnel cinematico personalizzato",
                icon: Sparkles,
                color: "bg-pink-500"
              },
              {
                step: 4,
                title: "Ottimizzazione",
                description: "Perfezionamento per massime conversioni",
                icon: Zap,
                color: "bg-green-500"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {step.step}. {step.title}
                </div>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
                {index < 3 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">
              Pronto per il Tuo Funnel Cinematico Personalizzato?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Bastano 5 minuti per avere un funnel che converte 10x di più
            </p>
            
            <Button
              onClick={handleStartDiscovery}
              disabled={isProcessing}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                  Elaborazione...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Inizia Discovery AI
                </>
              )}
            </Button>
            
            <div className="mt-4 text-sm opacity-75">
              ✅ Gratis • ✅ 5 minuti • ✅ Risultati garantiti
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { number: "10,000+", label: "Funnel Generati", icon: Rocket },
          { number: "300%", label: "Aumento Conversioni", icon: TrendingUp },
          { number: "95%", label: "Soddisfazione Cliente", icon: Star },
          { number: "24/7", label: "Supporto AI", icon: Zap }
        ].map((stat, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDiscoveryEngine;
