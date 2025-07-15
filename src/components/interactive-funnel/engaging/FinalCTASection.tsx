
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Gift, Clock, Star, ArrowRight, Sparkles } from 'lucide-react';

interface FinalCTASectionProps {
  onComplete: () => void;
}

const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalAction = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  const finalOfferPoints = [
    "✨ Accesso immediato a tutti i contenuti premium",
    "🎁 Bonus esclusivi del valore di €2.000",
    "🛡️ Garanzia soddisfatti o rimborsati 30 giorni",
    "👥 Supporto prioritario 24/7",
    "🚀 Implementazione guidata passo-passo",
    "📈 Tracking e analytics avanzati inclusi"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-3 mb-6">
            <Gift className="w-6 h-6 text-purple-300 mr-2" />
            <span className="text-purple-200 font-semibold">Offerta Finale Esclusiva</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            È Tutto Pronto
          </h1>
          <p className="text-2xl md:text-3xl text-purple-200 mb-8">
            Un ultimo clic per trasformare la tua vita
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12 relative overflow-hidden"
        >
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold text-sm">
              🔥 OFFERTA PIÙ POPOLARE
            </div>
          </div>

          <div className="text-center mb-8 pt-4">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl text-white/60 line-through mr-4">€2.997</span>
              <span className="text-6xl font-bold text-white">€997</span>
            </div>
            <p className="text-purple-200 text-xl">
              Risparmi il 67% - Solo per oggi!
            </p>
          </div>

          {/* What's Included */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {finalOfferPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center text-white"
              >
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>{point}</span>
              </motion.div>
            ))}
          </div>

          {/* Urgency Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 mb-8 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300 font-semibold">Offerta valida ancora per:</span>
            </div>
            <div className="text-2xl font-bold text-white">23:47:12</div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <button
              onClick={handleFinalAction}
              disabled={isProcessing}
              className={`group relative px-16 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold rounded-full transition-all duration-300 transform shadow-2xl ${
                isProcessing 
                  ? 'scale-95 opacity-80 cursor-not-allowed' 
                  : 'hover:scale-105 hover:from-green-600 hover:to-emerald-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Elaborazione in corso...
                </div>
              ) : (
                <>
                  <span className="relative z-10 flex items-center">
                    Ottieni Accesso Immediato
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              )}
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-6 text-white/60 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>SSL Sicuro</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Pagamento Protetto</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Garanzia 30gg</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-white font-semibold">Ultimi acquisti:</span>
            </div>
            
            <div className="space-y-2 text-white/80">
              <div>Marco da Milano - 2 minuti fa</div>
              <div>Laura da Roma - 5 minuti fa</div>
              <div>Giuseppe da Napoli - 7 minuti fa</div>
            </div>
            
            <div className="flex justify-center mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-white ml-2">4.9/5 - 2,847 recensioni</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalCTASection;
