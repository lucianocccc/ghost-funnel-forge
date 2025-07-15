
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Award, Shield, Zap, TrendingUp } from 'lucide-react';

interface BenefitsSectionProps {
  onContinue: () => void;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onContinue }) => {
  const mainBenefits = [
    {
      icon: Zap,
      title: "Risultati Immediati",
      description: "Vedi i primi miglioramenti entro 24 ore",
      highlight: "24h"
    },
    {
      icon: TrendingUp,
      title: "Crescita Esponenziale",
      description: "Incremento medio del 300% in 90 giorni",
      highlight: "+300%"
    },
    {
      icon: Shield,
      title: "Garanzia Totale",
      description: "Rimborso completo se non sei soddisfatto",
      highlight: "100%"
    }
  ];

  const additionalBenefits = [
    "✅ Supporto 24/7 per 365 giorni",
    "✅ Accesso a materiali esclusivi del valore di €2.000",
    "✅ Community privata con esperti del settore",
    "✅ Aggiornamenti gratuiti a vita",
    "✅ Consulenza personalizzata inclusa",
    "✅ Certificazione professionale"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 mb-6">
            <Award className="w-6 h-6 text-green-600 mr-2" />
            <span className="text-green-800 font-semibold">I Tuoi Vantaggi Esclusivi</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Cosa Otterrai Esattamente
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Non stiamo parlando di promesse vuote. Ecco i benefici concreti e misurabili.
          </p>
        </motion.div>

        {/* Main Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 group hover:scale-105 shadow-xl overflow-hidden"
            >
              {/* Highlight Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {benefit.highlight}
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Bonus Inclusi Gratuitamente
            </h3>
            <p className="text-gray-600 text-lg">
              Valore totale: <span className="text-green-600 font-bold text-2xl">€5.000</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {additionalBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center p-4 bg-green-50/70 rounded-xl hover:bg-green-100/70 transition-colors duration-300"
              >
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-300 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-bold mb-4 italic">
            "Ho ottenuto risultati che non credevo possibili. 
            Il mio business è cresciuto del 400% in soli 3 mesi!"
          </blockquote>
          <cite className="text-green-100 text-lg">
            - Marco R., Imprenditore
          </cite>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <button
            onClick={onContinue}
            className="px-16 py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-2xl font-bold rounded-full hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Ottieni Tutti Questi Vantaggi
          </button>
          
          <p className="text-gray-600 mt-4 text-lg">
            Più di 10.000 persone stanno già beneficiando di questi risultati
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BenefitsSection;
