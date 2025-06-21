
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeadsData } from '@/hooks/useLeadsData';
import { Search, Filter, User, Mail, Calendar, AlertCircle } from 'lucide-react';

const LeadManagement: React.FC = () => {
  const { leads, loading, filters, setFilters } = useLeadsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'alfabetico' | 'urgenza' | 'data'>('data');

  // Filtra i lead in base alla ricerca
  const filteredLeads = leads.filter(lead =>
    lead.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.servizio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordina i lead in base al criterio selezionato
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'alfabetico':
        return (a.nome || '').localeCompare(b.nome || '');
      case 'urgenza':
        const urgencyOrder = { 'nuovo': 0, 'contattato': 1, 'in_trattativa': 2, 'chiuso_vinto': 3, 'chiuso_perso': 4 };
        return urgencyOrder[a.status] - urgencyOrder[b.status];
      case 'data':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuovo': return 'bg-blue-100 text-blue-800';
      case 'contattato': return 'bg-yellow-100 text-yellow-800';
      case 'in_trattativa': return 'bg-orange-100 text-orange-800';
      case 'chiuso_vinto': return 'bg-green-100 text-green-800';
      case 'chiuso_perso': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (status: string) => {
    if (status === 'nuovo' || status === 'contattato') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Filtri */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Lead</h2>
          <p className="text-gray-600">Monitora e gestisci tutti i tuoi lead</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca per nome, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Ordinamento */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordina per..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data">Data (più recenti)</SelectItem>
              <SelectItem value="alfabetico">Alfabetico (A-Z)</SelectItem>
              <SelectItem value="urgenza">Urgenza</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Status */}
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtra per status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli status</SelectItem>
              <SelectItem value="nuovo">Nuovi</SelectItem>
              <SelectItem value="contattato">Contattati</SelectItem>
              <SelectItem value="in_trattativa">In trattativa</SelectItem>
              <SelectItem value="chiuso_vinto">Chiusi vinti</SelectItem>
              <SelectItem value="chiuso_perso">Chiusi persi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistiche Rapide */}
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

      {/* Lista Lead */}
      {sortedLeads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filters.status !== 'all' ? 'Nessun lead trovato' : 'Nessun lead ancora'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filters.status !== 'all' 
                ? 'Prova a modificare i filtri di ricerca'
                : 'I lead appariranno qui quando qualcuno compilerà i tuoi funnel'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-black" />
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {lead.nome || 'Nome non disponibile'}
                        </h3>
                        {getUrgencyIcon(lead.status)}
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
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    
                    {lead.gpt_analysis && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Analizzato
                      </Badge>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Dettagli
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
