
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Users, 
  BarChart3, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Mail,
  Bot,
  TrendingUp,
  Gift,
  Info,
  LogIn
} from 'lucide-react';

const Presentation = () => {
  const plans = [
    {
      name: "Starter",
      price: 29,
      period: "/mese",
      description: "Perfetto per iniziare",
      features: [
        "Fino a 100 leads/mese",
        "Analisi AI di base",
        "1 funnel attivo",
        "Email support",
        "Dashboard essenziale"
      ],
      popular: false,
      planId: "starter"
    },
    {
      name: "Professional",
      price: 79,
      period: "/mese",
      description: "La scelta più popolare",
      features: [
        "Fino a 1000 leads/mese",
        "Analisi AI avanzata",
        "Funnel illimitati",
        "Email automation",
        "Reportistica dettagliata",
        "Integrazioni Zapier/Make",
        "Supporto prioritario"
      ],
      popular: true,
      planId: "professional"
    },
    {
      name: "Enterprise",
      price: 199,
      period: "/mese",
      description: "Per team e aziende",
      features: [
        "Leads illimitati",
        "AI personalizzata",
        "Multi-team support",
        "API dedicata",
        "Onboarding personalizzato",
        "Account manager dedicato",
        "SLA garantito"
      ],
      popular: false,
      planId: "enterprise"
    }
  ];

  // Calculate annual price with 15% discount
  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-golden" />
            <h1 className="text-2xl font-bold text-white">
              Ghost <span className="text-golden">Funnel</span>
            </h1>
          </div>
          <Link to="/auth">
            <Button className="bg-golden hover:bg-yellow-600 text-black font-semibold">
              <LogIn className="w-4 h-4 mr-2" />
              Accedi
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trasforma i tuoi 
              <span className="block text-golden">Leads in Clienti</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              La piattaforma AI che analizza, segmenta e converte i tuoi leads 
              con funnel intelligenti e automazioni personalizzate.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth?subscribe=true">
              <Button size="lg" className="bg-golden hover:bg-yellow-600 text-black text-lg px-8 py-4 font-semibold">
                <Gift className="mr-2 w-5 h-5" />
                14 Giorni Gratuiti <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-golden text-golden hover:bg-golden hover:text-black text-lg px-8 py-4"
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Info className="mr-2 w-5 h-5" />
              Scopri di Più
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-golden mb-2">+250%</div>
              <div className="text-gray-300">Aumento Conversioni</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-golden mb-2">85%</div>
              <div className="text-gray-300">Riduzione Tempo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-golden mb-2">10k+</div>
              <div className="text-gray-300">Leads Analizzati</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Scegli il tuo <span className="text-golden">Piano</span>
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Piani flessibili che crescono con il tuo business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-golden/10 to-gray-900 border-golden scale-105' 
                    : 'bg-gray-900/50 border-gray-700'
                } hover:scale-105 transition-transform`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-golden text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Più Popolare
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-golden">€{plan.price}</span>
                      <span className="text-gray-300 text-lg">/mese</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="line-through">€{plan.price * 12}</span>
                      <span className="text-golden font-semibold ml-2">€{getAnnualPrice(plan.price)}/anno</span>
                      <div className="text-xs text-green-400">Risparmia 15% con il piano annuale</div>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-golden mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={`/auth?subscribe=true&plan=${plan.planId}`} className="block w-full">
                    <Button 
                      className={`w-full mt-6 ${
                        plan.popular 
                          ? 'bg-golden hover:bg-yellow-600 text-black' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                      size="lg"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      14 Giorni Gratuiti
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-golden/20 to-yellow-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Pronto a Rivoluzionare il tuo Business?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Unisciti a migliaia di aziende che hanno già trasformato la loro strategia di lead generation
          </p>
          <Link to="/auth?subscribe=true">
            <Button size="lg" className="bg-golden hover:bg-yellow-600 text-black text-xl px-12 py-4 font-bold">
              <Gift className="mr-3 w-6 h-6" />
              14 Giorni Gratuiti
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-golden" />
            <span className="text-xl font-bold text-white">
              Ghost <span className="text-golden">Funnel</span>
            </span>
          </div>
          <p className="text-gray-400">
            © 2024 Ghost Funnel. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Presentation;
