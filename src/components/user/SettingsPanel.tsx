
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const SettingsPanel: React.FC = () => {
  const { profile, signOut } = useAuth();
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium">Dati personali</h3>
        <div className="mt-2">
          <div><strong>Nome: </strong> {profile?.first_name} {profile?.last_name}</div>
          <div><strong>Email:</strong> {profile?.email}</div>
        </div>
      </div>
      <div>
        <Button variant="destructive" onClick={signOut}>
          Esci
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
