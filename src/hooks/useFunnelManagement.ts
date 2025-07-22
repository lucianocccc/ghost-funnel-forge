
import { useState, useMemo } from 'react';
import { useInteractiveFunnels } from './useInteractiveFunnels';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

export const useFunnelManagement = () => {
  const { 
    funnels, 
    loading, 
    error,
    updateStatus, 
    togglePublic, 
    regenerateToken 
  } = useInteractiveFunnels();
  
  const [selectedFunnel, setSelectedFunnel] = useState<InteractiveFunnelWithSteps | null>(null);
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [sharingModalOpen, setSharingModalOpen] = useState(false);

  // Filter funnels based on search query
  const filteredFunnels = useMemo(() => {
    if (!searchQuery.trim()) return funnels;
    
    const query = searchQuery.toLowerCase();
    return funnels.filter(funnel => 
      funnel.name.toLowerCase().includes(query) ||
      funnel.description?.toLowerCase().includes(query) ||
      funnel.status.toLowerCase().includes(query)
    );
  }, [funnels, searchQuery]);

  // Get the currently editing funnel
  const editingFunnel = useMemo(() => {
    return editingFunnelId ? funnels.find(f => f.id === editingFunnelId) : null;
  }, [editingFunnelId, funnels]);

  const handleViewLeads = (funnel: InteractiveFunnelWithSteps) => {
    setSelectedFunnel(funnel);
    setLeadsModalOpen(true);
  };

  const handleEditFunnel = (funnelId: string) => {
    setEditingFunnelId(funnelId);
  };

  const handleShareFunnel = (funnel: InteractiveFunnelWithSteps) => {
    setSelectedFunnel(funnel);
    setSharingModalOpen(true);
  };

  const handleArchiveFunnel = async (funnelId: string) => {
    await updateStatus(funnelId, 'archived');
  };

  const handleActivateFunnel = async (funnelId: string) => {
    await updateStatus(funnelId, 'active');
  };

  const resetSelectedFunnel = () => {
    setSelectedFunnel(null);
  };

  const resetLeadsModal = () => {
    setLeadsModalOpen(false);
    setSelectedFunnel(null);
  };

  const resetSharingModal = () => {
    setSharingModalOpen(false);
    setSelectedFunnel(null);
  };

  return {
    // Data
    funnels,
    filteredFunnels,
    loading,
    error,
    selectedFunnel,
    editingFunnel,
    editingFunnelId,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Modal states
    leadsModalOpen,
    sharingModalOpen,
    
    // Actions
    handleViewLeads,
    handleEditFunnel,
    handleShareFunnel,
    handleArchiveFunnel,
    handleActivateFunnel,
    togglePublic,
    regenerateToken,
    
    // State setters
    setLeadsModalOpen,
    setEditingFunnelId,
    setSharingModalOpen,
    
    // Reset functions
    resetSelectedFunnel,
    resetLeadsModal,
    resetSharingModal
  };
};
