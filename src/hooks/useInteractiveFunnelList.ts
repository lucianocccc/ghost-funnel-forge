
import { useState } from 'react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';

export const useInteractiveFunnelList = () => {
  const { funnels, loading, updateStatus, togglePublic, regenerateToken } = useInteractiveFunnels();
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [leadsModalFunnel, setLeadsModalFunnel] = useState<string | null>(null);
  const [editingFunnel, setEditingFunnel] = useState<string | null>(null);

  const handleTogglePublic = async (funnelId: string, isPublic: boolean) => {
    await togglePublic(funnelId, isPublic);
  };

  const handleRegenerateToken = async (funnelId: string) => {
    return await regenerateToken(funnelId);
  };

  const selectedFunnelData = selectedFunnel 
    ? funnels.find(f => f.id === selectedFunnel)
    : null;

  const leadsModalFunnelData = leadsModalFunnel 
    ? funnels.find(f => f.id === leadsModalFunnel)
    : null;

  const editingFunnelData = editingFunnel 
    ? funnels.find(f => f.id === editingFunnel)
    : null;

  return {
    // Data
    funnels,
    loading,
    selectedFunnelData,
    leadsModalFunnelData,
    editingFunnelData,
    
    // State
    selectedFunnel,
    leadsModalFunnel,
    editingFunnel,
    
    // Actions
    updateStatus,
    handleTogglePublic,
    handleRegenerateToken,
    setSelectedFunnel,
    setLeadsModalFunnel,
    setEditingFunnel
  };
};
