
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageCircle, Lightbulb, Bug, Send } from 'lucide-react';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  user_email?: string;
}

interface FeedbackSystemProps {
  funnelId?: string;
  showHistory?: boolean;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ 
  funnelId, 
  showHistory = false 
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'destructive' },
    { value: 'feature', label: 'Richiesta Funzionalità', icon: Lightbulb, color: 'default' },
    { value: 'improvement', label: 'Miglioramento', icon: Star, color: 'secondary' },
    { value: 'general', label: 'Feedback Generale', icon: MessageCircle, color: 'outline' }
  ];

  const handleSubmitFeedback = async () => {
    if (!feedbackType || !message.trim() || rating === 0) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const feedbackData = {
        type: feedbackType,
        rating,
        message: message.trim(),
        funnel_id: funnelId || null,
        user_id: user.user?.id || null,
        status: 'new' as const
      };

      console.log('Submitting feedback:', feedbackData);

      // Here we would normally insert into a feedback table
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Feedback Inviato!",
        description: "Grazie per il tuo feedback. Lo useremo per migliorare il prodotto.",
      });

      // Reset form
      setFeedbackType('');
      setRating(0);
      setMessage('');

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio del feedback. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className={`w-8 h-8 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        >
          <Star className="w-full h-full fill-current" />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 ? `${rating}/5` : 'Seleziona una valutazione'}
      </span>
    </div>
  );

  const getTypeConfig = (type: string) => {
    return feedbackTypes.find(t => t.value === type) || feedbackTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Invia Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo di Feedback</label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tipo di feedback" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Valutazione</label>
            {renderStarRating()}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Messaggio</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descrivi il tuo feedback in dettaglio..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSubmitFeedback}
            disabled={isSubmitting || !feedbackType || !message.trim() || rating === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Invio in corso...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Invia Feedback
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback History (if enabled) */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Cronologia Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nessun feedback ancora inviato
              </p>
            ) : (
              <div className="space-y-4">
                {feedbackHistory.map((feedback) => {
                  const typeConfig = getTypeConfig(feedback.type);
                  return (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <typeConfig.icon className="w-4 h-4" />
                          <span className="font-medium">{typeConfig.label}</span>
                          <Badge variant={typeConfig.color as any}>
                            {feedback.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{feedback.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(feedback.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackSystem;
