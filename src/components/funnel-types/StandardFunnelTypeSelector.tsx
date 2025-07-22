
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, Target, Briefcase, ShoppingCart, GraduationCap, BookOpen, Zap } from 'lucide-react';
import { STANDARD_FUNNEL_STRUCTURES, StandardFunnelStructure, getAllCategories } from '@/services/standardFunnelStructures';

interface StandardFunnelTypeSelectorProps {
  onSelectType: (structure: StandardFunnelStructure) => void;
  onGenerateWithoutType: (prompt: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'content': <BookOpen className="w-5 h-5" />,
  'consultation': <Users className="w-5 h-5" />,
  'saas': <Zap className="w-5 h-5" />,
  'ecommerce': <ShoppingCart className="w-5 h-5" />,
  'education': <GraduationCap className="w-5 h-5" />,
  'services': <Target className="w-5 h-5" />,
  'b2b': <Briefcase className="w-5 h-5" />
};

const categoryLabels: Record<string, string> = {
  'content': 'Content Marketing',
  'consultation': 'Consulenza',
  'saas': 'SaaS & Software',
  'ecommerce': 'E-commerce',
  'education': 'Formazione',
  'services': 'Servizi Professionali',
  'b2b': 'B2B'
};

const complexityColors: Record<string, string> = {
  'basic': 'bg-green-100 text-green-800',
  'intermediate': 'bg-yellow-100 text-yellow-800',
  'advanced': 'bg-red-100 text-red-800'
};

const StandardFunnelTypeSelector: React.FC<StandardFunnelTypeSelectorProps> = ({
  onSelectType,
  onGenerateWithoutType
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const filteredStructures = STANDARD_FUNNEL_STRUCTURES.filter(structure => {
    const matchesSearch = !searchQuery || 
      structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      structure.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      structure.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || structure.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Seleziona il Tipo di Funnel</h2>
        <p className="text-gray-600">
          Scegli una struttura standardizzata o genera un funnel personalizzato
        </p>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca tipi di funnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                <div className="flex items-center gap-2">
                  {categoryIcons[category]}
                  {categoryLabels[category] || category}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Griglia delle strutture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStructures.map((structure) => (
          <Card 
            key={structure.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-golden"
            onClick={() => onSelectType(structure)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {categoryIcons[structure.category]}
                  <CardTitle className="text-lg">{structure.name}</CardTitle>
                </div>
                <Badge 
                  className={`text-xs ${complexityColors[structure.complexity_level]}`}
                >
                  {structure.complexity_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {structure.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[structure.category] || structure.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {structure.industry}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {structure.target_audience}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {structure.steps.length} passi standardizzati
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStructures.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nessuna struttura trovata con i filtri selezionati.</p>
        </div>
      )}

      {/* Opzione personalizzata */}
      <div className="border-t pt-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">O genera un funnel personalizzato</h3>
          <p className="text-gray-600 text-sm">
            Descrivi il tuo business e genereremo un funnel su misura
          </p>
        </div>
        
        {!showCustomForm ? (
          <div className="text-center">
            <Button 
              onClick={() => setShowCustomForm(true)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Genera Funnel Personalizzato
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Descrivi il tuo business e obiettivi
              </label>
              <Input
                placeholder="Es: Sono un consulente finanziario e voglio generare lead qualificati..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (customPrompt.trim()) {
                    onGenerateWithoutType(customPrompt.trim());
                  }
                }}
                disabled={!customPrompt.trim()}
                className="flex-1"
              >
                Genera Funnel
              </Button>
              <Button 
                onClick={() => setShowCustomForm(false)}
                variant="outline"
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardFunnelTypeSelector;
