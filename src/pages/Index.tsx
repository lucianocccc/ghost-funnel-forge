import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Play, Zap, Brain, MessageSquare, Target, Settings } from 'lucide-react';

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
            <Zap className="w-8 h-8 text-golden" />
            <span className="text-2xl font-bold bg-gradient-to-r from-golden to-yellow-300 bg-clip-text text-transparent">
              GhostFunnel
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
              onClick={() => navigate('/dashboard')}
              className="text-gray-300 hover:text-golden transition-colors"
            >
              Crea Funnel
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
          Crea Funnel che Convertono
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          La piattaforma più intelligente per generare lead qualificati e aumentare le tue vendite.
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
            Un'unica Piattaforma per Tutti i Tuoi Funnel
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dalle conversazioni AI ai template specializzati, tutto quello che ti serve 
            per creare funnel che convertono davvero.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Brain,
              title: "Generazione Intelligente",
              description: "AI che analizza obiettivi e concorrenza per funnel ultra-personalizzati",
              color: "text-purple-400"
            },
            {
              icon: MessageSquare,
              title: "AI Conversazionale",
              description: "Chatta naturalmente con l'AI per creare funnel in modo intuitivo",
              color: "text-blue-400"
            },
            {
              icon: Target,
              title: "Product Discovery",
              description: "Scopri il potenziale del tuo prodotto con analisi guidate",
              color: "text-green-400"
            },
            {
              icon: Settings,
              title: "Template Specializzati",
              description: "Strutture preconfigurate per ogni settore e obiettivo",
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
            Storie di successo da chi ha già trasformato il proprio business con GhostFunnel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              quote: "GhostFunnel ha rivoluzionato il nostro processo di acquisizione clienti. Incredibile!",
              author: "Mario Rossi, CEO di InnovaTech",
              image: "https://images.unsplash.com/photo-1534528741702-a0cfae58b707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80"
            },
            {
              quote: "Finalmente uno strumento che semplifica la creazione di funnel. Lo consiglio a tutti!",
              author: "Giulia Bianchi, Marketing Manager di NextGen Solutions",
              image: "https://images.unsplash.com/photo-1580489944761-15a19d674x?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
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
            Pronto a Rivoluzionare i Tuoi Funnel?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di marketer che hanno già trasformato il loro business 
            con la nostra piattaforma unificata.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-golden text-black hover:bg-yellow-300 text-lg px-10 py-6 h-auto font-semibold"
            >
              <Zap className="w-6 h-6 mr-2" />
              Inizia la Rivoluzione
            </Button>
            
            <div className="text-sm text-gray-400">
              ✅ Gratis per sempre • ✅ Setup in 2 minuti • ✅ Nessuna carta richiesta
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} GhostFunnel. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default Index;
