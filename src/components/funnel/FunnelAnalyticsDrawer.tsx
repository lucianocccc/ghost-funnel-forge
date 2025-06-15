
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FunnelAnalytics from "../analytics/FunnelAnalytics";
import { BarChart3, X } from "lucide-react";

// Dummy/fake data (serve solo come demo - personalizza secondo il futuro backend)
const demoMetrics = {
  funnel_id: "1",
  funnel_name: "Demo Funnel",
  visitors: 1200,
  conversions: 340,
  conversion_rate: 28.3,
  avg_time_to_convert: 3.4,
  revenue: 10200,
  step_data: [
    { step_name: "Landing", visitors: 1200, conversions: 700, drop_off_rate: 41.6 },
    { step_name: "Signup", visitors: 700, conversions: 400, drop_off_rate: 42.8 },
    { step_name: "Checkout", visitors: 400, conversions: 340, drop_off_rate: 15.0 },
  ],
  daily_data: [
    { date: "01/06", visitors: 40, conversions: 12 },
    { date: "02/06", visitors: 55, conversions: 13 },
    { date: "03/06", visitors: 60, conversions: 16 },
    { date: "04/06", visitors: 80, conversions: 22 },
    { date: "05/06", visitors: 47, conversions: 10 },
  ]
};

interface FunnelAnalyticsDrawerProps {
  open: boolean;
  onClose: () => void;
  funnelName: string;
  // In futuro si può accettare un vero oggetto metrics
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
          {/* Mostra componente analitico solo se funnelName presente */}
          <FunnelAnalytics metrics={{ ...demoMetrics, funnel_name: funnelName }} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FunnelAnalyticsDrawer;
