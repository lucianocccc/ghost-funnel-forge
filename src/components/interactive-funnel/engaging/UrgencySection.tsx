
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Users, Flame } from 'lucide-react';

interface UrgencySectionProps {
  onContinue: () => void;
}

const UrgencySection: React.FC<UrgencySectionProps> = ({ onContinue }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Warning Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-full p-6">
              <AlertTriangle className="w-16 h-16 text-red-400 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          ⚠️ ATTENZIONE! ⚠️
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl md:text-3xl text-red-200 mb-12 leading-relaxed"
        >
          Questa Opportunità Sta Per Scadere!
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-black/40 backdrop-blur-sm border border-red-400/30 rounded-3xl p-8 mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-red-400 mr-3" />
            <span className="text-2xl font-bold text-white">Tempo Rimanente:</span>
          </div>
          
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="bg-red-600 rounded-lg p-4 mb-2">
                <span className="text-4xl font-bold text-white block">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-red-200 text-sm uppercase tracking-wide">Ore</span>
            </div>
            <div className="text-center">
              <div className="bg-red-600 rounded-lg p-4 mb-2">
                <span className="text-4xl font-bold text-white block">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-red-200 text-sm uppercase tracking-wide">Minuti</span>
            </div>
            <div className="text-center">
              <div className="bg-red-600 rounded-lg p-4 mb-2">
                <span className="text-4xl font-bold text-white block">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-red-200 text-sm uppercase tracking-wide">Secondi</span>
            </div>
          </div>
        </motion.div>

        {/* Urgency Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6">
            <Users className="w-12 h-12 text-red-400 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-white mb-3">Posti Limitati</h3>
            <p className="text-red-200">Solo 23 posti rimasti disponibili oggi</p>
          </div>
          
          <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-6">
            <Flame className="w-12 h-12 text-orange-400 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-white mb-3">Sconto Esclusivo</h3>
            <p className="text-orange-200">70% di sconto valido solo oggi</p>
          </div>
        </motion.div>

        {/* Urgent CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button
            onClick={onContinue}
            className="group relative px-16 py-6 bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl font-bold rounded-full hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-2xl animate-pulse"
          >
            <span className="relative z-10">APPROFITTA ORA!</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <p className="text-red-200 mt-4 text-lg">
            Non perdere questa opportunità irripetibile!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UrgencySection;
