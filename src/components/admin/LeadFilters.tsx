
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface LeadFiltersProps {
  filters: {
    status?: string;
    searchQuery?: string;
    hasAnalysis?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  totalLeads: number;
  filteredLeads: number;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFiltersChange,
  totalLeads,
  filteredLeads
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tutti gli stati' },
    { value: 'nuovo', label: 'Nuovo' },
    { value: 'contattato', label: 'Contattato' },
    { value: 'in_trattativa', label: 'In Trattativa' },
    { value: 'chiuso_vinto', label: 'Chiuso Vinto' },
    { value: 'chiuso_perso', label: 'Chiuso Perso' }
  ];

  const analysisOptions = [
    { value: 'all', label: 'Tutti' },
    { value: 'analyzed', label: 'Analizzati' },
    { value: 'not_analyzed', label: 'Non Analizzati' }
  ];

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value
    });
  };

  const handleAnalysisChange = (value: string) => {
    let hasAnalysis: boolean | undefined = undefined;
    if (value === 'analyzed') hasAnalysis = true;
    if (value === 'not_analyzed') hasAnalysis = false;
    
    onFiltersChange({
      ...filters,
      hasAnalysis
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: e.target.value || undefined
    });
  };

  return (
    <Card className="bg-white border-golden border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-golden" />
          <h3 className="font-semibold text-black">Filtri</h3>
          <Badge variant="outline" className="ml-auto">
            {filteredLeads} di {totalLeads} lead
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cerca per nome o email..."
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.hasAnalysis === true 
                ? 'analyzed' 
                : filters.hasAnalysis === false 
                  ? 'not_analyzed' 
                  : 'all'
            }
            onValueChange={handleAnalysisChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Analisi" />
            </SelectTrigger>
            <SelectContent>
              {analysisOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadFilters;
