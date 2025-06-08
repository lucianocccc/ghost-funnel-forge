
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Briefcase, FileText, Send, Sparkles } from 'lucide-react';

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
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      // Simula invio dati
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Dati del form:', formData);
      
      toast({
        title: "Successo!",
        description: "I tuoi dati sono stati inviati correttamente. Ti contatteremo presto!",
      });

      // Reset form
      setFormData({
        nome: '',
        email: '',
        servizio: '',
        bio: ''
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova più tardi.",
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
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 transition-all duration-300 hover:shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
                Invio in corso...
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
        </div>
      </CardContent>
    </Card>
  );
};

export default GhostFunnelForm;
