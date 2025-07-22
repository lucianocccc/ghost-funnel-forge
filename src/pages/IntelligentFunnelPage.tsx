
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IntelligentFunnelWizard } from '@/components/intelligent-funnel/IntelligentFunnelWizard';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Zap, TrendingUp, Target, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const IntelligentFunnelPage: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFunnelGenerated = (funnel: any) => {
    setGeneratedFunnel(funnel);
    setShowWizard(false);
    
    // Navigate to the generated funnel
    if (funnel.id) {
      navigate(`/funnel/${funnel.id}`);
    }
  };

  if (showWizard) {
    return (
      <IntelligentFunnelWizard 
        onFunnelGenerated={handleFunnelGenerated}
        onClose={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-12 h-12 text-primary" />
            <Badge variant="secondary" className="px-3 py-1">
              AI-POWERED
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Funnel Generation
            <br />
            <span className="text-foreground">Veramente Intelligente</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Il primo sistema che analizza i tuoi obiettivi specifici, studia la concorrenza in tempo reale, 
            e genera funnel personalizzati con copy ottimizzato per la conversione.
          </p>
          
          <div className="flex items-center justify-center space-x-4 pt-6">
            <Button 
              size="lg" 
              onClick={() => setShowWizard(true)}
              className="text-lg px-8 py-4 h-auto"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Genera Funnel Intelligente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
              <Lightbulb className="w-5 h-5 mr-2" />
              Vedi Demo
            </Button>
          </div>
        </motion.div>

        {/* Intelligence Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Analisi Obiettivi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI che comprende i tuoi obiettivi specifici e genera domande dinamiche per massimizzare i risultati
              </CardDescription>
            </CardContent>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">SMART</Badge>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Ricerca Competitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analisi in tempo reale della concorrenza e identificazione di opportunità di mercato uniche
              </CardDescription>
            </CardContent>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">LIVE</Badge>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-accent/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Copy Personalizzato</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generazione di copy ottimizzato per il tuo target specifico con trigger psicologici avanzati
              </CardDescription>
            </CardContent>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">AI</Badge>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Conversione Ottimizzata</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Strategie di conversione basate su dati comportamentali e best practice del settore
              </CardDescription>
            </CardContent>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs">PROVEN</Badge>
            </div>
          </Card>
        </motion.div>

        {/* Process Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Come Funziona l'Intelligenza</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un processo guidato che porta la tua idea da zero a funnel ultra-personalizzato
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                step: 1,
                title: 'Analisi Obiettivi',
                description: 'Definisci obiettivi specifici e target audience',
                icon: Brain,
                color: 'primary'
              },
              {
                step: 2,
                title: 'Domande Dinamiche',
                description: 'AI genera domande personalizzate basate sui tuoi obiettivi',
                icon: Lightbulb,
                color: 'secondary'
              },
              {
                step: 3,
                title: 'Ricerca Mercato',
                description: 'Analisi competitiva e trend di mercato in tempo reale',
                icon: TrendingUp,
                color: 'accent'
              },
              {
                step: 4,
                title: 'Selezione Tipologia',
                description: 'Suggerimenti di funnel basati sull\'analisi intelligente',
                icon: Target,
                color: 'primary'
              },
              {
                step: 5,
                title: 'Generazione',
                description: 'Creazione funnel con copy personalizzato e ottimizzato',
                icon: Rocket,
                color: 'secondary'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="text-center h-full">
                  <CardHeader className="pb-3">
                    <div className={`w-16 h-16 bg-${item.color}/10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className={`w-8 h-8 text-${item.color}`} />
                    </div>
                    <div className={`w-8 h-8 bg-${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2`}>
                      {item.step}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                
                {index < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-muted to-muted-foreground/20 transform -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-muted/30 rounded-2xl p-8 space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Perché è Veramente Intelligente</h2>
            <p className="text-muted-foreground">
              Non solo genera funnel, ma comprende il tuo business e crea strategie personalizzate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Adattabilità Totale',
                description: 'Si adatta al tuo settore, target e obiettivi specifici, non usa template generici',
                stats: '95% personalizzazione'
              },
              {
                title: 'Ricerca in Tempo Reale',
                description: 'Analizza concorrenti e trend di mercato mentre genera il tuo funnel',
                stats: 'Dati sempre aggiornati'
              },
              {
                title: 'Psicologia Avanzata',
                description: 'Applica trigger psicologici specifici per il tuo target audience',
                stats: '+40% conversioni'
              },
              {
                title: 'Copy Ottimizzato',
                description: 'Genera copy personalizzato testato e ottimizzato per la conversione',
                stats: 'A/B test inclusi'
              },
              {
                title: 'Strategia Completa',
                description: 'Non solo steps, ma strategia di marketing e conversione end-to-end',
                stats: 'ROI tracciabile'
              },
              {
                title: 'Apprendimento Continuo',
                description: 'Migliora costantemente basandosi sui risultati e feedback',
                stats: 'Auto-ottimizzazione'
              }
            ].map((benefit, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {benefit.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {benefit.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-6 py-12"
        >
          <h2 className="text-3xl font-bold">
            Pronto a Creare il Tuo Funnel Intelligente?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Inizia ora e scopri come l'AI può trasformare la tua strategia di conversione
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => setShowWizard(true)}
              className="text-lg px-8 py-4 h-auto"
            >
              <Brain className="w-5 h-5 mr-2" />
              Inizia il Wizard Intelligente
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
