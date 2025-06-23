
import React from 'react';
import { Button } from '@/components/ui/button';
import InteractiveFunnelEditor from './InteractiveFunnelEditor';
import FunnelSharingModal from './FunnelSharingModal';
import InteractiveFunnelLeads from './InteractiveFunnelLeads';
import FunnelListGrid from './components/FunnelListGrid';
import FunnelListEmpty from './components/FunnelListEmpty';
import FunnelListLoading from './components/FunnelListLoading';
import { useInteractiveFunnelList } from '@/hooks/useInteractiveFunnelList';

const InteractiveFunnelList: React.FC = () => {
  const {
    funnels,
    loading,
    selectedFunnelData,
    leadsModalFunnelData,
    editingFunnelData,
    selectedFunnel,
    leadsModalFunnel,
    editingFunnel,
    updateStatus,
    handleTogglePublic,
    handleRegenerateToken,
    setSelectedFunnel,
    setLeadsModalFunnel,
    setEditingFunnel
  } = useInteractiveFunnelList();

  if (loading) {
    return <FunnelListLoading />;
  }

  // Se siamo in modalità editing, mostra l'editor
  if (editingFunnel && editingFunnelData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setEditingFunnel(null)}
          >
            ← Torna alla lista
          </Button>
          <h2 className="text-xl font-semibold">Modifica Funnel: {editingFunnelData.name}</h2>
        </div>
        <InteractiveFunnelEditor 
          funnelId={editingFunnel} 
          onSave={() => {
            setEditingFunnel(null);
          }}
        />
      </div>
    );
  }

  if (funnels.length === 0) {
    return <FunnelListEmpty />;
  }

  return (
    <>
      <FunnelListGrid
        funnels={funnels}
        onActivate={updateStatus}
        onEdit={setEditingFunnel}
        onShare={setSelectedFunnel}
        onViewLeads={setLeadsModalFunnel}
      />

      {/* Modal Condivisione */}
      {selectedFunnelData && (
        <FunnelSharingModal
          funnel={selectedFunnelData}
          isOpen={!!selectedFunnel}
          onClose={() => setSelectedFunnel(null)}
          onTogglePublic={(isPublic) => handleTogglePublic(selectedFunnelData.id, isPublic)}
          onRegenerateToken={() => handleRegenerateToken(selectedFunnelData.id)}
        />
      )}

      {/* Modal Lead */}
      {leadsModalFunnelData && (
        <InteractiveFunnelLeads
          funnelId={leadsModalFunnelData.id}
          funnelName={leadsModalFunnelData.name}
          isOpen={!!leadsModalFunnel}
          onClose={() => setLeadsModalFunnel(null)}
        />
      )}
    </>
  );
};

export default InteractiveFunnelList;
