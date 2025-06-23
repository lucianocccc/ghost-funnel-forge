
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Users, Share, Check, Archive, MoreVertical, Eye } from 'lucide-react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

interface FunnelManagementCardProps {
  funnel: InteractiveFunnelWithSteps;
  onEdit: (funnelId: string) => void;
  onViewLeads: (funnelId: string) => void;
  onShare: (funnelId: string) => void;
  onArchive: (funnelId: string) => void;
  onActivate: (funnelId: string) => void;
}

const FunnelManagementCard: React.FC<FunnelManagementCardProps> = ({
  funnel,
  onEdit,
  onViewLeads,
  onShare,
  onArchive,
  onActivate
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{funnel.name}</CardTitle>
            {funnel.description && (
              <p className="text-sm text-gray-600">{funnel.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{funnel.interactive_funnel_steps?.length || 0} step</span>
              <span>•</span>
              <span>{funnel.views_count || 0} visualizzazioni</span>
              <span>•</span>
              <span>{funnel.submissions_count || 0} conversioni</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(funnel.status || 'draft')}>
              {funnel.status || 'draft'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => onEdit(funnel.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica Step
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewLeads(funnel.id)}>
                  <Users className="w-4 h-4 mr-2" />
                  Vedi Lead ({funnel.submissions_count || 0})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(funnel.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  Condividi
                </DropdownMenuItem>
                {funnel.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onActivate(funnel.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Approva e Attiva
                  </DropdownMenuItem>
                )}
                {funnel.status === 'active' && (
                  <DropdownMenuItem onClick={() => onArchive(funnel.id)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archivia
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Creato: {new Date(funnel.created_at!).toLocaleDateString()}</span>
            {funnel.is_public && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Pubblico
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(funnel.id)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Modifica
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewLeads(funnel.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Lead
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelManagementCard;
