import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Target, ArrowRight } from 'lucide-react';
import GhostFunnelWizard from '@/components/ghost-funnel/GhostFunnelWizard';
import { motion } from 'framer-motion';

type Step = 'welcome' | 'wizard' | 'preview';

const GhostFunnel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [generatedFunnel, setGeneratedFunnel] = useState<any>(null);

  const handleStartWizard = () => {
    setCurrentStep('wizard');
  };

  const handleFunnelGenerated = (funnel: any) => {
    setGeneratedFunnel(funnel);
    setCurrentStep('preview');
  };

  const handleBackToWelcome = () => {
    setCurrentStep('welcome');
    setGeneratedFunnel(null);
  };

  if (currentStep === 'wizard') {
    return (
      <GhostFunnelWizard 
        onFunnelGenerated={handleFunnelGenerated}
        onBack={handleBackToWelcome}
      />
    );
  }

  if (currentStep === 'preview' && generatedFunnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Funnel Generato con Successo
              </Badge>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Il Tuo Ghost Funnel è Pronto
              </h1>
              <p className="text-xl text-muted-foreground">
                Ecco la tua landing page ottimizzata per le conversioni
              </p>
            </motion.div>

            {/* Generated Funnel Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border shadow-lg overflow-hidden"
            >
              <div className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {generatedFunnel.hero?.title || 'Titolo del Funnel'}
                </h2>
                <p className="text-xl text-muted-foreground mb-6">
                  {generatedFunnel.hero?.subtitle || 'Sottotitolo accattivante'}
                </p>
                <Button size="lg" className="animate-pulse">
                  {generatedFunnel.cta?.text || 'Inizia Ora'}
                </Button>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-semibold text-center mb-8">Vantaggi Principali</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {generatedFunnel.advantages?.slice(0, 3).map((advantage: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="text-center hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="font-semibold mb-2">{advantage.title}</h4>
                          <p className="text-sm text-muted-foreground">{advantage.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {generatedFunnel.emotional && (
                <div className="p-8 bg-gradient-to-r from-secondary/5 to-primary/5">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-4">
                      {generatedFunnel.emotional.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      {generatedFunnel.emotional.description}
                    </p>
                    <Button size="lg" variant="secondary">
                      {generatedFunnel.cta?.text || 'Scopri di Più'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 mt-8"
            >
              <Button variant="outline" onClick={handleBackToWelcome}>
                Crea Nuovo Funnel
              </Button>
              <Button>
                Salva e Pubblica
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Funnel Creation
            </Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Ghost Funnel
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Crea landing page professionali e ad alta conversione in pochi minuti. 
              La nostra AI analizza il tuo business e genera automaticamente funnel ottimizzati.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Veloce e Intelligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rispondi a 4-5 domande e ottieni un funnel completo in meno di 2 minuti
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Ottimizzato per Conversioni</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ogni elemento è progettato per massimizzare le conversioni del tuo business
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Design Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stili ispirati ai brand più iconici: Apple, Nike, Amazon
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              onClick={handleStartWizard}
              className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              Inizia a Creare il Tuo Funnel
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Gratis • Nessuna carta di credito richiesta
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GhostFunnel;