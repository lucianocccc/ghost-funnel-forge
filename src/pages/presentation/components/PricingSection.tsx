
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles, Gift, Crown } from 'lucide-react';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: "Gratuito",
      price: 0,
      period: "/sempre",
      description: "Piano completamente gratuito",
      trial: "Sempre gratuito",
      features: [
        "Fino a 10 leads/mese",
        "Analisi AI di base",
        "1 funnel attivo",
        "Supporto community",
        "Dashboard essenziale"
      ],
      popular: false,
      planId: "free",
      featured: true
    },
    {
      name: "Starter",
      price: 29,
      period: "/mese",
      description: "Perfetto per iniziare",
      trial: "7 giorni gratuiti",
      features: [
        "Fino a 100 leads/mese",
        "Analisi AI di base",
        "1 funnel attivo",
        "Email support",
        "Dashboard essenziale"
      ],
      popular: false,
      planId: "starter",
      featured: false
    },
    {
      name: "Professional",
      price: 79,
      period: "/mese",
      description: "La scelta più popolare",
      trial: "15 giorni gratuiti",
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
      planId: "professional",
      featured: false
    },
    {
      name: "Enterprise",
      price: 199,
      period: "/mese",
      description: "Per team e aziende",
      trial: "1 mese gratuito",
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
      planId: "enterprise",
      featured: false
    }
  ];

  // Calculate annual price with 15% discount
  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };

  return (
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.featured 
                  ? 'bg-gradient-to-b from-green-500/10 to-gray-900 border-green-500 scale-105' 
                  : plan.popular 
                    ? 'bg-gradient-to-b from-golden/10 to-gray-900 border-golden scale-105' 
                    : 'bg-gray-900/50 border-gray-700'
              } hover:scale-105 transition-transform`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    Gratuito
                  </div>
                </div>
              )}
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
                    <span className="text-gray-300 text-lg">{plan.period}</span>
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-gray-400">
                      <span className="line-through">€{plan.price * 12}</span>
                      <span className="text-golden font-semibold ml-2">€{getAnnualPrice(plan.price)}/anno</span>
                      <div className="text-xs text-green-400">Risparmia 15% con il piano annuale</div>
                    </div>
                  )}
                  <div className="text-sm font-semibold text-green-400 mt-2">
                    {plan.trial}
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
                      plan.featured
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : plan.popular 
                          ? 'bg-golden hover:bg-yellow-600 text-black' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    size="lg"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {plan.price === 0 ? 'Inizia Gratis' : plan.trial}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
