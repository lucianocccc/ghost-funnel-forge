import React from 'react';
import { X, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModularFunnelConfig } from '@/hooks/useModularFunnelConfig';

interface FunnelPreviewProps {
  config: ModularFunnelConfig;
  onClose: () => void;
}

export const FunnelPreview: React.FC<FunnelPreviewProps> = ({
  config,
  onClose
}) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getViewportClasses = () => {
    switch (viewMode) {
      case 'tablet':
        return 'max-w-2xl';
      case 'mobile':
        return 'max-w-sm';
      default:
        return 'max-w-6xl';
    }
  };

  const renderSectionPreview = (section: any, index: number) => {
    const content = section.config?.content || {};
    
    switch (section.section_type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {content.headline || 'Titolo Principale Hero'}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {content.subheadline || 'Sottotitolo accattivante che spiega il valore'}
            </p>
            <Button size="lg" variant="secondary">
              {content.cta_text || 'Call to Action'}
            </Button>
          </div>
        );
      
      case 'problem_solution':
        return (
          <div className="py-16 px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Il Problema</h3>
                <p className="text-muted-foreground">
                  {content.problem_description || 'Descrizione del problema che il cliente sta affrontando'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">La Soluzione</h3>
                <p className="text-muted-foreground">
                  {content.solution_description || 'Come la tua soluzione risolve il problema'}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'social_proof':
        return (
          <div className="py-16 px-8 bg-muted/50">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-8">Cosa Dicono i Nostri Clienti</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Cliente {i}</p>
                        <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Testimonianza incredibile del cliente che racconta il suo successo..."
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'lead_capture':
        return (
          <div className="py-16 px-8">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4">
                {content.form_title || 'Ricevi Accesso Gratuito'}
              </h3>
              <p className="text-muted-foreground mb-8">
                {content.form_subtitle || 'Inserisci i tuoi dati per iniziare'}
              </p>
              <Card className="p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    className="w-full p-3 border rounded-md"
                    disabled
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded-md"
                    disabled
                  />
                  <Button className="w-full" size="lg">
                    {content.submit_text || 'Ottieni Accesso Ora'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {content.privacy_text || 'I tuoi dati sono al sicuro con noi'}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        );
      
      case 'urgency':
        return (
          <div className="py-8 px-8 bg-red-50 border-y border-red-200">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold text-red-700 mb-4">
                ⏰ Offerta Limitata nel Tempo!
              </h3>
              <div className="flex justify-center gap-4 mb-4">
                {['23', '59', '45'].map((time, i) => (
                  <div key={i} className="bg-red-600 text-white p-3 rounded font-bold text-xl min-w-[50px]">
                    {time}
                  </div>
                ))}
              </div>
              <p className="text-red-600 font-medium">
                {content.countdown_text || 'Non perdere questa occasione unica!'}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="py-12 px-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">
                {content.title || `Sezione ${section.section_type}`}
              </h3>
              <p className="text-muted-foreground">
                {content.description || 'Contenuto della sezione personalizzabile'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{config.config_name}</h2>
            <p className="text-sm text-muted-foreground">Anteprima Funnel</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-muted/20 p-8">
          <div className={`mx-auto bg-background rounded-lg shadow-lg overflow-hidden ${getViewportClasses()}`}>
            {config.sections_config
              .sort((a, b) => a.position - b.position)
              .map((section, index) => (
                <div key={section.id}>
                  {renderSectionPreview(section, index)}
                  {index < config.sections_config.length - 1 && (
                    <div className="border-b border-border/50" />
                  )}
                </div>
              ))}
            
            {config.sections_config.length === 0 && (
              <div className="p-16 text-center text-muted-foreground">
                <p>Nessuna sezione da visualizzare</p>
                <p className="text-sm">Aggiungi sezioni per vedere l'anteprima</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};