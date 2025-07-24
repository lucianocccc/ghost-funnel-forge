
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Wand2, Zap, Target, Lightbulb, Rocket, ArrowRight, Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { IntelligentFunnelWizard } from '@/components/intelligent-funnel/IntelligentFunnelWizard';
import AIFunnelCreator from '@/components/ai-funnel/AIFunnelCreator';
import ProductDiscoveryEngine from '@/components/product-discovery/ProductDiscoveryEngine';
import TypedFunnelGenerator from '@/components/funnel-types/TypedFunnelGenerator';

const UnifiedFunnelCreator: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [generatedFunnel, setGeneratedFunnel] = useState<any>(null);

  const handleFunnelGenerated = (funnel: any) => {
    setGeneratedFunnel(funnel);
    console.log('✅ Funnel created successfully:', funnel);
  };

  const handleBackToSelection = () => {
    setActiveMode(null);
    setGeneratedFunnel(null);
  };

  // If a specific mode is active, show that component
  if (activeMode === 'intelligent') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToSelection}>
            ← Torna alla Selezione
          </Button>
          <h2 className="text-2xl font-bold">Funnel Generation Intelligente</h2>
        </div>
        <IntelligentFunnelWizard 
          onFunnelGenerated={handleFunnelGenerated}
          onClose={handleBackToSelection}
        />
      </div>
    );
  }

  if (activeMode === 'ai-conversation') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToSelection}>
            ← Torna alla Selezione
          </Button>
          <h2 className="text-2xl font-bold">AI Funnel Creator</h2>
        </div>
        <AIFunnelCreator />
      </div>
    );
  }

  if (activeMode === 'product-discovery') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToSelection}>
            ← Torna alla Selezione
          </Button>
          <h2 className="text-2xl font-bold">Product Discovery Engine</h2>
        </div>
        <ProductDiscoveryEngine onFunnelGenerated={handleFunnelGenerated} />
      </div>
    );
  }

  if (activeMode === 'typed-templates') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToSelection}>
            ← Torna alla Selezione
          </Button>
          <h2 className="text-2xl font-bold">Template Funnel Specializzati</h2>
        </div>
        <TypedFunnelGenerator onFunnelGenerated={handleFunnelGenerated} />
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 py-8"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Rocket className="w-10 h-10 text-primary" />
          <Badge variant="secondary" className="px-3 py-1">
            UNIFIED CREATOR
          </Badge>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold">
          Crea il Tuo Funnel Perfetto
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scegli il metodo di creazione più adatto alle tue esigenze. 
          Dall'intelligenza artificiale avanzata ai template specializzati.
        </p>
      </motion.div>

      {/* Creation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intelligent Funnel */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  INTELLIGENTE
                </Badge>
              </div>
              <CardTitle className="text-xl">Generazione Intelligente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Il sistema più avanzato che analizza i tuoi obiettivi, studia la concorrenza 
                e genera funnel ultra-personalizzati con copy ottimizzato.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Analisi competitiva in tempo reale
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Target className="w-4 h-4 mr-2" />
                  Personalizzazione totale
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Copy psicologicamente ottimizzato
                </div>
              </div>

              <Button 
                onClick={() => setActiveMode('intelligent')}
                className="w-full mt-4"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Inizia Generazione Intelligente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Conversation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-all group h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Wand2 className="w-6 h-6 text-secondary" />
                </div>
                <Badge variant="outline" className="border-secondary text-secondary">
                  CONVERSAZIONALE
                </Badge>
              </div>
              <CardTitle className="text-xl">AI Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Chatta con l'AI per creare funnel in modo naturale. 
                Modalità rapida o conversazione guidata per ogni esigenza.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-blue-600">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Interfaccia conversazionale naturale
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Generazione rapida o dettagliata
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Template predefiniti disponibili
                </div>
              </div>

              <Button 
                onClick={() => setActiveMode('ai-conversation')}
                variant="secondary"
                className="w-full mt-4"
                size="lg"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Inizia Conversazione AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Discovery */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-2 hover:border-accent/50 transition-all group h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <Badge variant="outline" className="border-accent text-accent">
                  DISCOVERY
                </Badge>
              </div>
              <CardTitle className="text-xl">Product Discovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Scopri il potenziale del tuo prodotto attraverso un'analisi guidata 
                e crea funnel cinematici personalizzati.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-purple-600">
                  <Brain className="w-4 h-4 mr-2" />
                  Analisi approfondita del prodotto
                </div>
                <div className="flex items-center text-sm text-purple-600">
                  <Target className="w-4 h-4 mr-2" />
                  Market intelligence
                </div>
                <div className="flex items-center text-sm text-purple-600">
                  <Rocket className="w-4 h-4 mr-2" />
                  Funnel cinematici
                </div>
              </div>

              <Button 
                onClick={() => setActiveMode('product-discovery')}
                variant="outline"
                className="w-full mt-4 border-accent text-accent hover:bg-accent hover:text-white"
                size="lg"
              >
                <Target className="w-5 h-5 mr-2" />
                Inizia Product Discovery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Typed Templates */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  TEMPLATE
                </Badge>
              </div>
              <CardTitle className="text-xl">Template Specializzati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Scegli tra template preconfigurati per settori specifici: 
                lead generation, product demo, survey e molto altro.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Template per ogni settore
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurazione guidata
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Deployment immediato
                </div>
              </div>

              <Button 
                onClick={() => setActiveMode('typed-templates')}
                variant="outline"
                className="w-full mt-4"
                size="lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Esplora Template
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/30 rounded-2xl p-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Perché Scegliere GhostFunnel?</h3>
          <p className="text-muted-foreground">
            La piattaforma più avanzata per la creazione di funnel personalizzati
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: "10,000+", label: "Funnel Creati", icon: Rocket },
            { number: "95%", label: "Soddisfazione", icon: Target },
            { number: "300%", label: "Conversioni in Più", icon: Zap },
            { number: "24/7", label: "Supporto AI", icon: Brain }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-background rounded-lg">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedFunnelCreator;
