
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSharedInteractiveFunnel } from '@/hooks/useSharedInteractiveFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, Zap, CheckCircle } from 'lucide-react';
import InteractiveFunnelPlayer from '@/components/interactive-funnel/InteractiveFunnelPlayer';

const SharedInteractiveFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { funnel, loading, error } = useSharedInteractiveFunnel(shareToken);
  const [isCompleted, setIsCompleted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento funnel...</p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Funnel non trovato</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Il funnel che stai cercando non esiste o non è più disponibile pubblicamente.'}
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-golden hover:bg-yellow-600 text-black"
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Grazie!</h1>
          <p className="text-gray-600 mb-4">
            Le tue risposte sono state inviate con successo. Ti contatteremo presto!
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-golden hover:bg-yellow-600 text-black"
          >
            Chiudi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-golden text-black">
                  <Zap className="w-3 h-3 mr-1" />
                  Funnel Interattivo
                </Badge>
                <Badge variant="outline">
                  Pubblico
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{funnel.name}</h1>
              {funnel.description && (
                <p className="text-gray-600 mt-2">{funnel.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{funnel.views_count || 0} visualizzazioni</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{funnel.submissions_count || 0} submissions</span>
            </div>
            <div>
              Creato: {new Date(funnel.created_at).toLocaleDateString('it-IT')}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {funnel.interactive_funnel_steps && funnel.interactive_funnel_steps.length > 0 ? (
          <InteractiveFunnelPlayer 
            funnel={funnel}
            onComplete={() => setIsCompleted(true)}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Questo funnel non ha ancora passi configurati.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SharedInteractiveFunnel;
