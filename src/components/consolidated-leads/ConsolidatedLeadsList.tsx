
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Brain,
  Target,
  TrendingUp,
  Mail,
  Calendar,
  Phone,
  Building2,
  Zap,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';
import EnhancedLeadAnalysisModal from './EnhancedLeadAnalysisModal';

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
  const [selectedLeadForAnalysis, setSelectedLeadForAnalysis] = useState<{ id: string; name: string } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'qualified': return 'bg-purple-500';
      case 'proposal': return 'bg-orange-500';
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return 'Non definita';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun lead consolidato
          </h3>
          <p className="text-gray-500">
            I lead verranno consolidati automaticamente quando i funnel riceveranno sottomissioni
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${compact ? 'max-h-96 overflow-y-auto' : ''}`}>
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {lead.name || 'Nome non disponibile'}
                      </h3>
                      
                      {lead.priority_level && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(lead.priority_level)}`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {getPriorityLabel(lead.priority_level)}
                        </Badge>
                      )}

                      {lead.lead_score && lead.lead_score > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Score: {lead.lead_score}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{lead.email}</span>
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
                          <Building2 className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{lead.company}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {lead.submissions_count > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{lead.submissions_count} sottomissioni</span>
                        </div>
                      )}
                      
                      {lead.business_area && (
                        <Badge variant="secondary" className="text-xs">
                          {lead.business_area.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status || 'new')}`}></div>
                  
                  {lead.ai_analysis && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      <Brain className="w-3 h-3 mr-1" />
                      Analizzato
                    </Badge>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLeadForAnalysis({ 
                        id: lead.id, 
                        name: lead.name || 'Lead senza nome' 
                      })}
                      className="h-8 px-2"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLeadSelect(lead)}
                      className="h-8 px-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Quick insights preview */}
              {lead.ai_analysis && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">
                      {lead.ai_analysis?.summary || 'Analisi AI disponibile'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLeadForAnalysis && (
        <EnhancedLeadAnalysisModal
          isOpen={!!selectedLeadForAnalysis}
          onClose={() => setSelectedLeadForAnalysis(null)}
          leadId={selectedLeadForAnalysis.id}
          leadName={selectedLeadForAnalysis.name}
        />
      )}
    </>
  );
};

export default ConsolidatedLeadsList;
