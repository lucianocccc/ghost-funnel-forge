
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Crown, Settings, Play, Archive, X } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface FunnelDetailDrawerProps {
  funnel: any | null;
  open: boolean;
  onClose: () => void;
}

const funnelTypeDescriptions: Record<string, string> = {
  "Lead Magnet Funnel": "Attira nuovi potenziali clienti offrendo un valore gratuito (es. e-book, checklist) in cambio dei loro dati.",
  "Product Launch Funnel": "Ottimizzato per lanciare e promuovere un nuovo prodotto, massimizzando interesse e vendite.",
  "Webinar Funnel": "Guida gli utenti dalla registrazione alla partecipazione a un webinar per educarli e convertirli.",
  "Tripwire Funnel": "Offre un prodotto a basso costo subito dopo il lead magnet per trasformare lead in clienti paganti.",
  "High-Ticket Sales Funnel": "Pensato per vendite di servizi o prodotti di alto valore e alto margine, solitamente con consulenze su misura.",
};

const getAvailableFunnelTypes = (funnel: any) => {
  const types = [
    funnel?.template?.name,
    funnel?.category,
    funnel?.industry,
  ].filter(Boolean);
  const generics = [
    "Lead Magnet Funnel",
    "Product Launch Funnel",
    "Webinar Funnel",
    "Tripwire Funnel",
    "High-Ticket Sales Funnel",
  ];
  return Array.from(new Set([...types, ...generics]));
};

export const FunnelDetailDrawer: React.FC<FunnelDetailDrawerProps> = ({
  funnel,
  open,
  onClose,
}) => {
  if (!funnel) return null;

  const [selectedType, setSelectedType] = useState(
    funnel?.template?.name || funnel?.category || funnel?.industry || ""
  );

  const funnelTypes = getAvailableFunnelTypes(funnel);

  // Ritorna la descrizione solamente se presente nella mappa, altrimenti stringa vuota
  const typeDescription = (type: string) => funnelTypeDescriptions[type] || "";

  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent className="max-w-lg mx-auto p-0 rounded-t-[20px] shadow-2xl">
        <DrawerHeader className="border-b flex justify-between items-center px-6 py-4 bg-golden/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{funnel.name}</span>
            {funnel.template?.is_premium && (
              <Badge className="bg-golden text-black flex items-center gap-1 ml-2">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost" className="rounded-full" aria-label="Chiudi dettaglio">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Tipo funnel</span>
            <TooltipProvider>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue>
                      {selectedType
                        ? (
                          funnelTypeDescriptions[selectedType] ? (
                            <span className="capitalize">{selectedType}</span>
                          ) : <span className="capitalize">{selectedType}</span>
                        )
                        : <span className="text-gray-400">Scegli il tipo di funnel</span>
                      }
                    </SelectValue>
                  </SelectTrigger>
                </TooltipTrigger>
                {selectedType && funnelTypeDescriptions[selectedType] && (
                  <TooltipContent sideOffset={10}>
                    {funnelTypeDescriptions[selectedType]}
                  </TooltipContent>
                )}
                <SelectContent>
                  {funnelTypes.map(type =>
                    <Tooltip key={type}>
                      <TooltipTrigger asChild>
                        <SelectItem value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      </TooltipTrigger>
                      {typeDescription(type) && (
                        <TooltipContent side="right" sideOffset={8} className="max-w-xs">
                          {typeDescription(type)}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}
                </SelectContent>
              </Select>
            </TooltipProvider>
          </div>

          {funnel.description && (
            <div>
              <span className="block text-xs text-muted-foreground mb-1">Descrizione</span>
              <p className="text-gray-700">{funnel.description}</p>
            </div>
          )}
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Creato il</span>
            <span className="font-semibold">{format(new Date(funnel.created_at), "dd MMMM yyyy", { locale: it })}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Stato</span>
            <Badge variant="outline">{funnel.status}</Badge>
          </div>
          {funnel.funnel_steps && (
            <div>
              <span className="block text-xs text-muted-foreground mb-1">Step del funnel</span>
              <ul className="list-disc ml-5 text-sm">
                {funnel.funnel_steps.map((step:any) => (
                  <li key={step.id} className="mb-1">
                    <span className="font-medium">{step.title}</span>
                    {step.description ? (
                      <span className="text-gray-500 ml-1">{step.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <span className="inline-block mt-2 text-xs">{funnel.funnel_steps.length} passi totali</span>
            </div>
          )}
          {funnel.industry && (
            <div>
              <span className="block text-xs text-muted-foreground mb-1">Industry</span>
              <Badge variant="outline">{funnel.industry}</Badge>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button size="sm" variant="default" className="gap-1">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button size="sm" variant="outline" className="gap-1">
              <Settings className="w-4 h-4" />
              Impostazioni
            </Button>
            {funnel.status === "active" && (
              <Button size="sm" variant="destructive" className="gap-1">
                <Archive className="w-4 h-4" /> Archivia
              </Button>
            )}
            {funnel.status !== "active" && (
              <Button size="sm" variant="default" className="gap-1">
                <Play className="w-4 h-4" /> Attiva
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
