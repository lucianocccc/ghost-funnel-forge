
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Target, Mail, TrendingUp } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: "Analisi AI Avanzata",
      description: "I nostri algoritmi analizzano ogni lead identificando profilo, punti di dolore e opportunità di business."
    },
    {
      icon: Target,
      title: "Funnel Intelligenti",
      description: "Crea funnel personalizzati che si adattano automaticamente al comportamento dei tuoi leads."
    },
    {
      icon: Mail,
      title: "Email Automation",
      description: "Sistema di email automatiche che nutrono i leads con contenuti mirati e personalizzati."
    },
    {
      icon: TrendingUp,
      title: "Analytics Dettagliati",
      description: "Dashboard completa con metriche avanzate per ottimizzare le tue strategie di conversione."
    }
  ];

  return (
    <section id="features-section" className="py-20 px-6 bg-gray-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">
            Funzionalità <span className="text-golden">Avanzate</span>
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tutto quello che ti serve per trasformare la tua strategia di lead generation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700 hover:border-golden transition-colors">
              <CardHeader className="text-center">
                <feature.icon className="w-12 h-12 text-golden mx-auto mb-4" />
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-golden/10 to-yellow-600/10 rounded-lg p-8 max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-white mb-4">Perché Scegliere Ghost Funnel?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h5 className="text-golden font-semibold mb-2">🚀 Setup Rapido</h5>
                <p className="text-gray-300">Attivazione in meno di 5 minuti. Nessuna configurazione complessa.</p>
              </div>
              <div>
                <h5 className="text-golden font-semibold mb-2">🤖 AI Proprietaria</h5>
                <p className="text-gray-300">Algoritmi sviluppati internamente per massimizzare le conversioni.</p>
              </div>
              <div>
                <h5 className="text-golden font-semibold mb-2">📊 ROI Garantito</h5>
                <p className="text-gray-300">In media, i nostri clienti vedono un ritorno dell'investimento del 300%.</p>
              </div>
              <div>
                <h5 className="text-golden font-semibold mb-2">🔒 Sicurezza Totale</h5>
                <p className="text-gray-300">Conformità GDPR e crittografia end-to-end per tutti i dati.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
