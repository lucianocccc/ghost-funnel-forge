import React, { useState } from 'react';
import { Plus, Search, Filter, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FunnelSectionLibraryItem } from '@/hooks/useFunnelSectionLibrary';

interface SectionLibraryProps {
  sections: FunnelSectionLibraryItem[];
  loading: boolean;
  onAddSection: (section: FunnelSectionLibraryItem) => void;
}

export const SectionLibrary: React.FC<SectionLibraryProps> = ({
  sections,
  loading,
  onAddSection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Get unique categories and types
  const categories = ['all', ...new Set(sections.map(s => s.category))];
  const types = ['all', ...new Set(sections.map(s => s.section_type))];

  // Filter sections
  const filteredSections = sections.filter(section => {
    const matchesSearch = section.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesType = selectedType === 'all' || section.section_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca sezioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'Tutte' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'Tutti' : type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredSections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessuna sezione trovata</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <Card key={section.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{section.section_name}</h4>
                      {section.is_premium && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Score: {section.conversion_impact_score || 0}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddSection(section)}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {(section.industry_tags?.length || section.use_case_tags?.length) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {section.industry_tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {section.use_case_tags?.slice(0, 1).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};