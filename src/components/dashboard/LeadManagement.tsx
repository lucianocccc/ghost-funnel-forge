
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLeadsData } from '@/hooks/useLeadsData';
import ConsolidatedLeadManagement from '@/components/consolidated-leads/ConsolidatedLeadManagement';
import { 
  Users, 
  Brain, 
  Target, 
  TrendingUp,
  Search,
  Filter,
  Eye,
  Mail,
  Calendar,
  AlertCircle,
  Phone,
  MessageSquare
} from 'lucide-react';

const LeadManagement: React.FC = () => {
  const { leads, loading } = useLeadsData();
  const [activeTab, setActiveTab] = useState('consolidated');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Lead</h2>
          <p className="text-gray-600">Sistema completo di gestione lead con consolidamento automatico</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consolidated">Lead Consolidati (Nuovo)</TabsTrigger>
          <TabsTrigger value="legacy">Lead Legacy</TabsTrigger>
        </TabsList>

        <TabsContent value="consolidated">
          <ConsolidatedLeadManagement />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          {/* Migration Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Sistema Legacy</h3>
                  <p className="text-sm text-yellow-700">
                    Questi sono i lead del sistema precedente. I nuovi lead vengono automaticamente consolidati nel nuovo sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legacy Lead Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Nuovi</span>
                </div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'nuovo').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">In trattativa</span>
                </div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'in_trattativa').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Vinti</span>
                </div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'chiuso_vinto').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Totali</span>
                </div>
                <p className="text-2xl font-bold">{leads.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Legacy Lead List */}
          {leads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun lead legacy presente
                </h3>
                <p className="text-gray-500">
                  Tutti i nuovi lead vengono automaticamente gestiti nel sistema consolidato
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {lead.nome || 'Nome non disponibile'}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {lead.servizio && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              Servizio: {lead.servizio}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Legacy
                        </Badge>
                        
                        {lead.gpt_analysis && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Analizzato
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadManagement;
