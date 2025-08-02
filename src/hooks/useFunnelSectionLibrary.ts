import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FunnelSectionLibraryItem {
  id?: string;
  section_name: string;
  section_type: string;
  category: string;
  description?: string | null;
  content_template: any; // JSONB type
  configuration_options: any; // JSONB type
  industry_tags?: string[];
  use_case_tags?: string[];
  conversion_impact_score?: number;
  complexity_level?: string;
  is_premium?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FunnelSectionFilter {
  category?: string;
  section_type?: string;
  industry?: string;
  complexity_level?: string;
  is_premium?: boolean;
}

export const useFunnelSectionLibrary = () => {
  const [sections, setSections] = useState<FunnelSectionLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [sectionTypes, setSectionTypes] = useState<string[]>([]);
  const { toast } = useToast();

  const loadSections = async (filters?: FunnelSectionFilter) => {
    setLoading(true);
    try {
      let query = supabase
        .from('funnel_section_library')
        .select('*')
        .order('section_name', { ascending: true });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.section_type) {
        query = query.eq('section_type', filters.section_type);
      }
      if (filters?.complexity_level) {
        query = query.eq('complexity_level', filters.complexity_level);
      }
      if (filters?.is_premium !== undefined) {
        query = query.eq('is_premium', filters.is_premium);
      }
      if (filters?.industry) {
        query = query.contains('industry_tags', [filters.industry]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le sezioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      // Get unique categories
      const { data: categoriesData } = await supabase
        .from('funnel_section_library')
        .select('category')
        .not('category', 'is', null);

      // Get unique section types
      const { data: typesData } = await supabase
        .from('funnel_section_library')
        .select('section_type')
        .not('section_type', 'is', null);

      if (categoriesData) {
        const uniqueCategories = [...new Set(categoriesData.map(item => item.category))];
        setCategories(uniqueCategories);
      }

      if (typesData) {
        const uniqueTypes = [...new Set(typesData.map(item => item.section_type))];
        setSectionTypes(uniqueTypes);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const createSection = async (section: Omit<FunnelSectionLibraryItem, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('funnel_section_library')
        .insert({
          section_name: section.section_name,
          section_type: section.section_type,
          category: section.category,
          description: section.description,
          content_template: section.content_template as any,
          configuration_options: section.configuration_options as any,
          industry_tags: section.industry_tags,
          use_case_tags: section.use_case_tags,
          conversion_impact_score: section.conversion_impact_score,
          complexity_level: section.complexity_level,
          is_premium: section.is_premium,
          created_by: user.user?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      setSections(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Sezione creata con successo"
      });

      return data;
    } catch (error) {
      console.error('Error creating section:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la sezione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, updates: Partial<FunnelSectionLibraryItem>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funnel_section_library')
        .update({
          section_name: updates.section_name,
          section_type: updates.section_type,
          category: updates.category,
          description: updates.description,
          content_template: updates.content_template as any,
          configuration_options: updates.configuration_options as any,
          industry_tags: updates.industry_tags,
          use_case_tags: updates.use_case_tags,
          conversion_impact_score: updates.conversion_impact_score,
          complexity_level: updates.complexity_level,
          is_premium: updates.is_premium
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSections(prev => prev.map(section => section.id === id ? data : section));
      toast({
        title: "Successo",
        description: "Sezione aggiornata con successo"
      });

      return data;
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la sezione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('funnel_section_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSections(prev => prev.filter(section => section.id !== id));
      toast({
        title: "Successo",
        description: "Sezione eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la sezione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSectionsByCategory = (category: string) => {
    return sections.filter(section => section.category === category);
  };

  const getSectionsByType = (type: string) => {
    return sections.filter(section => section.section_type === type);
  };

  const searchSections = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return sections.filter(section => 
      section.section_name.toLowerCase().includes(lowercaseQuery) ||
      section.description?.toLowerCase().includes(lowercaseQuery) ||
      section.category.toLowerCase().includes(lowercaseQuery) ||
      section.section_type.toLowerCase().includes(lowercaseQuery)
    );
  };

  useEffect(() => {
    loadSections();
    loadMetadata();
  }, []);

  return {
    sections,
    loading,
    categories,
    sectionTypes,
    loadSections,
    createSection,
    updateSection,
    deleteSection,
    getSectionsByCategory,
    getSectionsByType,
    searchSections
  };
};