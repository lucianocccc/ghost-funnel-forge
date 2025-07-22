
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Users, 
  BarChart3, 
  Settings, 
  Share2, 
  Archive,
  Play,
  Pause,
  RefreshCw,
  Edit,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useFunnelManagement } from '@/hooks/useFunnelManagement';
import InteractiveFunnelCreator from './InteractiveFunnelCreator';
import InteractiveFunnelLeads from './InteractiveFunnelLeads';
import FunnelSharingModal from './FunnelSharingModal';
import FunnelEditor from '../funnel/FunnelEditor';

const InteractiveFunnelList: React.FC = () => {
  const {
    filteredFunnels,
    loading,
    selectedFunnel,
    editingFunnel,
    searchQuery,
    setSearchQuery,
    leadsModalOpen,
    setLeadsModalOpen,
    editingFunnelId,
    setEditingFunnelId,
    sharingModalOpen,
    setSharingModalOpen,
    showTypedGenerator,
    handleViewLeads,
    handleEditFunnel,
    handleShareFunnel,
    handleArchiveFunnel,
    handleActivateFunnel,
    handleShowTypedGenerator,
    handleHideTypedGenerator,
    togglePublic,
    regenerateToken,
    resetSelectedFunnel,
    resetEditingFunnel,
    resetSharingModal,
    resetLeadsModal
  } = useFunnelManagement();

  // Show TypedFunnelGenerator if requested
  if (showTypedGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Genera Nuovo Funnel AI</h2>
          <Button variant="outline" onClick={handleHideTypedGenerator}>
            Torna alla Lista
          </Button>
        </div>
        <InteractiveFunnelCreator />
      </div>
    );
  }

  // Show funnel editor if editing
  if (editingFunnelId && editingFunnel) {
    return (
      <FunnelEditor 
        funnelId={editingFunnel.id}
        onSave={resetEditingFunnel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">I Miei Funnel Interattivi</h2>
          <p className="text-gray-600">Gestisci e monitora i tuoi funnel di raccolta lead</p>
        </div>
        <Button onClick={handleShowTypedGenerator} className="bg-golden hover:bg-yellow-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Funnel
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cerca funnel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Funnel Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filteredFunnels.map((funnel) => (
          <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{funnel.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>
                      {funnel.status === 'active' ? 'Attivo' : funnel.status === 'draft' ? 'Bozza' : 'Archiviato'}
                    </Badge>
                    {funnel.is_public && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Pubblico
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {funnel.description && (
                <CardDescription className="line-clamp-2">
                  {funnel.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>{funnel.views_count || 0} visualizzazioni</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{funnel.submissions_count || 0} invii</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Creato il {format(new Date(funnel.created_at), 'dd MMM yyyy', { locale: it })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewLeads(funnel.id)}
                  className="flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  Lead
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditFunnel(funnel.id)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Modifica
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareFunnel(funnel.id)}
                  className="flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Condividi
                </Button>

                {funnel.share_token && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/shared-interactive-funnel/${funnel.share_token}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Anteprima
                  </Button>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                {funnel.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleArchiveFunnel(funnel.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Archivia
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleActivateFunnel(funnel.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Attiva
                  </Button>
                )}

                <div className="text-xs text-gray-400">
                  ID: {funnel.id.slice(0, 8)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFunnels.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nessun funnel trovato</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? "Nessun funnel corrisponde alla tua ricerca." 
              : "Non hai ancora creato nessun funnel interattivo."
            }
          </p>
          <Button onClick={handleShowTypedGenerator} className="bg-golden hover:bg-yellow-600 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Crea il Tuo Primo Funnel
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedFunnel && (
        <>
          <InteractiveFunnelLeads
            funnelId={selectedFunnel.id}
            funnelName={selectedFunnel.name}
            isOpen={leadsModalOpen}
            onClose={resetLeadsModal}
          />
          
          <FunnelSharingModal
            funnel={selectedFunnel}
            isOpen={sharingModalOpen}
            onClose={resetSharingModal}
            onTogglePublic={(isPublic) => togglePublic(selectedFunnel.id, isPublic)}
            onRegenerateToken={() => regenerateToken(selectedFunnel.id)}
          />
        </>
      )}
    </div>
  );
};

export default InteractiveFunnelList;
