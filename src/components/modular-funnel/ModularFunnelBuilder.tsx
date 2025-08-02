import React, { useState, useEffect } from 'react';
import { Plus, Settings, Eye, Save, Wand2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useModularFunnelConfig, FunnelSection } from '@/hooks/useModularFunnelConfig';
import { useFunnelSectionLibrary } from '@/hooks/useFunnelSectionLibrary';
import { useModularFunnelGeneration } from '@/hooks/useModularFunnelGeneration';
import { FunnelConfigForm } from './FunnelConfigForm';
import { SectionLibrary } from './SectionLibrary';
import { FunnelCanvas } from './FunnelCanvas';
import { GenerationPanel } from './GenerationPanel';
import { FunnelPreview } from './FunnelPreview';

interface ModularFunnelBuilderProps {
  configId?: string;
  onBack?: () => void;
}

export const ModularFunnelBuilder: React.FC<ModularFunnelBuilderProps> = ({
  configId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { 
    selectedConfig, 
    setSelectedConfig, 
    updateConfig, 
    loading: configLoading 
  } = useModularFunnelConfig();
  
  const { 
    sections: librarySection, 
    loading: libraryLoading 
  } = useFunnelSectionLibrary();
  
  const { 
    generateFunnel, 
    currentGeneration, 
    loading: generationLoading 
  } = useModularFunnelGeneration();

  // Load config if provided
  useEffect(() => {
    if (configId && !selectedConfig) {
      // Load specific config - this would typically be done in the hook
      // For now, we'll assume the config is loaded via the parent component
    }
  }, [configId, selectedConfig]);

  const handleSaveConfig = async () => {
    if (!selectedConfig?.id) {
      toast({
        title: "Errore",
        description: "Nessuna configurazione da salvare",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateConfig(selectedConfig.id, selectedConfig);
      toast({
        title: "Successo",
        description: "Configurazione salvata con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la configurazione",
        variant: "destructive"
      });
    }
  };

  const handleAddSection = (sectionTemplate: any) => {
    if (!selectedConfig) return;

    const newSection: FunnelSection = {
      id: `section-${Date.now()}`,
      section_type: sectionTemplate.section_type,
      position: selectedConfig.sections_config.length,
      config: {
        template_id: sectionTemplate.id,
        template_name: sectionTemplate.section_name,
        content: sectionTemplate.content_template,
        options: sectionTemplate.configuration_options
      },
      is_enabled: true
    };

    const updatedSections = [...selectedConfig.sections_config, newSection];
    
    setSelectedConfig({
      ...selectedConfig,
      sections_config: updatedSections
    });

    toast({
      title: "Sezione aggiunta",
      description: `${sectionTemplate.section_name} aggiunta al funnel`
    });
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!selectedConfig) return;

    const updatedSections = selectedConfig.sections_config
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({
        ...section,
        position: index
      }));

    setSelectedConfig({
      ...selectedConfig,
      sections_config: updatedSections
    });

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }

    toast({
      title: "Sezione rimossa",
      description: "Sezione eliminata dal funnel"
    });
  };

  const handleReorderSections = (newSections: FunnelSection[]) => {
    if (!selectedConfig) return;

    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      position: index
    }));

    setSelectedConfig({
      ...selectedConfig,
      sections_config: reorderedSections
    });
  };

  const handleGenerateWithAI = async (prompt: string, options: any) => {
    if (!selectedConfig) return;

    try {
      await generateFunnel({
        config_id: selectedConfig.id,
        custom_prompt: prompt,
        target_audience: selectedConfig.target_audience || '',
        industry: selectedConfig.industry || '',
        objectives: [selectedConfig.funnel_objective || ''],
        advanced_options: options
      });

      toast({
        title: "Generazione avviata",
        description: "L'AI sta generando il tuo funnel. Ti notificheremo quando sarà pronto."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione AI",
        variant: "destructive"
      });
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedConfig) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">
          Seleziona o crea una configurazione funnel per iniziare
        </h3>
        <FunnelConfigForm onConfigCreated={setSelectedConfig} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold">{selectedConfig.config_name}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedConfig.industry} • {selectedConfig.target_audience}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Anteprima
            </Button>
            <Button
              size="sm"
              onClick={handleSaveConfig}
              disabled={configLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salva
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-4 mt-4">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="library">Libreria</TabsTrigger>
            <TabsTrigger value="ai">AI Generator</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/20">
              <TabsContent value="design" className="mt-0 h-full">
                <div className="p-4">
                  <h3 className="font-medium mb-4">Sezioni del Funnel</h3>
                  <div className="space-y-2">
                    {selectedConfig.sections_config.map((section) => (
                      <Card 
                        key={section.id}
                        className={`cursor-pointer transition-colors ${
                          selectedSectionId === section.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedSectionId(section.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {section.config.template_name || section.section_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Posizione {section.position + 1}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSection(section.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="library" className="mt-0 h-full">
                <SectionLibrary
                  sections={librarySection}
                  loading={libraryLoading}
                  onAddSection={handleAddSection}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-0 h-full">
                <GenerationPanel
                  onGenerate={handleGenerateWithAI}
                  loading={generationLoading}
                  currentGeneration={currentGeneration}
                  config={selectedConfig}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 h-full">
                <div className="p-4">
                  <h3 className="font-medium mb-4">Impostazioni Globali</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tema</label>
                      <select className="w-full mt-1 p-2 border rounded-md bg-background">
                        <option value="professional">Professionale</option>
                        <option value="modern">Moderno</option>
                        <option value="creative">Creativo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Colore Primario</label>
                      <input 
                        type="color" 
                        className="w-full mt-1 h-10 border rounded-md"
                        defaultValue="#007bff"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Canvas */}
            <div className="flex-1">
              <FunnelCanvas
                sections={selectedConfig.sections_config}
                selectedSectionId={selectedSectionId}
                onSectionSelect={setSelectedSectionId}
                onSectionsReorder={handleReorderSections}
                onSectionUpdate={(sectionId, updates) => {
                  const updatedSections = selectedConfig.sections_config.map(section =>
                    section.id === sectionId ? { ...section, ...updates } : section
                  );
                  setSelectedConfig({
                    ...selectedConfig,
                    sections_config: updatedSections
                  });
                }}
              />
            </div>
          </div>
        </Tabs>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <FunnelPreview
          config={selectedConfig}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};