
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const SubscriptionPanel: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setSubscription(data);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <div>Caricamento informazioni abbonamento...</div>;
  }

  if (!subscription) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <div className="text-gray-500">Nessun abbonamento attivo trovato.</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-lg">Stato:</span>
        {subscription.subscribed ? (
          <Badge className="bg-green-500 text-white">Attivo</Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-200 text-gray-700">Non attivo</Badge>
        )}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Piano:</span>{" "}
        <span>{subscription.subscription_tier || "Nessun piano"}</span>
      </div>
      {subscription.subscription_end && (
        <div className="mb-2">
          <span className="font-semibold">Scadenza:</span>{" "}
          <span>{new Date(subscription.subscription_end).toLocaleDateString()}</span>
        </div>
      )}
      <div className="mt-4">
        <span className="text-gray-500 text-sm">
          La gestione degli abbonamenti sarà presto disponibile in quest’area.
        </span>
      </div>
    </div>
  );
};

export default SubscriptionPanel;
