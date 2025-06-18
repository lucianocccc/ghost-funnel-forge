
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Archive, Edit, BarChart3, ExternalLink } from 'lucide-react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const InteractiveFunnelList: React.FC = () => {
  const { funnels, loading, updateStatus } = useInteractiveFunnels();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun funnel interattivo</h3>
        <p className="text-gray-500 mb-4">Crea il tuo primo funnel interattivo per iniziare a raccogliere lead qualificati.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'draft': return 'Bozza';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {funnels.map((funnel) => (
        <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-medium truncate">
                  {funnel.name}
                </CardTitle>
                {funnel.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {funnel.description}
                  </p>
                )}
              </div>
              <Badge className={getStatusColor(funnel.status)}>
                {getStatusText(funnel.status)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 space-y-1">
              <div>
                <strong>Passi:</strong> {funnel.interactive_funnel_steps?.length || 0}
              </div>
              <div>
                <strong>Creato:</strong> {format(new Date(funnel.created_at), 'dd MMM yyyy', { locale: it })}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {funnel.status === 'draft' && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(funnel.id, 'active')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Attiva
                </Button>
              )}
              
              {funnel.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(funnel.id, 'archived')}
                >
                  <Archive className="w-3 h-3 mr-1" />
                  Archivia
                </Button>
              )}

              <Button size="sm" variant="outline">
                <Edit className="w-3 h-3 mr-1" />
                Modifica
              </Button>

              <Button size="sm" variant="outline">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics
              </Button>

              {funnel.status === 'active' && (
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Anteprima
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InteractiveFunnelList;
