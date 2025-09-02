import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNeuroCopywritingEngine, type NeuroCopywritingRequest } from '@/hooks/useNeuroCopywritingEngine';
import { Brain, Target, Zap, TrendingUp, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NeuroCopywritingTester() {
  const [request, setRequest] = useState<NeuroCopywritingRequest>({
    sectionType: 'hero',
    productName: '',
    industry: 'technology',
    buyerPersona: 'professional_specialist',
    primaryPain: '',
    transformation: '',
    benefits: [],
    socialProof: '',
    scarcityElement: '',
    urgencyReason: '',
    priceAnchor: '',
    guarantee: '',
    objections: []
  });

  const {
    isGenerating,
    copyVariants,
    selectedVariant,
    generateMultipleVariants,
    setSelectedVariant,
    clearVariants
  } = useNeuroCopywritingEngine();

  const handleGenerate = async () => {
    if (!request.productName) {
      return;
    }
    await generateMultipleVariants(request, 3);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const buyerPersonas = [
    { value: 'ceo_executive', label: 'CEO/Executive', description: 'Results-driven, authority-focused' },
    { value: 'manager_director', label: 'Manager/Director', description: 'Performance-driven, team-focused' },
    { value: 'entrepreneur_founder', label: 'Entrepreneur/Founder', description: 'Innovation-driven, growth-focused' },
    { value: 'small_business_owner', label: 'Small Business Owner', description: 'Practical, cost-conscious' },
    { value: 'professional_specialist', label: 'Professional/Specialist', description: 'Expertise-driven, quality-focused' }
  ];

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section', icon: '🎯' },
    { value: 'discovery', label: 'Discovery/Pain', icon: '🔍' },
    { value: 'benefits', label: 'Benefits/Transformation', icon: '✨' },
    { value: 'emotional', label: 'Emotional/Urgency', icon: '❤️' },
    { value: 'conversion', label: 'Final Conversion', icon: '💰' },
    { value: 'qualification', label: 'Qualification', icon: '✅' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Neuro-Copywriting Engine</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate conversion-killer copy using advanced persuasion psychology, buyer persona targeting, and neuro-marketing principles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Set up your conversion-optimized copy generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sectionType">Section Type</Label>
                <Select value={request.sectionType} onValueChange={(value: any) => setRequest(prev => ({ ...prev, sectionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="buyerPersona">Buyer Persona</Label>
                <Select value={request.buyerPersona} onValueChange={(value: any) => setRequest(prev => ({ ...prev, buyerPersona: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buyerPersonas.map(persona => (
                      <SelectItem key={persona.value} value={persona.value}>
                        <div>
                          <div className="font-medium">{persona.label}</div>
                          <div className="text-xs text-muted-foreground">{persona.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={request.productName}
                onChange={(e) => setRequest(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Enter your product/service name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={request.industry}
                  onChange={(e) => setRequest(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., technology, healthcare"
                />
              </div>

              <div>
                <Label htmlFor="socialProof">Social Proof</Label>
                <Input
                  id="socialProof"
                  value={request.socialProof}
                  onChange={(e) => setRequest(prev => ({ ...prev, socialProof: e.target.value }))}
                  placeholder="e.g., 10,000+ customers"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primaryPain">Primary Pain Point</Label>
              <Textarea
                id="primaryPain"
                value={request.primaryPain}
                onChange={(e) => setRequest(prev => ({ ...prev, primaryPain: e.target.value }))}
                placeholder="Main problem your product solves"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="transformation">Key Transformation</Label>
              <Textarea
                id="transformation"
                value={request.transformation}
                onChange={(e) => setRequest(prev => ({ ...prev, transformation: e.target.value }))}
                placeholder="Main benefit/outcome customers get"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scarcityElement">Scarcity Element</Label>
                <Input
                  id="scarcityElement"
                  value={request.scarcityElement}
                  onChange={(e) => setRequest(prev => ({ ...prev, scarcityElement: e.target.value }))}
                  placeholder="e.g., Limited time, Only 50 spots"
                />
              </div>

              <div>
                <Label htmlFor="guarantee">Guarantee</Label>
                <Input
                  id="guarantee"
                  value={request.guarantee}
                  onChange={(e) => setRequest(prev => ({ ...prev, guarantee: e.target.value }))}
                  placeholder="e.g., 30-day money back"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !request.productName}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Variants
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearVariants}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Generated Variants
            </CardTitle>
            <CardDescription>
              Conversion-optimized copy variants ranked by predicted performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {copyVariants.length > 0 ? (
                <div className="space-y-4">
                  {copyVariants.map((variant, index) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedVariant?.id === variant.id 
                            ? 'ring-2 ring-primary' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              Variant {index + 1}
                              {index === 0 && ' - Best Performing'}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {Math.round(variant.performanceScore || 0)}% Score
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(
                                    `${variant.content.title}\n${variant.content.subtitle}\n${variant.content.content}\n${variant.content.cta}`
                                  );
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <div className="font-semibold text-lg">{variant.content.title}</div>
                            <div className="text-muted-foreground">{variant.content.subtitle}</div>
                          </div>
                          <p className="text-sm">{variant.content.content}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{variant.content.cta}</Badge>
                            <div className="text-xs text-muted-foreground">
                              {variant.content.metadata.buyerPersona}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate variants to see conversion-optimized copy</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {selectedVariant && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Variant Details</CardTitle>
            <CardDescription>
              Neuro-psychology analysis and optimization details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Copy Elements</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedVariant.content.title}</div>
                    <div><strong>Subtitle:</strong> {selectedVariant.content.subtitle}</div>
                    <div><strong>Content:</strong> {selectedVariant.content.content}</div>
                    <div><strong>CTA:</strong> {selectedVariant.content.cta}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Psychology Profile</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Buyer Persona:</strong> {selectedVariant.content.metadata.buyerPersona}</div>
                    <div><strong>Psychology:</strong> {selectedVariant.content.metadata.psychologyProfile}</div>
                    <div><strong>Section Type:</strong> {selectedVariant.content.metadata.sectionType}</div>
                    <div><strong>Conversion Optimized:</strong> ✅ Yes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}