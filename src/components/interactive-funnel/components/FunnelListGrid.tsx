
import React from 'react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import FunnelListCard from './FunnelListCard';

interface FunnelListGridProps {
  funnels: InteractiveFunnelWithSteps[];
  onActivate: (funnelId: string, status: 'draft' | 'active' | 'archived') => void;
  onEdit: (funnelId: string) => void;
  onShare: (funnelId: string) => void;
  onViewLeads: (funnelId: string) => void;
}

const FunnelListGrid: React.FC<FunnelListGridProps> = ({
  funnels,
  onActivate,
  onEdit,
  onShare,
  onViewLeads
}) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {funnels.map((funnel) => (
        <FunnelListCard
          key={funnel.id}
          funnel={funnel}
          onActivate={onActivate}
          onEdit={onEdit}
          onShare={onShare}
          onViewLeads={onViewLeads}
        />
      ))}
    </div>
  );
};

export default FunnelListGrid;
