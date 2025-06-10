
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Briefcase, FileText, Send, Sparkles, Brain } from 'lucide-react';

interface FormData {
  nome: string;
  email: string;
  servizio: string;
  bio: string;
}

const GhostFunnelForm = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    servizio: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const analyzeWithGPT = async (leadData: FormData) => {
    setIsAnalyzing(true);
    try {
      console.log('Starting GPT analysis for lead:', leadData.email);
      
      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { leadData }
      });

      if (error) {
        console.error('Error calling analyze-lead function:', error);
        toast({
          title: "Analisi GPT",
          description: "Errore durante l'analisi semantica, ma i dati sono stati salvati.",
          variant: "destructive",
        });
        return;
      }

      console.log('GPT analysis completed:', data);
      
      if (data.success) {
        toast({
          title: "🧠 Analisi Completata!",
          description: "I tuoi dati sono stati analizzati da GPT per creare un funnel personalizzato.",
        });
      }
    } catch (error) {
      console.error('Error during GPT analysis:', error);
      toast({
        title: "Analisi GPT",
        description: "Errore durante l'analisi, ma i tuoi dati sono stati salvati.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validazione base
    if (!formData.nome || !formData.email || !formData.servizio) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Tentativo di inserimento dati in Supabase:', formData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            nome: formData.nome,
            email: formData.email,
            servizio: formData.servizio,
            bio: formData.bio || null
          }
        ])
        .select();

      if (error) {
        console.error('Errore Supabase:', error);
        toast({
          title: "Errore",
          description: `Errore durante il salvataggio: ${error.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Dati inseriti con successo:', data);
      
      toast({
        title: "Successo!",
        description: "I tuoi dati sono stati inviati correttamente. Analisi GPT in corso...",
      });

      // Reset form
      setFormData({
        nome: '',
        email: '',
        servizio: '',
        bio: ''
      });

      // Trigger GPT analysis
      await analyzeWithGPT(formData);

    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-golden border-2 shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-golden" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">
            Inizia il Tuo Percorso
          </h2>
          <p className="text-gray-600">
            Compila il form per ricevere una consulenza personalizzata
          </p>
          {isAnalyzing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-black">
              <Brain className="w-5 h-5 text-golden animate-pulse" />
              <span className="text-sm">GPT sta analizzando i tuoi dati...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-black font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-golden" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Inserisci il tuo nome completo"
              className="border-gray-300 focus:border-golden focus:ring-golden text-black"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-golden" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="la-tua-email@esempio.com"
              className="border-gray-300 focus:border-golden focus:ring-golden text-black"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servizio" className="text-black font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-golden" />
              Servizio di Interesse *
            </Label>
            <Input
              id="servizio"
              type="text"
              value={formData.servizio}
              onChange={(e) => handleInputChange('servizio', e.target.value)}
              placeholder="Es. Consulenza Marketing, Web Design, SEO..."
              className="border-gray-300 focus:border-golden focus:ring-golden text-black"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-black font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-golden" />
              Raccontaci di Te
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Descrivi brevemente la tua attività e i tuoi obiettivi..."
              className="border-gray-300 focus:border-golden focus:ring-golden text-black min-h-[100px]"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 transition-all duration-300 hover:shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
                Invio in corso...
              </div>
            ) : isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 animate-pulse" />
                Analisi GPT in corso...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Invia Richiesta
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            I tuoi dati sono al sicuro. Li utilizzeremo solo per contattarti.
          </p>
          {isAnalyzing && (
            <p className="text-xs text-golden mt-2">
              🧠 Stiamo creando un funnel personalizzato per te con l'AI
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GhostFunnelForm;
