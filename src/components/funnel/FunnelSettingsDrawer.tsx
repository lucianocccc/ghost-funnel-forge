
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";

interface FunnelSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  funnel: any;
}

const FunnelSettingsDrawer: React.FC<FunnelSettingsDrawerProps> = ({ open, onClose, funnel }) => {
  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent className="max-w-md mx-auto p-0 rounded-t-[20px] shadow-2xl">
        <DrawerHeader className="border-b flex justify-between items-center px-6 py-4 bg-golden/20">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-golden" />
            <DrawerTitle>
              Impostazioni di <span className="font-semibold">{funnel.name}</span>
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost" className="rounded-full" aria-label="Chiudi impostazioni">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-6 space-y-5">
          <div>
            <span className="block text-sm text-muted-foreground mb-1">Nome funnel</span>
            <div className="bg-gray-100 px-3 py-2 rounded">{funnel.name}</div>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground mb-1">Tipo funnel</span>
            <div className="bg-gray-100 px-3 py-2 rounded">{funnel?.template?.name || funnel.category || funnel.industry || "-"}</div>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground mb-1">Stato</span>
            <div className="bg-gray-100 px-3 py-2 rounded">{funnel.status}</div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-yellow-900 text-xs">
            In futuro qui saranno aggiunte impostazioni avanzate di modifica/duplicazione/eliminazione funnel.
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FunnelSettingsDrawer;
