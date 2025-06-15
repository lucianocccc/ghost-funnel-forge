
import React from "react";
import { useFunnels } from "@/hooks/useFunnels";
import { FunnelCard } from "./funnel/FunnelCard";

const FunnelList = () => {
  const { funnels, loading, updateFunnelStatus } = useFunnels();

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

  // To show type info, fetch template/category for each funnel from the template list if available
  // In actual production, join with templates on the backend instead

  // For now, just pass all funnel info to FunnelCard
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {funnels.map((funnel) => (
        <FunnelCard
          key={funnel.id}
          funnel={funnel}
          onStatusChange={updateFunnelStatus}
        />
      ))}
    </div>
  );
};

export default FunnelList;
