
import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  selectedTab: "subscription" | "company" | "settings";
  onSelectTab: (tab: "subscription" | "company" | "settings") => void;
}

const tabs = [
  { key: "subscription", label: "Abbonamento" },
  { key: "company", label: "Società" },
  { key: "settings", label: "Impostazioni" },
] as const;

const UserDashboardMenu: React.FC<Props> = ({ selectedTab, onSelectTab }) => (
  <div className="flex gap-2">
    {tabs.map(t => (
      <Button
        key={t.key}
        variant={selectedTab === t.key ? "default" : "outline"}
        className={selectedTab === t.key ? "bg-golden text-black" : ""}
        onClick={() => onSelectTab(t.key)}
      >
        {t.label}
      </Button>
    ))}
  </div>
);

export default UserDashboardMenu;
