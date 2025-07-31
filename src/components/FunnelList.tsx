import React, { useState } from "react";
import { useFunnels } from "@/hooks/useFunnels";
import { useGhostFunnels } from "@/hooks/useGhostFunnels";
import { FunnelCard } from "./funnel/FunnelCard";
import { FunnelDetailDrawer } from "./funnel/FunnelDetailDrawer";
import { GhostFunnelCard } from "./revolution/GhostFunnelCard";
import { GhostFunnelPreviewModal } from "./revolution/GhostFunnelPreviewModal";

const FunnelList = () => {
  const { funnels, loading, updateFunnelStatus } = useFunnels();
  const { 
    funnels: ghostFunnels, 
    loading: ghostLoading, 
    deleteFunnel: deleteGhostFunnel,
    toggleActive: toggleGhostActive 
  } = useGhostFunnels();
  
  const [selectedFunnel, setSelectedFunnel] = useState<any | null>(null);
  const [selectedGhostFunnel, setSelectedGhostFunnel] = useState<any | null>(null);

  const isLoading = loading || ghostLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasFunnels = funnels.length > 0 || ghostFunnels.length > 0;

  if (!hasFunnels) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nessun funnel creato ancora.</p>
        <p className="text-sm">Usa il pulsante "Crea Funnel" per iniziare.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Regular Funnels */}
        {funnels.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Funnel Interattivi</h3>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {funnels.map((funnel) => (
                <FunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  onStatusChange={updateFunnelStatus}
                  onSelect={() => setSelectedFunnel(funnel)}
                  isSelected={selectedFunnel?.id === funnel.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ghost Funnels */}
        {ghostFunnels.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Ghost Funnels</h3>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ghostFunnels.map((funnel) => (
                <GhostFunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  onDelete={deleteGhostFunnel}
                  onToggleActive={toggleGhostActive}
                  onPreview={setSelectedGhostFunnel}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FunnelDetailDrawer
        funnel={selectedFunnel}
        open={!!selectedFunnel}
        onClose={() => setSelectedFunnel(null)}
      />
      
      <GhostFunnelPreviewModal
        funnel={selectedGhostFunnel}
        open={!!selectedGhostFunnel}
        onClose={() => setSelectedGhostFunnel(null)}
      />
    </>
  );
};

export default FunnelList;