
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSharedInteractiveFunnel } from '@/hooks/useSharedInteractiveFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, Zap, CheckCircle, Star, Sparkles } from 'lucide-react';
import InteractiveFunnelPlayer from '@/components/interactive-funnel/InteractiveFunnelPlayer';

const SharedInteractiveFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { funnel, loading, error } = useSharedInteractiveFunnel(shareToken);
  const [isCompleted, setIsCompleted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contenuto non trovato</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Il contenuto che stai cercando non è più disponibile.'}
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  const customerFacing = funnel.settings?.customer_facing || {};
  const primaryColor = customerFacing.brand_colors?.primary || '#2563eb';
  const secondaryColor = customerFacing.brand_colors?.secondary || '#1e40af';
  const accentColor = customerFacing.brand_colors?.accent || '#f59e0b';

  if (isCompleted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)` 
        }}
      >
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Perfetto!</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Grazie per aver completato il processo. Ti contatteremo presto con tutte le informazioni!
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            style={{ backgroundColor: primaryColor }}
            className="hover:opacity-90 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Chiudi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor}05, ${secondaryColor}10, ${accentColor}05)` 
      }}
    >
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge 
                className="text-white font-medium px-4 py-1.5"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Esperienza Personalizzata
              </Badge>
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              {customerFacing.hero_title || funnel.name}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              {customerFacing.hero_subtitle || funnel.description}
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{funnel.views_count || 0} persone interessate</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{funnel.submissions_count || 0} completamenti</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Processo guidato</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {funnel.interactive_funnel_steps && funnel.interactive_funnel_steps.length > 0 ? (
          <InteractiveFunnelPlayer 
            funnel={funnel}
            onComplete={() => setIsCompleted(true)}
          />
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Zap className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stiamo preparando tutto per te
              </h3>
              <p className="text-gray-600">
                Il processo personalizzato sarà disponibile a breve. Torna presto!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SharedInteractiveFunnel;
