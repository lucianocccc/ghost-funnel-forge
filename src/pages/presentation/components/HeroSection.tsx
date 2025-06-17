
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Info, Bot, Crown } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
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
          
          {/* Highlight ChatBot AI */}
          <div className="bg-gradient-to-r from-golden/20 to-yellow-600/20 border border-golden/30 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Bot className="w-6 h-6 text-golden" />
              <span className="text-golden font-bold text-lg">Nuovo: Assistente AI Personale</span>
              <Crown className="w-5 h-5 text-golden" />
            </div>
            <p className="text-gray-300 text-sm">
              Il primo chatbot AI che impara i tuoi obiettivi e crea funnel personalizzati. 
              <span className="text-golden font-semibold"> Disponibile esclusivamente per utenti Premium.</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/auth?subscribe=true&plan=free">
            <Button size="lg" className="bg-golden hover:bg-yellow-600 text-black text-lg px-8 py-4 font-semibold">
              <Gift className="mr-2 w-5 h-5" />
              Prova Gratis <ArrowRight className="ml-2 w-5 h-5" />
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
  );
};

export default HeroSection;
