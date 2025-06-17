
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, Building, Eye } from 'lucide-react';
import { GeneratedFunnel } from '@/hooks/useChatBotFunnels';

interface SharedFunnelInfoProps {
  funnel: GeneratedFunnel;
}

const SharedFunnelInfo: React.FC<SharedFunnelInfoProps> = ({ funnel }) => {
  const funnelData = funnel.funnel_data || {};

  return (
    <div className="space-y-6">
      {/* Header with title and badges */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-golden text-2xl font-bold">
          {funnel.name}
        </h2>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="bg-blue-900 text-blue-300">
            <Eye className="w-3 h-3 mr-1" />
            {funnel.views_count} visualizzazioni
          </Badge>
          <Badge variant="outline" className="border-golden text-golden">
            AI Generated
          </Badge>
        </div>
      </div>

      {/* Description */}
      {funnel.description && (
        <p className="text-gray-300 text-lg">
          {funnel.description}
        </p>
      )}

      {/* Target e Industria */}
      <div className="grid md:grid-cols-2 gap-4">
        {funnelData.target_audience && (
          <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <span className="font-medium text-white">Target Audience</span>
              <p className="text-gray-300">{funnelData.target_audience}</p>
            </div>
          </div>
        )}
        {funnelData.industry && (
          <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
            <Building className="w-6 h-6 text-purple-400" />
            <div>
              <span className="font-medium text-white">Industria</span>
              <p className="text-gray-300">{funnelData.industry}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFunnelInfo;
