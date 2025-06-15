
import React, { useState } from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Send, X } from 'lucide-react';

interface LeadContactModalProps {
  lead: AdminLead;
  isOpen: boolean;
  onClose: () => void;
}

const LeadContactModal: React.FC<LeadContactModalProps> = ({
  lead,
  isOpen,
  onClose
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Qui potresti integrare con il servizio email esistente
      // Per ora simulo l'invio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Successo",
        description: `Email inviata a ${lead.email}`,
      });
      
      // Reset form e chiudi modal
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio dell'email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Contatta Cliente</h2>
              <p className="text-gray-300">Invio email a: {lead.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Informazioni Lead */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Informazioni Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Nome:</span>
                <p className="text-white font-medium">{lead.nome}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Servizio:</span>
                <p className="text-white font-medium">{lead.servizio}</p>
              </div>
            </div>
          </div>

          {/* Form Email */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                A:
              </label>
              <input
                type="email"
                value={lead.email}
                disabled
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Oggetto: *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inserisci l'oggetto dell'email"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-golden focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Messaggio: *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ciao ${lead.nome},\n\nGrazie per il tuo interesse per ${lead.servizio}.\n\n...`}
                rows={8}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-golden focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              className="bg-golden hover:bg-yellow-600 text-black font-semibold"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Invio...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invia Email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadContactModal;
