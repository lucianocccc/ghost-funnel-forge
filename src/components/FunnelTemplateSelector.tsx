
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFunnels } from '@/hooks/useFunnels';
import { Zap, Crown, Play } from 'lucide-react';

interface FunnelTemplateSelectorProps {
  leadId?: string;
  onFunnelCreated?: () => void;
}

const funnelCategoryMap: Record<string, string> = {
  "leadgen": "Generazione Contatti",
  "ecommerce": "Negozio Online",
  "webinar": "Evento Online",
  "tripwire": "Offerta Lampo",
  "highticket": "Vendita Premium",
  "service": "Servizio",
  "newsletter": "Newsletter",
  "booking": "Prenotazione",
};
const funnelIndustryMap: Record<string, string> = {
  "marketing": "Marketing",
  "education": "Istruzione",
  "coaching": "Formazione/Coaching",
  "health": "Salute e Benessere",
  "finance": "Finanza",
  "consulting": "Consulenza",
  "legal": "Legale",
};

function translateCategory(cat?: string) {
  if (!cat) return null;
  return funnelCategoryMap[cat.toLowerCase()] || cat;
}
function translateIndustry(ind?: string) {
  if (!ind) return null;
  return funnelIndustryMap[ind.toLowerCase()] || ind;
}
function translateTemplateDescr(template: any) {
  // Semplifica le descrizioni tecniche se serve, altrimenti lascia la descrizione generica
  if (template.name?.toLowerCase().includes("lead magnet")) {
    return "Attira nuovi clienti offrendo un contenuto gratuito in cambio dei loro dati.";
  }
  if (template.name?.toLowerCase().includes("product launch")) {
    return "Promuovi il lancio di un nuovo prodotto in modo efficace.";
  }
  if (template.name?.toLowerCase().includes("webinar")) {
    return "Guida gli utenti dalla registrazione alla partecipazione a un evento online.";
  }
  if (template.name?.toLowerCase().includes("tripwire")) {
    return "Offri un prodotto o servizio a prezzo scontato subito dopo un lead magnet.";
  }
  if (template.name?.toLowerCase().includes("high-ticket")) {
    return "Funnel pensato per la vendita di servizi a valore elevato.";
  }
  // ... Altre descrizioni personalizzate se necessario
  // RIMUOVI .replace('funnel', 'percorso di vendita')
  // e lascia solo la descrizione originale o sostituisci "lead" con "contatto" dove richiesto
  return template.description?.replace("lead", "contatto") || "";
}

const FunnelTemplateSelector: React.FC<FunnelTemplateSelectorProps> = ({ 
  leadId, 
  onFunnelCreated 
}) => {
  const { templates, createFunnelFromTemplate } = useFunnels();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [funnelName, setFunnelName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFunnel = async () => {
    if (!selectedTemplate || !funnelName.trim()) return;

    const result = await createFunnelFromTemplate(selectedTemplate, funnelName, leadId);
    if (result) {
      setIsDialogOpen(false);
      setFunnelName('');
      setSelectedTemplate(null);
      onFunnelCreated?.();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-golden hover:bg-golden/90 text-black">
          <Zap className="w-4 h-4 mr-2" />
          Crea Funnel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleziona un modello di funnel di vendita</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-golden border-golden' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name?.replace('Funnel', 'Funnel')}</CardTitle>
                    {template.is_premium && (
                      <Badge variant="secondary" className="bg-golden text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{translateTemplateDescr(template)}</p>
                  <div className="flex gap-2">
                    {template.industry && (
                      <Badge variant="outline">{translateIndustry(template.industry)}</Badge>
                    )}
                    {template.category && (
                      <Badge variant="outline">{translateCategory(template.category)}</Badge>
                    )}
                  </div>
                  {template.rating && (
                    <div className="mt-2 text-sm text-gray-500">
                      ⭐ {template.rating.toFixed(1)} • {template.usage_count} utilizzi
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="funnel-name">Nome del funnel</Label>
                <Input
                  id="funnel-name"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Inserisci il nome per il tuo funnel di vendita..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateFunnel}
                  disabled={!funnelName.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Crea Funnel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FunnelTemplateSelector;
