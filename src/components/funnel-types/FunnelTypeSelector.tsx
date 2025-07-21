
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Zap, Users, Target, Briefcase, ShoppingCart, GraduationCap, DollarSign, Heart, Home, BookOpen } from 'lucide-react';
import { fetchFunnelTypes, groupFunnelTypesByCategory, type FunnelType } from '@/services/funnelTypesService';
import { useToast } from '@/hooks/use-toast';

interface FunnelTypeSelectorProps {
  onSelectType: (type: FunnelType) => void;
  onGenerateWithoutType: (prompt: string) => void;
}

// Icone per le categorie
const categoryIcons: Record<string, React.ReactNode> = {
  'saas': <Zap className="w-5 h-5" />,
  'b2b': <Briefcase className="w-5 h-5" />,
  'ecommerce': <ShoppingCart className="w-5 h-5" />,
  'content': <BookOpen className="w-5 h-5" />,
  'consultation': <Users className="w-5 h-5" />,
  'services': <Target className="w-5 h-5" />,
  'real_estate': <Home className="w-5 h-5" />,
  'healthcare': <Heart className="w-5 h-5" />,
  'education': <GraduationCap className="w-5 h-5" />,
  'finance': <DollarSign className="w-5 h-5" />,
  'insurance': <DollarSign className="w-5 h-5" />
};

// Traduzioni per le categorie
const categoryLabels: Record<string, string> = {
  'saas': 'SaaS & Software',
  'b2b': 'B2B & Corporate',
  'ecommerce': 'E-commerce & Retail',
  'content': 'Content Marketing',
  'consultation': 'Consulenza',
  'services': 'Servizi Professionali',
  'real_estate': 'Immobiliare',
  'healthcare': 'Sanità & Benessere',
  'education': 'Formazione & Educazione',
  'finance': 'Finanza & Investimenti',
  'insurance': 'Assicurazioni'
};

// Colori per i livelli di complessità
const complexityColors: Record<string, string> = {
  'basic': 'bg-green-100 text-green-800',
  'intermediate': 'bg-yellow-100 text-yellow-800',
  'advanced': 'bg-red-100 text-red-800'
};

const FunnelTypeSelector: React.FC<FunnelTypeSelectorProps> = ({
  onSelectType,
  onGenerateWithoutType
}) => {
  const [funnelTypes, setFunnelTypes] = useState<FunnelType[]>([]);
  const [groupedTypes, setGroupedTypes] = useState<Record<string, FunnelType[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFunnelTypes();
  }, []);

  const loadFunnelTypes = async () => {
    try {
      const types = await fetchFunnelTypes();
      setFunnelTypes(types);
      setGroupedTypes(groupFunnelTypesByCategory(types));
    } catch (error) {
      console.error('Error loading funnel types:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei tipi di funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = funnelTypes.filter(type => {
    const matchesSearch = !searchQuery || 
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || type.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(groupedTypes).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Seleziona il Tipo di Funnel</h2>
        <p className="text-gray-600">
          Scegli un template specializzato o genera un funnel personalizzato
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

      {/* Griglia dei tipi di funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => (
          <Card 
            key={type.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-golden"
            onClick={() => onSelectType(type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {categoryIcons[type.category]}
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </div>
                <Badge 
                  className={`text-xs ${complexityColors[type.complexity_level || 'intermediate']}`}
                >
                  {type.complexity_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {type.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[type.category] || type.category}
                </Badge>
                {type.industry && (
                  <Badge variant="outline" className="text-xs">
                    {type.industry}
                  </Badge>
                )}
                {type.target_audience && (
                  <Badge variant="outline" className="text-xs">
                    {type.target_audience}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {type.template_steps.length} passi predefiniti
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nessun tipo di funnel trovato con i filtri selezionati.</p>
        </div>
      )}

      {/* Opzione personalizzata */}
      <div className="border-t pt-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">O genera un funnel personalizzato</h3>
          <p className="text-gray-600 text-sm">
            Descrivevi il tuo business e genereremo un funnel su misura
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

export default FunnelTypeSelector;
