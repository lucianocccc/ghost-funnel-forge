
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';
import { Search, Eye, Edit, Share, MoreVertical, Plus, Archive, Check, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InteractiveFunnelCreator from '@/components/interactive-funnel/InteractiveFunnelCreator';
import InteractiveFunnelLeads from '@/components/interactive-funnel/InteractiveFunnelLeads';
import InteractiveFunnelEditor from '@/components/interactive-funnel/InteractiveFunnelEditor';
import FunnelSharingModal from '@/components/interactive-funnel/FunnelSharingModal';

const FunnelManagement: React.FC = () => {
  const { funnels, loading, updateStatus, togglePublic, regenerateToken } = useInteractiveFunnels();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const [sharingModalOpen, setSharingModalOpen] = useState(false);

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

  const handleEditFunnel = (funnelId: string) => {
    setEditingFunnelId(funnelId);
  };

  const handleShareFunnel = (funnelId: string) => {
    setSelectedFunnelId(funnelId);
    setSharingModalOpen(true);
  };

  const handleArchiveFunnel = async (funnelId: string) => {
    await updateStatus(funnelId, 'archived');
  };

  const handleActivateFunnel = async (funnelId: string) => {
    await updateStatus(funnelId, 'active');
  };

  const selectedFunnel = selectedFunnelId ? funnels.find(f => f.id === selectedFunnelId) : null;
  const editingFunnel = editingFunnelId ? funnels.find(f => f.id === editingFunnelId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se stiamo editando un funnel, mostra l'editor
  if (editingFunnelId && editingFunnel) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setEditingFunnelId(null)}
          >
            ← Torna alla lista
          </Button>
          <h2 className="text-xl font-semibold">Modifica Funnel: {editingFunnel.name}</h2>
        </div>
        <InteractiveFunnelEditor 
          funnelId={editingFunnelId} 
          onSave={() => setEditingFunnelId(null)}
        />
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
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{funnel.name}</CardTitle>
                    {funnel.description && (
                      <p className="text-sm text-gray-600">{funnel.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{funnel.interactive_funnel_steps?.length || 0} step</span>
                      <span>•</span>
                      <span>{funnel.views_count || 0} visualizzazioni</span>
                      <span>•</span>
                      <span>{funnel.submissions_count || 0} conversioni</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(funnel.status || 'draft')}>
                      {funnel.status || 'draft'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => handleEditFunnel(funnel.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifica Step
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewLeads(funnel.id)}>
                          <Users className="w-4 h-4 mr-2" />
                          Vedi Lead ({funnel.submissions_count || 0})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareFunnel(funnel.id)}>
                          <Share className="w-4 h-4 mr-2" />
                          Condividi
                        </DropdownMenuItem>
                        {funnel.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleActivateFunnel(funnel.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Approva e Attiva
                          </DropdownMenuItem>
                        )}
                        {funnel.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleArchiveFunnel(funnel.id)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archivia
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Creato: {new Date(funnel.created_at!).toLocaleDateString()}</span>
                    {funnel.is_public && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Pubblico
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFunnel(funnel.id)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLeads(funnel.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lead
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Lead */}
      {selectedFunnelId && leadsModalOpen && (
        <InteractiveFunnelLeads
          funnelId={selectedFunnelId}
          funnelName={funnels.find(f => f.id === selectedFunnelId)?.name || ''}
          isOpen={leadsModalOpen}
          onClose={() => {
            setLeadsModalOpen(false);
            setSelectedFunnelId(null);
          }}
        />
      )}

      {/* Modal Condivisione */}
      {selectedFunnel && sharingModalOpen && (
        <FunnelSharingModal
          funnel={selectedFunnel}
          isOpen={sharingModalOpen}
          onClose={() => {
            setSharingModalOpen(false);
            setSelectedFunnelId(null);
          }}
          onTogglePublic={(isPublic) => togglePublic(selectedFunnel.id, isPublic)}
          onRegenerateToken={() => regenerateToken(selectedFunnel.id)}
        />
      )}
    </div>
  );
};

export default FunnelManagement;
