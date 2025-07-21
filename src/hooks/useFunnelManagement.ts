
import { useState } from 'react';
import { useInteractiveFunnels } from '@/hooks/useInteractiveFunnels';

export const useFunnelManagement = () => {
  const { funnels, loading, updateStatus, togglePublic, regenerateToken } = useInteractiveFunnels();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [editingFunnelId, setEditingFunnelId] = useState<string | null>(null);
  const [sharingModalOpen, setSharingModalOpen] = useState(false);
  const [showTypedGenerator, setShowTypedGenerator] = useState(false);

  const filteredFunnels = funnels.filter(funnel =>
    funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (funnel.description && funnel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const handleShowTypedGenerator = () => {
    setShowTypedGenerator(true);
  };

  const handleHideTypedGenerator = () => {
    setShowTypedGenerator(false);
  };

  const selectedFunnel = selectedFunnelId ? funnels.find(f => f.id === selectedFunnelId) : null;
  const editingFunnel = editingFunnelId ? funnels.find(f => f.id === editingFunnelId) : null;

  return {
    // Data
    funnels,
    filteredFunnels,
    loading,
    selectedFunnel,
    editingFunnel,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Modal states
    selectedFunnelId,
    leadsModalOpen,
    setLeadsModalOpen,
    editingFunnelId,
    setEditingFunnelId,
    sharingModalOpen,
    setSharingModalOpen,
    showTypedGenerator,
    
    // Actions
    handleViewLeads,
    handleEditFunnel,
    handleShareFunnel,
    handleArchiveFunnel,
    handleActivateFunnel,
    handleShowTypedGenerator,
    handleHideTypedGenerator,
    togglePublic,
    regenerateToken,
    
    // Reset functions
    resetSelectedFunnel: () => setSelectedFunnelId(null),
    resetEditingFunnel: () => setEditingFunnelId(null),
    resetSharingModal: () => setSharingModalOpen(false),
    resetLeadsModal: () => setLeadsModalOpen(false)
  };
};
