
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Share2, 
  Users, 
  Eye, 
  Play, 
  Pause,
  ExternalLink,
  Calendar,
  BarChart3,
  Tag
} from 'lucide-react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface FunnelListGridProps {
  funnels: InteractiveFunnelWithSteps[];
  onActivate: (funnelId: string, status: 'active' | 'draft' | 'archived') => void;
  onEdit: (funnelId: string) => void;
  onShare: (funnelId: string) => void;
  onViewLeads: (funnelId: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  active: 'Attivo',
  draft: 'Bozza',
  archived: 'Archiviato'
};

const categoryColors: Record<string, string> = {
  'saas': 'bg-blue-100 text-blue-800',
  'b2b': 'bg-purple-100 text-purple-800',
  'ecommerce': 'bg-orange-100 text-orange-800',
  'content': 'bg-green-100 text-green-800',
  'consultation': 'bg-teal-100 text-teal-800',
  'services': 'bg-indigo-100 text-indigo-800',
  'real_estate': 'bg-amber-100 text-amber-800',
  'healthcare': 'bg-pink-100 text-pink-800',
  'education': 'bg-cyan-100 text-cyan-800',
  'finance': 'bg-emerald-100 text-emerald-800',
  'insurance': 'bg-violet-100 text-violet-800'
};

const FunnelListGrid: React.FC<FunnelListGridProps> = ({
  funnels,
  onActivate,
  onEdit,
  onShare,
  onViewLeads
}) => {
  const openFunnelPreview = (shareToken: string) => {
    if (shareToken) {
      window.open(`/shared-interactive-funnel/${shareToken}`, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {funnels.map((funnel) => (
        <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2 mb-2">
                  {funnel.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={statusColors[funnel.status]}>
                    {statusLabels[funnel.status]}
                  </Badge>
                  {funnel.funnel_type && (
                    <Badge 
                      variant="outline" 
                      className={categoryColors[funnel.funnel_type.category] || 'bg-gray-100 text-gray-800'}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {funnel.funnel_type.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {funnel.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {funnel.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-semibold">{funnel.interactive_funnel_steps?.length || 0}</div>
                <div className="text-xs text-gray-600">Step</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {funnel.views_count || 0}
                </div>
                <div className="text-xs text-gray-600">Visite</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <Users className="w-4 h-4 mr-1" />
                  {funnel.submissions_count || 0}
                </div>
                <div className="text-xs text-gray-600">Lead</div>
              </div>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Creato {formatDistanceToNow(new Date(funnel.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(funnel.id)}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Modifica
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewLeads(funnel.id)}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Lead
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(funnel.id)}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Condividi
              </Button>

              {funnel.share_token && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openFunnelPreview(funnel.share_token!)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant={funnel.status === 'active' ? 'secondary' : 'default'}
                onClick={() => onActivate(
                  funnel.id, 
                  funnel.status === 'active' ? 'draft' : 'active'
                )}
              >
                {funnel.status === 'active' ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FunnelListGrid;
