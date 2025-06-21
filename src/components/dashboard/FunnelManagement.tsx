
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';
import { Search, Eye, Edit, Share, MoreVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InteractiveFunnelCreator from '@/components/interactive-funnel/InteractiveFunnelCreator';
import InteractiveFunnelLeads from '@/components/interactive-funnel/InteractiveFunnelLeads';

const FunnelManagement: React.FC = () => {
  const { funnels, loading } = useInteractiveFunnels();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);

  const filteredFunnels = funnels.filter(funnel =>
    funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (funnel.description && funnel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewLeads = (funnelId: string) => {
    setSelectedFunnelId(funnelId);
    setLeadsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Ricerca */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">I Miei Funnel</h2>
          <p className="text-gray-600">Gestisci e monitora tutti i tuoi funnel interattivi</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca funnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <InteractiveFunnelCreator />
        </div>
      </div>

      {/* Lista Funnel */}
      {filteredFunnels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Nessun funnel trovato' : 'Nessun funnel creato'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia creando il tuo primo funnel interattivo'
              }
            </p>
            {!searchQuery && <InteractiveFunnelCreator />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFunnels.map((funnel) => (
            <Card key={funnel.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{funnel.name}</CardTitle>
                    {funnel.description && (
                      <p className="text-sm text-gray-600">{funnel.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewLeads(funnel.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Vedi Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="w-4 h-4 mr-2" />
                        Condividi
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(funnel.status || 'draft')}>
                      {funnel.status || 'draft'}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{funnel.views_count || 0} visualizzazioni</span>
                      <span>{funnel.submissions_count || 0} conversioni</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(funnel.created_at!).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Lead */}
      {selectedFunnelId && (
        <InteractiveFunnelLeads
          funnelId={selectedFunnelId}
          funnelName={funnels.find(f => f.id === selectedFunnelId)?.name || ''}
          isOpen={leadsModalOpen}
          onClose={() => setLeadsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FunnelManagement;
