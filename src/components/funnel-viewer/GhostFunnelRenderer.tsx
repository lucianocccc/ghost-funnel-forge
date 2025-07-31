import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Heart, Zap, Users, CheckCircle } from 'lucide-react';

interface GhostFunnelRendererProps {
  funnelData: any;
  onFormSubmit: (formData: Record<string, any>) => void;
  formData: Record<string, any>;
  onFormChange: (field: string, value: any) => void;
  submitting: boolean;
}

export const GhostFunnelRenderer: React.FC<GhostFunnelRendererProps> = ({
  funnelData,
  onFormSubmit,
  formData,
  onFormChange,
  submitting
}) => {
  const { hero, advantages, emotional, cta, style, images } = funnelData;

  const getStyleClasses = (brandStyle: string) => {
    switch (brandStyle?.toLowerCase()) {
      case 'apple':
        return {
          hero: 'bg-gradient-to-b from-gray-50 to-white',
          accent: 'text-gray-900',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'bg-white border-gray-200'
        };
      case 'nike':
        return {
          hero: 'bg-gradient-to-br from-black via-gray-900 to-black',
          accent: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600 text-white',
          card: 'bg-gray-900 border-gray-700 text-white'
        };
      case 'amazon':
        return {
          hero: 'bg-gradient-to-r from-blue-900 to-blue-800',
          accent: 'text-orange-400',
          button: 'bg-orange-400 hover:bg-orange-500 text-black',
          card: 'bg-white border-orange-200'
        };
      default:
        return {
          hero: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10',
          accent: 'text-primary',
          button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          card: 'bg-card border-border'
        };
    }
  };

  const styleClasses = getStyleClasses(style);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-20 px-4 ${styleClasses.hero}`}>
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            👻 Ghost AI Funnel
          </Badge>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${styleClasses.accent}`}>
            {hero.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            {hero.subheadline}
          </p>
          <Button size="lg" className={`text-lg px-8 py-4 ${styleClasses.button}`}>
            {hero.cta_text} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage: any, index: number) => (
              <Card key={index} className={`text-center p-6 ${styleClasses.card}`}>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Your Journey Starts Here
            </h2>
            <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
              {emotional.story}
            </p>
          </div>

          {/* Pain Points */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              We Understand Your Challenges
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {emotional.pain_points.map((point: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-destructive/5 rounded-lg">
                  <Heart className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <p className="text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transformation */}
          <div className="text-center p-8 bg-primary/5 rounded-xl">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Transform Your Future</h3>
            <p className="text-lg text-muted-foreground">
              {emotional.transformation}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 ${styleClasses.hero}`}>
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${styleClasses.accent}`}>
            {cta.primary_text}
          </h2>
          <p className="text-xl mb-8 text-muted-foreground">
            {cta.secondary_text}
          </p>
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-8 inline-block">
            <p className="text-orange-700 font-medium">
              ⏰ {cta.urgency}
            </p>
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8">
            <CardContent>
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
                <p className="text-muted-foreground">
                  Fill out the form below to begin your transformation journey.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); onFormSubmit(formData); }} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name || ''}
                    onChange={(e) => onFormChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email || ''}
                    onChange={(e) => onFormChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone || ''}
                    onChange={(e) => onFormChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us more about your needs (optional)"
                    value={formData.message || ''}
                    onChange={(e) => onFormChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full ${styleClasses.button}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Users className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get Started Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brand Style Indicator */}
      <div className="fixed bottom-4 right-4">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
          Style: {style}
        </Badge>
      </div>
    </div>
  );
};