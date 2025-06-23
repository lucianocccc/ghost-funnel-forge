
import React from 'react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import FunnelManagementCard from './FunnelManagementCard';

interface FunnelManagementGridProps {
  funnels: InteractiveFunnelWithSteps[];
  onEdit: (funnelId: string) => void;
  onViewLeads: (funnelId: string) => void;
  onShare: (funnelId: string) => void;
  onArchive: (funnelId: string) => void;
  onActivate: (funnelId: string) => void;
}

const FunnelManagementGrid: React.FC<FunnelManagementGridProps> = ({
  funnels,
  onEdit,
  onViewLeads,
  onShare,
  onArchive,
  onActivate
}) => {
  return (
    <div className="grid gap-4">
      {funnels.map((funnel) => (
        <FunnelManagementCard
          key={funnel.id}
          funnel={funnel}
          onEdit={onEdit}
          onViewLeads={onViewLeads}
          onShare={onShare}
          onArchive={onArchive}
          onActivate={onActivate}
        />
      ))}
    </div>
  );
};

export default FunnelManagementGrid;
