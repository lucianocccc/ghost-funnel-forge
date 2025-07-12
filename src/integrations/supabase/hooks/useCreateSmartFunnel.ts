import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SmartFunnelRequest } from "@/types/interactiveFunnel";
import { toast } from "@/hooks/use-toast";

export const useCreateSmartFunnel = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: SmartFunnelRequest) => {
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { data: result, error } = await supabase.functions.invoke(
        'create-smart-funnel',
        {
          body: {
            ...data,
            userId: user.id,
          },
        }
      );

      if (error) {
        console.error('Error creating smart funnel:', error);
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "🎯 Funnel Intelligente Creato!",
        description: `${data.funnel.name} è stato generato con analisi avanzata e personalizzazione AI.`,
      });
    },
    onError: (error: any) => {
      console.error('Smart funnel creation failed:', error);
      toast({
        title: "Errore nella Creazione",
        description: error.message || "Si è verificato un errore durante la creazione del funnel intelligente",
        variant: "destructive",
      });
    },
  });
};