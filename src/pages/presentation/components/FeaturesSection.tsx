
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Zap, MessageCircle, Crown, Bot } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <section id="features-section" className="py-20 px-6 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tutto ciò che serve per
            <span className="block text-golden">Convertire i tuoi Leads</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Strumenti avanzati di analisi, automazione e intelligenza artificiale 
            per trasformare ogni lead in un cliente fedele.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Analisi Intelligente */}
          <Card className="bg-gray-800 border-gray-700 hover:border-golden transition-colors">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-golden mb-4" />
              <CardTitle className="text-white">Analisi Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Algoritmi AI analizzano ogni lead in tempo reale, identificando 
                pattern comportamentali e opportunità di conversione.
              </p>
            </CardContent>
          </Card>

          {/* Segmentazione Avanzata */}
          <Card className="bg-gray-800 border-gray-700 hover:border-golden transition-colors">
            <CardHeader>
              <Users className="w-12 h-12 text-golden mb-4" />
              <CardTitle className="text-white">Segmentazione Avanzata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Segmenta automaticamente i tuoi leads per priorità, interesse 
                e probabilità di conversione per massimizzare i risultati.
              </p>
            </CardContent>
          </Card>

          {/* Automazione Funnel */}
          <Card className="bg-gray-800 border-gray-700 hover:border-golden transition-colors">
            <CardHeader>
              <Zap className="w-12 h-12 text-golden mb-4" />
              <CardTitle className="text-white">Automazione Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Crea e gestisce funnel personalizzati che si adattano 
                automaticamente al comportamento di ogni singolo lead.
              </p>
            </CardContent>
          </Card>

          {/* ChatBot AI Premium */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-golden hover:border-yellow-400 transition-colors relative">
            <div className="absolute top-4 right-4">
              <Crown className="w-6 h-6 text-golden" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="w-12 h-12 text-golden" />
                <MessageCircle className="w-8 h-8 text-golden" />
              </div>
              <CardTitle className="text-white flex items-center gap-2">
                Assistente AI Personale
                <span className="text-xs bg-golden text-black px-2 py-1 rounded-full font-bold">PREMIUM</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Il tuo consulente AI disponibile 24/7 per creare funnel personalizzati, 
                analizzare i tuoi obiettivi e suggerirti strategie di marketing su misura.
                <span className="block mt-2 text-golden text-sm font-semibold">
                  ✨ Esclusivo per abbonamenti Premium
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Email Automation */}
          <Card className="bg-gray-800 border-gray-700 hover:border-golden transition-colors">
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-golden mb-4" />
              <CardTitle className="text-white">Email Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Sequenze email intelligenti che si attivano in base al 
                comportamento dei leads per massimizzare l'engagement.
              </p>
            </CardContent>
          </Card>

          {/* Dashboard Analytics */}
          <Card className="bg-gray-800 border-gray-700 hover:border-golden transition-colors">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-golden mb-4" />
              <CardTitle className="text-white">Dashboard Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Monitora performance, ROI e conversioni con dashboard 
                interattive e report dettagliati in tempo reale.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
