
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock, Star, CheckCircle } from 'lucide-react';

interface QualityJourneySectionProps {
  onContinue: () => void;
}

const QualityJourneySection: React.FC<QualityJourneySectionProps> = ({ onContinue }) => {
  const qualityPoints = [
    {
      icon: Shield,
      title: "Sicurezza Garantita",
      description: "I tuoi dati sono protetti con crittografia di livello bancario",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      title: "Qualità Certificata",
      description: "Certificazioni ISO 9001 e riconoscimenti internazionali",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Team di Esperti",
      description: "Oltre 15 anni di esperienza nel settore",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Clock,
      title: "Supporto 24/7",
      description: "Assistenza dedicata in ogni momento",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Maria S.",
      role: "CEO, TechStart",
      rating: 5,
      text: "Qualità eccezionale e risultati che superano le aspettative. Consiglio vivamente!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b9cc8e41?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Giuseppe M.",
      role: "Marketing Director",
      rating: 5,
      text: "Il miglior investimento che abbia mai fatto per la mia azienda. ROI incredibile!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Laura R.",
      role: "Freelancer",
      rating: 5,
      text: "Professionalità e competenza ai massimi livelli. Risultati visibili da subito.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-3 mb-6">
            <Award className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-blue-800 font-semibold">Qualità Garantita</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Il Nostro Impegno per l'Eccellenza
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Non accettiamo compromessi quando si tratta di qualità. 
            Ogni dettaglio è studiato per offrirti la migliore esperienza possibile.
          </p>
        </motion.div>

        {/* Quality Points */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {qualityPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 group hover:scale-105 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className={`bg-gradient-to-br ${point.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <point.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {point.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 mb-16 text-center"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            Certificazioni e Riconoscimenti
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['ISO 9001', 'GDPR Compliant', 'SSL Secured', 'Award Winner'].map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
              >
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <span className="text-gray-800 font-semibold">{cert}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Cosa Dicono i Nostri Clienti
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-6 hover:bg-white/90 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Unisciti a Migliaia di Clienti Soddisfatti
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Scopri perché siamo la scelta preferita dei professionisti
            </p>
            
            <button
              onClick={onContinue}
              className="px-12 py-4 bg-white text-blue-600 text-xl font-bold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Inizia il Tuo Percorso di Qualità
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QualityJourneySection;
