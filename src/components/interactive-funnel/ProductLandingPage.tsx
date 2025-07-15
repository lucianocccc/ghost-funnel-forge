
import React, { useState, useEffect } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Star, ArrowRight, Shield, Clock, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitFunnelData, trackPageView } from '@/services/productLandingService';

interface ProductLandingPageProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

interface FormData {
  [key: string]: string | boolean;
}

const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ funnel, onComplete }) => {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const { toast } = useToast();

  console.log('ProductLandingPage props:', {
    funnelId: funnel.id,
    funnelName: funnel.name,
    stepsCount: funnel.interactive_funnel_steps?.length || 0,
    steps: funnel.interactive_funnel_steps,
    settings: funnel.settings
  });

  // Track page view on component mount
  useEffect(() => {
    if (funnel.share_token) {
      trackPageView(funnel.id, funnel.share_token);
    }
  }, [funnel.id, funnel.share_token]);

  const productName = funnel.settings?.product_name || funnel.name;
  const primaryColor = funnel.settings?.customer_facing?.brand_colors?.primary || '#D4AF37';
  const heroTitle = funnel.settings?.customer_facing?.hero_title || funnel.name;
  const heroSubtitle = funnel.settings?.customer_facing?.hero_subtitle || funnel.description;
  const valueProposition = funnel.settings?.magneticElements?.valueProposition || 
                          funnel.settings?.customer_facing?.value_proposition || '';
  const urgencyTrigger = funnel.settings?.magneticElements?.urgencyTrigger || '';
  const socialProof = funnel.settings?.magneticElements?.socialProof || '';
  const primaryHook = funnel.settings?.magneticElements?.primaryHook || '';

  const handleInputChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit all form data at once
      await submitFunnelData(funnel.id, formData);
      
      toast({
        title: "Richiesta inviata!",
        description: "Ti contatteremo presto con una proposta personalizzata.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field: any, index: number) => {
    // Validate field structure
    if (!field || typeof field !== 'object') {
      console.warn('Invalid field structure:', field);
      return null;
    }

    const fieldId = field.id || field.name || `field_${index}`;
    const fieldType = field.type || 'text';
    const fieldLabel = field.label || field.title || `Campo ${index + 1}`;
    const fieldPlaceholder = field.placeholder || fieldLabel;
    const fieldRequired = field.required !== false;
    const fieldOptions = Array.isArray(field.options) ? field.options : [];
    const value = formData[fieldId] || '';

    console.log('Rendering field:', {
      fieldId,
      fieldType,
      fieldLabel,
      fieldRequired,
      fieldOptions,
      value
    });

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={fieldId} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {fieldLabel}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              id={fieldId}
              type={fieldType}
              placeholder={fieldPlaceholder}
              value={value as string}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
              required={fieldRequired}
              className="w-full"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldId} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {fieldLabel}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              id={fieldId}
              placeholder={fieldPlaceholder}
              value={value as string}
              onChange={(e) => handleInputChange(fieldId, e.target.value)}
              required={fieldRequired}
              rows={3}
              className="w-full"
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldId} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
              {fieldLabel}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select value={value as string} onValueChange={(val) => handleInputChange(fieldId, val)}>
              <SelectTrigger>
                <SelectValue placeholder={fieldPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {fieldLabel}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {fieldOptions.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldId}-${option}`}
                    name={fieldId}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(fieldId, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor={`${fieldId}-${option}`} className="text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldId} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldId}
              checked={value as boolean}
              onChange={(e) => handleInputChange(fieldId, e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor={fieldId} className="text-sm text-gray-700">
              {fieldLabel}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      default:
        console.warn('Unknown field type:', fieldType);
        return null;
    }
  };

  // Safely extract and validate form fields
  const extractFormFields = () => {
    try {
      const allFields = [];
      
      if (funnel.interactive_funnel_steps && Array.isArray(funnel.interactive_funnel_steps)) {
        for (const step of funnel.interactive_funnel_steps) {
          if (step.step_type === 'form' || step.step_type === 'contact') {
            console.log('Processing step:', step.id, 'fields_config:', step.fields_config);
            
            if (step.fields_config) {
              // Handle different possible formats of fields_config
              if (Array.isArray(step.fields_config)) {
                allFields.push(...step.fields_config);
              } else if (typeof step.fields_config === 'object') {
                // Handle object format
                if (step.fields_config.fields && Array.isArray(step.fields_config.fields)) {
                  allFields.push(...step.fields_config.fields);
                } else {
                  // Convert object to array
                  Object.entries(step.fields_config).forEach(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                      allFields.push({ id: key, ...value });
                    }
                  });
                }
              }
            }
          }
        }
      }
      
      console.log('Extracted form fields:', allFields);
      
      // If no fields found, provide default contact fields
      if (allFields.length === 0) {
        console.log('No fields found, using default contact fields');
        return [
          {
            id: 'name',
            type: 'text',
            label: 'Nome',
            placeholder: 'Il tuo nome',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'La tua email',
            required: true
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Telefono',
            placeholder: 'Il tuo numero di telefono',
            required: false
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Messaggio',
            placeholder: 'Descrivici le tue esigenze...',
            required: false
          }
        ];
      }
      
      return allFields;
    } catch (error) {
      console.error('Error extracting form fields:', error);
      setHasValidationErrors(true);
      return [];
    }
  };

  const allFormFields = extractFormFields();

  // Show error state if there are validation errors
  if (hasValidationErrors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Errore di Configurazione
            </h2>
            <p className="text-gray-600 mb-4">
              Si è verificato un errore nella configurazione del funnel. Per favore riprova più tardi.
            </p>
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
            >
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}CC, ${primaryColor}88)`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
            
            {(valueProposition || primaryHook) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto mb-8">
                <p className="text-lg font-medium">{valueProposition || primaryHook}</p>
              </div>
            )}

            {urgencyTrigger && (
              <Badge variant="secondary" className="mb-8 text-sm px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {urgencyTrigger}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualità Garantita</h3>
              <p className="text-gray-600">Soluzioni professionali di alta qualità</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Esperienza Comprovata</h3>
              <p className="text-gray-600">Anni di esperienza nel settore</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Risultati Eccellenti</h3>
              <p className="text-gray-600">Clienti soddisfatti e risultati garantiti</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Generation Form */}
      <div id="lead-form" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Richiedi una Proposta Personalizzata
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Compila il form qui sotto per ricevere una proposta su misura per le tue esigenze
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Inizia Subito</CardTitle>
              <CardDescription>
                Ti contatteremo entro 24 ore con una proposta personalizzata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {allFormFields.map((field, index) => renderFormField(field, index))}
                </div>

                <Separator />

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 text-lg font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmitting ? 'Invio in corso...' : 'Richiedi Proposta'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Proof Section */}
      {socialProof && (
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-8">Cosa Dicono i Nostri Clienti</h3>
            <div className="bg-gray-50 rounded-lg p-8 max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg text-gray-700 italic">"{socialProof}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action Footer */}
      <div 
        className="py-16 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Pronto a Iniziare con {productName}?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Non aspettare, inizia oggi stesso il tuo percorso verso il successo
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="px-8 py-3 text-lg font-semibold"
            onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Compila il Form Ora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductLandingPage;
