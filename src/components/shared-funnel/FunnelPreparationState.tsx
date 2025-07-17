
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useFunnelHealthCheck } from '@/hooks/useFunnelHealthCheck';

interface FunnelPreparationStateProps {
  funnelId: string;
  funnelName: string;
  onRetry: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const FunnelPreparationState: React.FC<FunnelPreparationStateProps> = ({
  funnelId,
  funnelName,
  onRetry,
  retryCount = 0,
  maxRetries = 3
}) => {
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(10);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(retryCount < maxRetries);
  const { runHealthCheck, loading: healthCheckLoading } = useFunnelHealthCheck();

  // Auto-retry countdown
  useEffect(() => {
    if (!autoRetryEnabled) return;

    const interval = setInterval(() => {
      setAutoRetryCountdown(prev => {
        if (prev <= 1) {
          handleAutoRetry();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRetryEnabled]);

  const handleAutoRetry = () => {
    if (retryCount < maxRetries) {
      onRetry();
    } else {
      setAutoRetryEnabled(false);
    }
  };

  const handleManualRetry = () => {
    setAutoRetryCountdown(10);
    onRetry();
  };

  const handleForceRepair = async () => {
    console.log(`🔧 Forcing repair for funnel: ${funnelName}`);
    const result = await runHealthCheck();
    
    if (result && result.funnelsRepaired > 0) {
      // Aspetta un momento per permettere al database di aggiornarsi
      setTimeout(() => {
        onRetry();
      }, 2000);
    }
  };

  const progressPercentage = retryCount > 0 ? Math.min((retryCount / maxRetries) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl mx-auto bg-white shadow-lg">
        <CardContent className="text-center py-12 px-8">
          <div className="relative mb-8">
            <Wrench className="w-20 h-20 text-orange-500 mx-auto mb-4 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contenuto in Preparazione
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Il contenuto di "<span className="font-semibold">{funnelName}</span>" sta venendo preparato dal nostro sistema automatico.
          </p>

          {/* Progress bar */}
          {retryCount > 0 && (
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Tentativo {retryCount} di {maxRetries}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Il nostro sistema sta preparando:
            </h3>
            <ul className="text-left text-blue-700 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Step interattivi personalizzati
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Contenuti coinvolgenti e mirati
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Esperienza utente ottimizzata
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Test di qualità automatici
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleManualRetry} 
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-32"
              disabled={healthCheckLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${healthCheckLoading ? 'animate-spin' : ''}`} />
              Riprova Ora
            </Button>

            {retryCount >= 2 && (
              <Button 
                onClick={handleForceRepair}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                disabled={healthCheckLoading}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {healthCheckLoading ? 'Riparazione...' : 'Forza Riparazione'}
              </Button>
            )}

            <Button 
              onClick={() => window.history.back()} 
              variant="ghost"
              className="text-gray-600"
            >
              Torna Indietro
            </Button>
          </div>

          {autoRetryEnabled && retryCount < maxRetries && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Riprova automatica tra {autoRetryCountdown} secondi</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAutoRetryEnabled(false)}
                className="mt-2 text-xs text-gray-500"
              >
                Annulla riprova automatica
              </Button>
            </div>
          )}

          {retryCount >= maxRetries && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Riprove esaurite</span>
              </div>
              <p className="text-sm text-red-600 mb-3">
                Il contenuto sta richiedendo più tempo del previsto. Il nostro team è stato notificato.
              </p>
              <Button 
                onClick={handleForceRepair}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={healthCheckLoading}
              >
                Contatta il Supporto
              </Button>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500">
            <p>Di solito ci vogliono solo 1-2 minuti.</p>
            <p className="mt-1">ID Funnel: {funnelId.slice(-8)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunnelPreparationState;
