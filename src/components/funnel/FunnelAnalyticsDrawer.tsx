
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FunnelAnalytics from "../analytics/FunnelAnalytics";
import { BarChart3, X } from "lucide-react";

// Dummy/fake data rimossi! Attenzione: qui è richiesto un vero oggetto metrics in futuro.

interface FunnelAnalyticsDrawerProps {
  open: boolean;
  onClose: () => void;
  funnelName: string;
}

const FunnelAnalyticsDrawer: React.FC<FunnelAnalyticsDrawerProps> = ({ open, onClose, funnelName }) => {
  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent className="max-w-2xl mx-auto p-0 rounded-t-[20px] shadow-2xl">
        <DrawerHeader className="border-b flex justify-between items-center px-6 py-4 bg-golden/20">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-golden" />
            <DrawerTitle>
              Analytics per <span className="font-semibold">{funnelName}</span>
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost" className="rounded-full" aria-label="Chiudi analytics">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[75vh]">
          {/* Niente demoMetrics - mostra un semplice placeholder */}
          <div className="text-center text-gray-400 py-12">
            Nessun dato analytics disponibile per questo funnel.
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FunnelAnalyticsDrawer;
