
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { LeadFilters, BusinessAreaWithSubAreas } from '@/types/consolidatedLeads';

interface ConsolidatedLeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  businessAreas: BusinessAreaWithSubAreas[];
}

const ConsolidatedLeadsFilters: React.FC<ConsolidatedLeadsFiltersProps> = ({
  filters,
  onFiltersChange,
  businessAreas
}) => {
  const selectedBusinessArea = businessAreas.find(area => area.id === filters.business_area_id);
  const subAreas = selectedBusinessArea?.business_sub_areas || [];

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset sub-area if business area changes
    if (key === 'business_area_id') {
      newFilters.business_sub_area_id = undefined;
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca per nome, email, azienda..."
              value={filters.search_query || ''}
              onChange={(e) => handleFilterChange('search_query', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Business Area */}
          <Select
            value={filters.business_area_id || ''}
            onValueChange={(value) => handleFilterChange('business_area_id', value || undefined)}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Area Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le aree</SelectItem>
              {businessAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sub Area */}
          <Select
            value={filters.business_sub_area_id || ''}
            onValueChange={(value) => handleFilterChange('business_sub_area_id', value || undefined)}
            disabled={!filters.business_area_id}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sottoarea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le sottoaree</SelectItem>
              {subAreas.map((subArea) => (
                <SelectItem key={subArea.id} value={subArea.id}>
                  {subArea.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti gli status</SelectItem>
              <SelectItem value="new">Nuovo</SelectItem>
              <SelectItem value="contacted">Contattato</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="qualified">Qualificato</SelectItem>
              <SelectItem value="converted">Convertito</SelectItem>
              <SelectItem value="lost">Perso</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority_level || ''}
            onValueChange={(value) => handleFilterChange('priority_level', value || undefined)}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Priorità" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le priorità</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Bassa</SelectItem>
            </SelectContent>
          </Select>

          {/* Analysis Filter */}
          <Select
            value={filters.has_ai_analysis?.toString() || ''}
            onValueChange={(value) => handleFilterChange('has_ai_analysis', 
              value === '' ? undefined : value === 'true'
            )}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Analisi AI" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti</SelectItem>
              <SelectItem value="true">Analizzati</SelectItem>
              <SelectItem value="false">Non analizzati</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Pulisci ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.search_query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Ricerca: {filters.search_query}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('search_query', undefined)}
                />
              </Badge>
            )}
            {filters.business_area_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Area: {selectedBusinessArea?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('business_area_id', undefined)}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsolidatedLeadsFilters;
