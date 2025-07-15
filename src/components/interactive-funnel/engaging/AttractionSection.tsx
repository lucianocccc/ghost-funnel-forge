
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Heart, TrendingUp } from 'lucide-react';

interface AttractionSectionProps {
  onContinue: () => void;
}

const AttractionSection: React.FC<AttractionSectionProps> = ({ onContinue }) => {
  const attractions = [
    {
      icon: Target,
      title: "Precisione Assoluta",
      description: "Soluzioni mirate che colpiscono esattamente i tuoi obiettivi"
    },
    {
      icon: Zap,
      title: "Risultati Immediati",
      description: "Vedi i cambiamenti fin dal primo momento"
    },
    {
      icon: Heart,
      title: "Soddisfazione Garantita",
      description: "Il 97% dei nostri clienti raccomanda i nostri servizi"
    },
    {
      icon: TrendingUp,
      title: "Crescita Exponenziale",
      description: "I nostri clienti vedono una crescita media del 300%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Perché Scegliere Noi?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Migliaia di persone hanno già trasformato la loro vita. Ora è il tuo turno.
          </p>
        </motion.div>

        {/* Attraction Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {attractions.map((attraction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 group hover:scale-105 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <attraction.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {attraction.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {attraction.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">10,000+</div>
                <div className="text-gray-600">Clienti Soddisfatti</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">97%</div>
                <div className="text-gray-600">Tasso di Successo</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">5⭐</div>
                <div className="text-gray-600">Rating Medio</div>
              </div>
            </div>
            <p className="text-xl text-gray-700 italic">
              "La migliore decisione che abbia mai preso per la mia attività"
            </p>
          </div>
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
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Voglio Iniziare Subito
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AttractionSection;
