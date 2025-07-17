
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFunnelHealthCheck } from '@/hooks/useFunnelHealthCheck';
import { Activity, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

const FunnelHealthCheckPanel: React.FC = () => {
  const { runHealthCheck, loading, lastResult } = useFunnelHealthCheck();

  const getStatusIcon = (action: string) => {
    switch (action) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'repaired':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (action: string) => {
    switch (action) {
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'repaired':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Funnel Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-300">
            Controlla e ripara automaticamente tutti i funnel pubblici senza step
          </p>
          <Button
            onClick={runHealthCheck}
            disabled={loading}
            className="bg-golden hover:bg-golden/90 text-black"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Controllo...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Esegui Check
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{lastResult.funnelsChecked}</div>
                <div className="text-sm text-gray-400">Funnel Controllati</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{lastResult.funnelsRepaired}</div>
                <div className="text-sm text-gray-400">Funnel Riparati</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{lastResult.errors.length}</div>
                <div className="text-sm text-gray-400">Errori</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {lastResult.details.filter(d => d.action === 'ok').length}
                </div>
                <div className="text-sm text-gray-400">Già OK</div>
              </div>
            </div>

            {lastResult.details.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Dettagli Controllo:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {lastResult.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(detail.action)}
                        <div>
                          <div className="text-white font-medium">{detail.funnelName}</div>
                          <div className="text-sm text-gray-400">{detail.message}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(detail.action)}>
                        {detail.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lastResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-red-400 font-medium">Errori:</h4>
                <div className="space-y-1">
                  {lastResult.errors.map((error, index) => (
                    <div key={index} className="bg-red-900/20 border border-red-700 p-2 rounded text-sm text-red-300">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelHealthCheckPanel;
