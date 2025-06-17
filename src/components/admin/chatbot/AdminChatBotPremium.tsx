
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import PlanUpgradeModal from '@/components/subscription/PlanUpgradeModal';

const AdminChatBotPremium: React.FC = () => {
  const { getCurrentPlan } = useSubscriptionManagement();
  const currentPlan = getCurrentPlan();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-golden mb-4">Piano Premium Richiesto</h1>
        <p className="text-gray-300 mb-6">
          Il chatbot AI personalizzato è disponibile solo per gli abbonamenti premium.
          Aggiorna il tuo piano per accedere a questa potente funzionalità.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">Piano Attuale:</h3>
          <div className="text-golden font-bold text-xl">{currentPlan?.name || 'Gratuito'}</div>
          
          <h3 className="text-white font-semibold mb-3 mt-4">Funzionalità Premium:</h3>
          <ul className="text-left text-gray-300 space-y-2">
            <li>• ChatBot AI personalizzato (Professional+)</li>
            <li>• Analisi DeepThinking (Enterprise)</li>
            <li>• Caricamento e analisi di documenti (Enterprise)</li>
            <li>• Personalizzazione completa dell'assistente</li>
            <li>• Memoria delle conversazioni</li>
            <li>• Analisi AI avanzata</li>
          </ul>
        </div>
        
        <PlanUpgradeModal currentFeature="chatbot">
          <Button className="bg-golden hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded">
            Aggiorna Piano
          </Button>
        </PlanUpgradeModal>
      </div>
    </div>
  );
};

export default AdminChatBotPremium;
