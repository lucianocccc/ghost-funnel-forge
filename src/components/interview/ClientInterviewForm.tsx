
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientInterviews } from '@/hooks/useClientInterviews';
import { MessageSquare, Building, Users, Target, DollarSign, Clock } from 'lucide-react';

interface ClientInterviewFormProps {
  onSuccess?: () => void;
}

const ClientInterviewForm: React.FC<ClientInterviewFormProps> = ({ onSuccess }) => {
  const { createInterview } = useClientInterviews();
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
    target_audience: '',
    current_challenges: '',
    goals: '',
    budget_range: '',
    timeline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const interview = await createInterview({
      ...formData,
      interview_data: formData,
      status: 'completed'
    });

    if (interview) {
      setFormData({
        business_name: '',
        business_description: '',
        target_audience: '',
        current_challenges: '',
        goals: '',
        budget_range: '',
        timeline: '',
      });
      onSuccess?.();
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-golden" />
          Intervista Cliente - Questionario di Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nome dell'azienda *
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="Es. ABC Marketing Solutions"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target di riferimento *
              </Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleChange('target_audience', e.target.value)}
                placeholder="Es. PMI, Freelancer, Startup"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Descrizione del business *
            </Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => handleChange('business_description', e.target.value)}
              placeholder="Descrivi in dettaglio la tua attività, i servizi/prodotti offerti..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_challenges">
              Sfide attuali del business
            </Label>
            <Textarea
              id="current_challenges"
              value={formData.current_challenges}
              onChange={(e) => handleChange('current_challenges', e.target.value)}
              placeholder="Quali sono le principali difficoltà che stai affrontando?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">
              Obiettivi da raggiungere
            </Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => handleChange('goals', e.target.value)}
              placeholder="Cosa vuoi ottenere con il funnel? Quali sono i tuoi obiettivi a breve e lungo termine?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget_range" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget disponibile
              </Label>
              <Select value={formData.budget_range} onValueChange={(value) => handleChange('budget_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_1k">Sotto €1.000</SelectItem>
                  <SelectItem value="1k_5k">€1.000 - €5.000</SelectItem>
                  <SelectItem value="5k_10k">€5.000 - €10.000</SelectItem>
                  <SelectItem value="10k_25k">€10.000 - €25.000</SelectItem>
                  <SelectItem value="over_25k">Oltre €25.000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline di implementazione
              </Label>
              <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona la timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediata (entro 1 settimana)</SelectItem>
                  <SelectItem value="short">Breve termine (1-4 settimane)</SelectItem>
                  <SelectItem value="medium">Medio termine (1-3 mesi)</SelectItem>
                  <SelectItem value="long">Lungo termine (3+ mesi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-golden hover:bg-golden/90 text-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Invio in corso...' : 'Completa Intervista'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientInterviewForm;
