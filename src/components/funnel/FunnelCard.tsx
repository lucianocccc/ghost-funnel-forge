import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Play, Pause, Archive, BarChart3, Settings, Zap, Crown } from "lucide-react";
import FunnelAnalyticsDrawer from "./FunnelAnalyticsDrawer";
import FunnelSettingsDrawer from "./FunnelSettingsDrawer";

interface FunnelCardProps {
  funnel: any;
  onStatusChange: (id: string, status: string) => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

const funnelTypeDisplay: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Lead Magnet Funnel":    { label: "Lead Magnet",    color: "bg-blue-100 text-blue-900", icon: <Zap size={18} /> },
  "Product Launch Funnel": { label: "Lancio Prodotto",color: "bg-green-100 text-green-800", icon: <Crown size={18} /> },
  "Webinar Funnel":        { label: "Webinar",        color: "bg-purple-100 text-purple-800", icon: <BarChart3 size={18}/> },
  "Tripwire Funnel":       { label: "Tripwire",       color: "bg-pink-100 text-pink-800", icon: <Play size={18}/> },
  "High-Ticket Sales Funnel": { label: "High-Ticket", color: "bg-yellow-100 text-yellow-800", icon: <Crown size={18}/> }
};

const statusBadgeConfig = {
  draft:    { label: "Bozza",     variant: "secondary" as const },
  active:   { label: "Attivo",    variant: "default"   as const },
  archived: { label: "Archiviato",variant: "outline"   as const }
};

export const FunnelCard: React.FC<FunnelCardProps> = ({
  funnel,
  onStatusChange,
  onSelect,
  isSelected,
}) => {
  // ADD STATE for drawers
  const [isAnalyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);

  const typeKey = funnel?.funnel_templates?.name || funnel?.category || funnel?.industry || "";
  const typeConfig = funnelTypeDisplay[typeKey] || { label: typeKey, color: "bg-gray-200 text-gray-700", icon: null };

  const getActionButton = () => {
    if (funnel.status === "draft") {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(funnel.id, "active");
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="w-4 h-4 mr-1" />
          Attiva
        </Button>
      );
    }
    if (funnel.status === "active") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(funnel.id, "archived");
          }}
        >
          <Archive className="w-4 h-4 mr-1" />
          Archivia
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(funnel.id, "active");
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Play className="w-4 h-4 mr-1" />
        Riattiva
      </Button>
    );
  };

  return (
    <Card
      className={`min-h-[220px] flex flex-col justify-between hover:ring-2 hover:ring-golden transition relative overflow-visible cursor-pointer ${
        isSelected ? "ring-4 ring-golden" : ""
      }`}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" && onSelect) onSelect();
      }}
      aria-label={`Vedi dettagli funnel ${funnel.name}`}
    >
      <CardHeader className="pb-2">
        <div className="flex gap-2 items-start">
          <div className={`flex flex-col items-center pt-0.5`}>
            <span className={`rounded-full shadow p-1 ${typeConfig.color} mb-1`}>{typeConfig.icon}</span>
            <Badge variant="outline" className="uppercase">{typeConfig.label}</Badge>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1" title={funnel.name}>{funnel.name}</CardTitle>
            {funnel.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{funnel.description}</p>
            )}
          </div>
          <div>
            <Badge variant={statusBadgeConfig[funnel.status]?.variant || "secondary"}>
              {statusBadgeConfig[funnel.status]?.label || funnel.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-row justify-between items-end pt-1">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">
            Creato: <span className="font-semibold">{format(new Date(funnel.created_at), "dd MMM yyyy", {locale: it})}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Passi: <Badge variant="outline">{funnel.funnel_steps?.length || 0} passi</Badge>
          </span>
          {funnel.industry && (
            <span className="text-xs">
              <Badge variant="outline">{funnel.industry}</Badge>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {getActionButton()}
          <Button
            size="sm"
            variant="ghost"
            aria-label="Analytics"
            onClick={e => {
              e.stopPropagation();
              setAnalyticsOpen(true);
            }}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Impostazioni"
            onClick={e => {
              e.stopPropagation();
              setSettingsOpen(true);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
      {funnel?.funnel_templates?.is_premium && (
        <div className="absolute top-1 right-1 px-2 py-0.5 bg-golden text-black text-xs rounded-full shadow flex items-center gap-1 z-10">
          <Crown className="w-3 h-3" /> Premium
        </div>
      )}

      {/* ANALYTICS DRAWER */}
      <FunnelAnalyticsDrawer
        open={isAnalyticsOpen}
        funnelName={funnel.name}
        onClose={() => setAnalyticsOpen(false)}
      />

      {/* SETTINGS DRAWER */}
      <FunnelSettingsDrawer
        open={isSettingsOpen}
        funnel={funnel}
        onClose={() => setSettingsOpen(false)}
      />
    </Card>
  );
};
