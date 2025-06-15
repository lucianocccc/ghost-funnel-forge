
import React, { useState } from "react";
import { useFunnels } from "@/hooks/useFunnels";
import { FunnelCard } from "./funnel/FunnelCard";
import { FunnelDetailDrawer } from "./funnel/FunnelDetailDrawer";

const FunnelList = () => {
  const { funnels, loading, updateFunnelStatus } = useFunnels();
  const [selectedFunnel, setSelectedFunnel] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nessun funnel creato ancora.</p>
        <p className="text-sm">Usa il pulsante "Crea Funnel" per iniziare.</p>
      </div>
    );
  }

  return (
    <>
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
      <FunnelDetailDrawer
        funnel={selectedFunnel}
        open={!!selectedFunnel}
        onClose={() => setSelectedFunnel(null)}
      />
    </>
  );
};

export default FunnelList;
