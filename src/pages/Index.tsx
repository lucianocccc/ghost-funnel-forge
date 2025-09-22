import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Play, Brain, MessageSquare, Target, Settings, Scale } from 'lucide-react';
import { BalanceIcon } from '@/icons/BalanceIcon';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleDemoClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navigation - Updated to point to unified dashboard */}
      <nav className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-8 h-8 text-golden" />
            <span className="text-2xl font-bold bg-gradient-to-r from-golden to-yellow-300 bg-clip-text text-transparent">
              ClientStream
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleDemoClick}
              className="text-gray-300 hover:text-golden transition-colors"
            >
              Demo
            </button>
            <button 
              onClick={handleDemoClick}
              className="text-gray-300 hover:text-golden transition-colors"
            >
              Soluzioni Legali
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-golden text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Accedi
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-golden to-yellow-300 bg-clip-text text-transparent">
          Trasforma Consulenze in Clienti
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          AI Marketing Automation specializzata per Studi Legali e Commerciali. 
          Crea funnel che convertono professionisti qualificati in clienti paganti.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-golden text-black hover:bg-yellow-300 text-lg px-8 py-6 h-auto font-semibold"
          >
            <Rocket className="w-6 h-6 mr-2" />
            Inizia Gratuitamente
          </Button>
          
          <Button
            onClick={handleDemoClick}
            variant="outline"
            size="lg"
            className="border-golden text-golden hover:bg-golden hover:text-black text-lg px-8 py-6 h-auto font-semibold"
          >
            <Play className="w-6 h-6 mr-2" />
            Vedi Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Marketing Automation per Professionisti
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dalla Lead Generation specializzata al CRM integrato, tutto quello che serve 
            al tuo studio per acquisire clienti di valore nel digitale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Brain,
              title: "AI Legale Specializzata",
              description: "Funnel ottimizzati per acquisire clienti nel settore legale e commerciale",
              color: "text-purple-400"
            },
            {
              icon: MessageSquare,
              title: "Lead Qualification",
              description: "Qualifica automaticamente i prospect per valore del caso e urgenza",
              color: "text-blue-400"
            },
            {
              icon: Target,
              title: "Compliance GDPR",
              description: "Gestione sicura dei dati sensibili nel rispetto del segreto professionale",
              color: "text-green-400"
            },
            {
              icon: Settings,
              title: "CRM Integration",
              description: "Connettiti ai software gestionali più usati dagli studi professionali",
              color: "text-golden"
            }
          ].map((feature, index) => (
            <div key={index} className="relative group">
              <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-golden/50 transition-all duration-300 h-full">
                <feature.icon className={`w-12 h-12 ${feature.color} mb-6`} />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Cosa Dicono i Nostri Clienti
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Storie di successo da studi legali e commerciali che hanno digitalizzato l'acquisizione clienti.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              quote: "ClientStream ha trasformato il nostro studio. +300% di lead qualificati in 6 mesi!",
              author: "Avv. Marco Benedetti",
              title: "Partner Studio Legale Benedetti & Associati",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80"
            },
            {
              quote: "Finalmente un sistema che capisce le esigenze degli studi professionali. ROI immediato!",
              author: "Dott. Elena Marchetti",
              title: "Consulente Commerciale Senior",
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold">{testimonial.author}</h4>
                  <p className="text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Updated to point to unified dashboard */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-golden/10 to-yellow-300/10 p-12 rounded-3xl border border-golden/30">
          <h2 className="text-4xl font-bold mb-6">
            Digitalizza il Tuo Studio Professionale
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Unisciti a centinaia di studi legali e commerciali che stanno acquisendo 
            clienti di valore attraverso l'AI Marketing Automation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-golden text-black hover:bg-yellow-300 text-lg px-10 py-6 h-auto font-semibold"
            >
              <Scale className="w-6 h-6 mr-2" />
              Inizia la Trasformazione
            </Button>
            
            <div className="text-sm text-gray-400">
              ✅ Specializzato per studi professionali • ✅ GDPR compliant • ✅ Setup guidato incluso
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} ClientStream. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Index;
