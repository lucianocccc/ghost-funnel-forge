
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Brain, 
  Eye, 
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';
import { format } from 'date-fns';

interface ConsolidatedLeadsListProps {
  leads: ConsolidatedLeadWithDetails[];
  loading: boolean;
  onLeadSelect: (lead: ConsolidatedLeadWithDetails) => void;
  onAnalyzeLead: (leadId: string) => void;
  onUpdateLead: (leadId: string, updates: any) => void;
  compact?: boolean;
}

const ConsolidatedLeadsList: React.FC<ConsolidatedLeadsListProps> = ({
  leads,
  loading,
  onLeadSelect,
  onAnalyzeLead,
  onUpdateLead,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-orange-100 text-orange-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun lead trovato
          </h3>
          <p className="text-gray-500">
            I lead consolidati appariranno qui una volta che i visitatori inizieranno a compilare i tuoi funnel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {lead.name || 'Nome non disponibile'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!compact && (
                  <div className="space-y-2">
                    {/* Business Area */}
                    {lead.business_area && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Area:</span>
                        <Badge variant="outline" style={{ 
                          borderColor: lead.business_area.color_hex,
                          color: lead.business_area.color_hex 
                        }}>
                          {lead.business_area.name}
                        </Badge>
                        {lead.business_sub_area && (
                          <Badge variant="outline" className="text-xs">
                            {lead.business_sub_area.name}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(lead.created_at!), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{lead.submissions_count} submission</span>
                      </div>
                      {lead.lead_score > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>Score: {lead.lead_score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Status and Priority */}
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(lead.status!)}>
                    {lead.status}
                  </Badge>
                  <Badge className={getPriorityColor(lead.priority_level!)}>
                    {lead.priority_level}
                  </Badge>
                </div>

                {/* AI Analysis Status */}
                {lead.ai_analysis ? (
                  <Badge variant="default" className="bg-green-600 text-white">
                    <Brain className="w-3 h-3 mr-1" />
                    Analizzato
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyzeLead(lead.id);
                    }}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                )}

                {/* View Details */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeadSelect(lead);
                  }}
                  title="Vedi Dettagli"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConsolidatedLeadsList;
