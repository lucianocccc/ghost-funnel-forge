import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Star, ArrowRight, Sparkles, Shield, Clock, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DynamicProductFunnelProps {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  onLeadCapture?: (data: any) => void;
}

interface FunnelData {
  heroSection: {
    headline: string;
    subheadline: string;
    animation: string;
    backgroundGradient: string;
    ctaText: string;
  };
  productBenefits: Array<{
    title: string;
    description: string;
    icon: string;
    animation: string;
  }>;
  socialProof: {
    testimonials: Array<{
      name: string;
      text: string;
      rating: number;
    }>;
    trustIndicators: string[];
  };
  interactiveDemo: {
    type: string;
    title: string;
    description: string;
    content: string;
  };
  conversionForm: {
    title: string;
    description: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      placeholder: string;
      required: boolean;
      options?: string[];
    }>;
    submitText: string;
    incentive: string;
  };
  animations: {
    entrance: string;
    scroll: string;
    interactions: string;
  };
}

const iconMap: Record<string, React.ComponentType<any>> = {
  star: Star,
  shield: Shield,
  clock: Clock,
  heart: Heart,
  sparkles: Sparkles,
};

export const DynamicProductFunnel: React.FC<DynamicProductFunnelProps> = ({
  productName,
  productDescription,
  targetAudience,
  industry,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const steps = ['hero', 'benefits', 'proof', 'demo', 'form'];

  useEffect(() => {
    generateFunnel();
  }, [productName]);

  const generateFunnel = async () => {
    setLoading(true);
    try {
      console.log('Starting funnel generation for:', productName);
      
      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName,
          productDescription,
          targetAudience,
          industry
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message || error}`);
      }

      if (data?.success) {
        console.log('Funnel generated successfully');
        setFunnelData(data.funnelData);
      } else {
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('Function returned error:', errorMessage);
        
        // Show more specific error messages
        if (errorMessage.includes('OpenAI API error')) {
          toast({
            title: "Errore API",
            description: "Problema con l'API OpenAI. Verifica la configurazione delle chiavi API.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('API key')) {
          toast({
            title: "Chiave API Mancante",
            description: "La chiave API OpenAI non è configurata. Contatta l'amministratore.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Errore Generazione",
            description: `Impossibile generare il funnel: ${errorMessage}`,
            variant: "destructive"
          });
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error generating funnel:', error);
      
      // If we haven't shown a specific toast already, show generic one
      if (!error.message?.includes('OpenAI API error') && !error.message?.includes('API key')) {
        toast({
          title: "Errore",
          description: "Impossibile generare il funnel. Riprova tra qualche minuto.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFormSubmit = async () => {
    setSubmitting(true);
    try {
      const leadData = {
        ...formData,
        productName,
        productDescription,
        generatedAt: new Date().toISOString(),
        funnelType: 'dynamic_product'
      };

      onLeadCapture?.(leadData);

      toast({
        title: "🎉 Perfetto!",
        description: "Le tue informazioni sono state registrate con successo!",
      });

      // Reset form
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Generando il tuo funnel personalizzato...</p>
          <p className="text-sm text-muted-foreground">Sto creando un'esperienza su misura per {productName}</p>
        </div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="text-center p-8">
        <p className="text-lg">Impossibile generare il funnel. Riprova più tardi.</p>
        <Button onClick={generateFunnel} className="mt-4">
          Riprova
        </Button>
      </div>
    );
  }

  const renderHeroSection = () => (
    <div className={`text-center space-y-6 py-16 animate-${funnelData.animations.entrance}`}>
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {funnelData.heroSection.headline}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {funnelData.heroSection.subheadline}
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button size="lg" onClick={handleNext} className="animate-pulse">
          {funnelData.heroSection.ctaText}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div className="space-y-8 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Perché scegliere {productName}?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funnelData.productBenefits.map((benefit, index) => {
          const IconComponent = iconMap[benefit.icon] || Star;
          
          return (
            <Card key={index} className={`p-6 hover:scale-105 transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${index * 0.2}s` }}>
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <Button size="lg" onClick={handleNext}>
          Scopri di più
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  const renderSocialProof = () => (
    <div className="space-y-8 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Cosa dicono i nostri clienti
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funnelData.socialProof.testimonials.map((testimonial, index) => (
          <Card key={index} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
            <CardContent className="p-0 space-y-4">
              <div className="flex space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              <p className="font-semibold">- {testimonial.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {funnelData.socialProof.trustIndicators.map((indicator, index) => (
            <Badge key={index} variant="outline" className="text-sm">
              {indicator}
            </Badge>
          ))}
        </div>
        
        <Button size="lg" onClick={handleNext}>
          Prova tu stesso
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  const renderInteractiveDemo = () => (
    <div className="space-y-8 py-12 text-center">
      <h2 className="text-3xl font-bold mb-4">
        {funnelData.interactiveDemo.title}
      </h2>
      <p className="text-xl text-muted-foreground mb-8">
        {funnelData.interactiveDemo.description}
      </p>
      
      <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-0">
          <div className="space-y-6">
            <div className="text-lg">
              {funnelData.interactiveDemo.content}
            </div>
            
            {/* Simple interactive element */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-center space-y-4">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto animate-pulse" />
                <p className="text-lg font-semibold">Esperienza {productName}</p>
                <p className="text-muted-foreground">Immagina di poter godere di tutti questi benefici ogni giorno!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button size="lg" onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
        Voglio saperne di più!
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-8 py-12 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">
          {funnelData.conversionForm.title}
        </h2>
        <p className="text-lg text-muted-foreground">
          {funnelData.conversionForm.description}
        </p>
        <Badge className="bg-green-100 text-green-800 border-green-300">
          🎁 {funnelData.conversionForm.incentive}
        </Badge>
      </div>
      
      <Card className="p-8">
        <CardContent className="p-0 space-y-6">
          {funnelData.conversionForm.fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <Select onValueChange={(value) => handleInputChange(field.name, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option, optIndex) => (
                      <SelectItem key={optIndex} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          
          <Button
            size="lg"
            onClick={handleFormSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Elaborazione...
              </div>
            ) : (
              <>
                {funnelData.conversionForm.submitText}
                <Sparkles className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep]) {
      case 'hero':
        return renderHeroSection();
      case 'benefits':
        return renderBenefits();
      case 'proof':
        return renderSocialProof();
      case 'demo':
        return renderInteractiveDemo();
      case 'form':
        return renderForm();
      default:
        return renderHeroSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="pt-6 pb-4">
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        {renderCurrentStep()}
      </div>
    </div>
  );
};