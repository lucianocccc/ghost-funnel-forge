
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useSharedInteractiveFunnel } from '@/hooks/useSharedInteractiveFunnel';
import InteractiveFunnelPlayer from '@/components/interactive-funnel/InteractiveFunnelPlayer';
import { Sparkles, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

const SharedInteractiveFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { funnel, loading, error } = useSharedInteractiveFunnel(shareToken);
  const [completed, setCompleted] = useState(false);

  console.log('SharedInteractiveFunnel rendering:', {
    shareToken,
    funnel: funnel ? { id: funnel.id, name: funnel.name } : null,
    loading,
    error,
    stepsCount: funnel?.interactive_funnel_steps?.length || 0
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Caricamento in corso...</p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contenuto non disponibile
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'Il funnel che stai cercando non esiste o non è disponibile pubblicamente.'}
            </p>
            <div className="text-sm text-gray-500">
              <p>Possibili cause:</p>
              <ul className="mt-2 text-left space-y-1">
                <li>• Il funnel non è stato reso pubblico</li>
                <li>• Il link di condivisione è scaduto</li>
                <li>• Il funnel è stato rimosso</li>
              </ul>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Torna Indietro
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifica che il funnel abbia le proprietà necessarie
  if (!funnel.interactive_funnel_steps || funnel.interactive_funnel_steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel Vuoto
            </h2>
            <p className="text-gray-600 mb-4">
              Questo funnel non contiene ancora contenuti.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Torna Indietro
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerSettings = funnel.settings?.customer_facing;
  const brandColors = customerSettings?.brand_colors;

  // Dynamic styling based on brand colors
  const primaryColor = brandColors?.primary || '#2563eb';
  const secondaryColor = brandColors?.secondary || '#1e40af';
  const accentColor = brandColors?.accent || '#f59e0b';

  const handleComplete = () => {
    try {
      setCompleted(true);
    } catch (err) {
      console.error('Error completing funnel:', err);
    }
  };

  if (completed) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10, ${accentColor}10)`
        }}
      >
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="py-12 px-8">
            <div className="text-6xl mb-6">🎉</div>
            <CheckCircle 
              className="w-16 h-16 mx-auto mb-6"
              style={{ color: primaryColor }}
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Perfetto! Abbiamo ricevuto le tue informazioni
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Grazie per aver completato il nostro questionario. Ti contatteremo presto con una proposta personalizzata!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Le tue informazioni sono al sicuro con noi</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08, ${accentColor}08)`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Sparkles 
                className="w-8 h-8"
                style={{ color: primaryColor }}
              />
            </div>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {customerSettings?.hero_title || funnel.name}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {customerSettings?.hero_subtitle || funnel.description}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ArrowRight className="w-4 h-4" />
            <span>Ci vorranno solo pochi minuti</span>
          </div>
        </div>

        {/* Funnel Player */}
        <InteractiveFunnelPlayer 
          funnel={funnel} 
          onComplete={handleComplete}
        />

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100% Sicuro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Dati Protetti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Nessun Spam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedInteractiveFunnel;
