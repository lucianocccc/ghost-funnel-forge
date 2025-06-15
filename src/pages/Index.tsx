
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FunnelTemplateSelector from "@/components/FunnelTemplateSelector";
import GhostFunnelForm from "@/components/GhostFunnelForm";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface IndexProps {
  // Define any props for the Index page here
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFunnelCreated = () => {
    toast({
      title: "Funnel Creato!",
      description: "Il tuo nuovo funnel è pronto per essere personalizzato.",
    })
  };

  return (
    <div className="min-h-screen relative">
      {/* Bottone invisibile per accesso admin */}
      <Link 
        to="/auth" 
        className="absolute top-4 right-4 w-8 h-8 opacity-0 hover:opacity-10 transition-opacity z-50"
        aria-label="Admin Access"
      >
        <div className="w-full h-full"></div>
      </Link>

      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Lead Funnel Dashboard</h1>
        <nav>
          <ul className="flex gap-4">
            <li>
              <Link to="/leads" className="hover:underline">
                Leads
              </Link>
            </li>
            <li>
              <Link to="/funnels" className="hover:underline">
                Funnels
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/dashboard"
                  className="bg-golden text-black px-3 py-1 rounded font-semibold"
                >
                  Area Utente
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="p-4">
        {/* Form principale per lead */}
        <section className="mb-8">
          <GhostFunnelForm />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Strumenti Avanzati</h2>
          <p className="mb-4">
            Crea funnel personalizzati o analizza i tuoi leads esistenti.
          </p>
          <div className="flex gap-4">
            <FunnelTemplateSelector onFunnelCreated={handleFunnelCreated} />
            <Link to="/leads">
              <Button variant="secondary">
                Vai ai Leads
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Funzionalità in Arrivo <Sparkles className="inline-block" />
          </h2>
          <ul className="list-disc pl-5">
            <li>Integrazione con Zapier e Make</li>
            <li>Automazioni avanzate</li>
            <li>Reportistica dettagliata</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Index;
