
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSharedInteractiveFunnel } from '@/hooks/useSharedInteractiveFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, Zap } from 'lucide-react';

const SharedInteractiveFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { funnel, loading, error } = useSharedInteractiveFunnel(shareToken);

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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Steps */}
          {funnel.interactive_funnel_steps && funnel.interactive_funnel_steps.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Passi del Funnel ({funnel.interactive_funnel_steps.length})
              </h2>
              
              {funnel.interactive_funnel_steps
                .sort((a, b) => a.step_order - b.step_order)
                .map((step, index) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center text-black font-bold">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {step.description && (
                      <p className="text-gray-600 mb-4">{step.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Badge variant="outline">
                        {step.step_type}
                      </Badge>
                      {step.is_required && (
                        <Badge variant="secondary">
                          Richiesto
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Questo funnel non ha ancora passi configurati.</p>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-golden to-yellow-600 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-black mb-2">
              Interessato a questo funnel?
            </h3>
            <p className="text-black/80 mb-4">
              Contatta il creatore per saperne di più sui servizi offerti.
            </p>
            <Button 
              size="lg"
              className="bg-black hover:bg-gray-800 text-white"
            >
              Contatta il Creatore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedInteractiveFunnel;
