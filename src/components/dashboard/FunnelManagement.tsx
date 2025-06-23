
import React from 'react';
import { Button } from '@/components/ui/button';
import InteractiveFunnelEditor from '@/components/interactive-funnel/InteractiveFunnelEditor';
import InteractiveFunnelLeads from '@/components/interactive-funnel/InteractiveFunnelLeads';
import FunnelSharingModal from '@/components/interactive-funnel/FunnelSharingModal';
import FunnelManagementHeader from './FunnelManagementHeader';
import FunnelManagementEmpty from './FunnelManagementEmpty';
import FunnelManagementGrid from './FunnelManagementGrid';
import { useFunnelManagement } from '@/hooks/useFunnelManagement';

const FunnelManagement: React.FC = () => {
  const {
    filteredFunnels,
    loading,
    selectedFunnel,
    editingFunnel,
    searchQuery,
    setSearchQuery,
    leadsModalOpen,
    editingFunnelId,
    sharingModalOpen,
    handleViewLeads,
    handleEditFunnel,
    handleShareFunnel,
    handleArchiveFunnel,
    handleActivateFunnel,
    togglePublic,
    regenerateToken,
    setLeadsModalOpen,
    setEditingFunnelId,
    setSharingModalOpen,
    resetSelectedFunnel,
    resetLeadsModal,
    resetSharingModal
  } = useFunnelManagement();

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
      <FunnelManagementHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredFunnels.length === 0 ? (
        <FunnelManagementEmpty searchQuery={searchQuery} />
      ) : (
        <FunnelManagementGrid
          funnels={filteredFunnels}
          onEdit={handleEditFunnel}
          onViewLeads={handleViewLeads}
          onShare={handleShareFunnel}
          onArchive={handleArchiveFunnel}
          onActivate={handleActivateFunnel}
        />
      )}

      {/* Modal Lead */}
      {leadsModalOpen && selectedFunnel && (
        <InteractiveFunnelLeads
          funnelId={selectedFunnel.id}
          funnelName={selectedFunnel.name}
          isOpen={leadsModalOpen}
          onClose={() => {
            setLeadsModalOpen(false);
            resetSelectedFunnel();
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
            resetSelectedFunnel();
          }}
          onTogglePublic={(isPublic) => togglePublic(selectedFunnel.id, isPublic)}
          onRegenerateToken={() => regenerateToken(selectedFunnel.id)}
        />
      )}
    </div>
  );
};

export default FunnelManagement;
