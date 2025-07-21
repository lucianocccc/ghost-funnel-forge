
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntelligentFunnelGenerator } from '@/hooks/useIntelligentFunnelGenerator';
import { 
  Brain, 
  Globe, 
  TrendingUp, 
  Users, 
  Target, 
  Sparkles, 
  Database,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';

const IntelligentSystemStats: React.FC = () => {
  const { getSystemStats, clearAllCaches } = useIntelligentFunnelGenerator();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const systemStats = getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCaches = async () => {
    clearAllCaches();
    await loadStats();
  };

  const capabilities = [
    {
      icon: Brain,
      title: "Analisi Prodotto Avanzata",
      description: "Analizza profondamente il tuo prodotto per estrarre valore unico, vantaggi competitivi e opportunità",
      features: ["Proposition analysis", "Competitive advantages", "Market positioning", "Growth opportunities"]
    },
    {
      icon: Globe,
      title: "Ricerca Web Intelligente",
      description: "Ricerca automatica di informazioni aggiornate su mercato, competitor e trend del settore",
      features: ["Market trends", "Competitor analysis", "Customer insights", "Industry reports"]
    },
    {
      icon: Users,
      title: "Profilazione Audience",
      description: "Crea profili dettagliati del tuo pubblico target con pain points, motivazioni e comportamenti",
      features: ["Buyer personas", "Pain points", "Purchase drivers", "Behavioral patterns"]
    },
    {
      icon: Target,
      title: "Personalizzazione Massima",
      description: "Genera esperienze 100% personalizzate con contenuti, messaggi e flow unici per ogni prodotto",
      features: ["Custom narratives", "Personalized content", "Unique angles", "Emotional triggers"]
    },
    {
      icon: TrendingUp,
      title: "Ottimizzazione Conversione",
      description: "Integra strategie avanzate di conversione basate su psicologia comportamentale e best practices",
      features: ["Conversion triggers", "Behavioral psychology", "A/B testing", "Performance optimization"]
    },
    {
      icon: Sparkles,
      title: "Creatività Avanzata",
      description: "Combina analisi data-driven con creatività per generare esperienze memorabili e uniche",
      features: ["Creative storytelling", "Visual elements", "Interactive design", "Memorable experiences"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold">Sistema Intelligente di Nuova Generazione</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Un sistema completamente rinnovato che combina analisi avanzata del prodotto, ricerca web intelligente 
          e personalizzazione massima per creare esperienze uniche al 100%
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((capability, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <capability.icon className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{capability.title}</CardTitle>
              </div>
              <CardDescription>{capability.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {capability.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Statistiche Sistema
            </CardTitle>
            <CardDescription>
              Monitoraggio performance e utilizzo del sistema intelligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.productIntelligence?.size || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Analisi Prodotto in Cache
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.webResearch?.size || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Ricerche Web Cached
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.personalization?.size || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Personalizzazioni Attive
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleClearCaches} variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Pulisci Cache Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Differenze Principali</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <h4 className="font-semibold text-destructive">❌ Sistema Precedente</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Funnels generici e simili</li>
                  <li>• Nessuna ricerca di mercato</li>
                  <li>• Personalizzazione limitata</li>
                  <li>• Contenuti ripetitivi</li>
                  <li>• Analisi superficiale</li>
                  <li>• Strategia one-size-fits-all</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">✅ Sistema Nuovo</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Esperienze 100% personalizzate</li>
                  <li>• Ricerca web automatica</li>
                  <li>• Analisi prodotto avanzata</li>
                  <li>• Contenuti unici e creativi</li>
                  <li>• Intelligenza comportamentale</li>
                  <li>• Ottimizzazione conversione</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentSystemStats;
