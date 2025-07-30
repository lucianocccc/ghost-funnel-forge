import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Brain, Target, Eye, Zap, BarChart3 } from 'lucide-react';
import { CreativityParameters, CreativeContext } from '@/services/creativeIntelligenceEngine';
import AdvancedPromptEngine from '@/services/advancedPromptEngine';

interface CreativeControlPanelProps {
  onParametersChange: (parameters: CreativityParameters) => void;
  onContextChange: (context: CreativeContext) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  currentQuality?: number;
}

const CreativeControlPanel: React.FC<CreativeControlPanelProps> = ({
  onParametersChange,
  onContextChange,
  onGenerate,
  isGenerating = false,
  currentQuality = 0
}) => {
  const [parameters, setParameters] = useState<CreativityParameters>({
    linguisticCreativity: 70,
    emotionalResonance: 70,
    marketPsychology: 75,
    visualStorytelling: 70,
    persuasionArchitecture: 80
  });

  const [context, setContext] = useState<CreativeContext>({
    industry: '',
    targetAudience: '',
    productType: '',
    brandPersonality: '',
    competitivePosition: '',
    emotionalTriggers: [],
    painPoints: [],
    desires: []
  });

  const [preset, setPreset] = useState<string>('');

  const parameterConfig = [
    {
      key: 'linguisticCreativity' as keyof CreativityParameters,
      label: 'Linguistic Creativity',
      description: 'Word choice innovation and linguistic artistry',
      icon: Sparkles,
      color: 'text-purple-500'
    },
    {
      key: 'emotionalResonance' as keyof CreativityParameters,
      label: 'Emotional Resonance',
      description: 'Emotional connection and empathy depth',
      icon: Brain,
      color: 'text-pink-500'
    },
    {
      key: 'marketPsychology' as keyof CreativityParameters,
      label: 'Market Psychology',
      description: 'Consumer behavior and decision triggers',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      key: 'visualStorytelling' as keyof CreativityParameters,
      label: 'Visual Storytelling',
      description: 'Visual narrative and imagery power',
      icon: Eye,
      color: 'text-green-500'
    },
    {
      key: 'persuasionArchitecture' as keyof CreativityParameters,
      label: 'Persuasion Architecture',
      description: 'Conversion optimization and influence design',
      icon: Zap,
      color: 'text-orange-500'
    }
  ];

  const industryPresets = {
    tech: { name: 'Technology', emoji: '💻' },
    healthcare: { name: 'Healthcare', emoji: '🏥' },
    finance: { name: 'Finance', emoji: '💰' },
    ecommerce: { name: 'E-commerce', emoji: '🛍️' },
    education: { name: 'Education', emoji: '📚' },
    food: { name: 'Food & Beverage', emoji: '🍽️' },
    fitness: { name: 'Fitness & Wellness', emoji: '💪' },
    travel: { name: 'Travel', emoji: '✈️' }
  };

  const handleParameterChange = useCallback((key: keyof CreativityParameters, value: number[]) => {
    const newParameters = { ...parameters, [key]: value[0] };
    setParameters(newParameters);
    onParametersChange(newParameters);
  }, [parameters, onParametersChange]);

  const handlePresetChange = useCallback((presetKey: string) => {
    setPreset(presetKey);
    // Import CreativeIntelligenceEngine for preset parameters
    import('@/services/creativeIntelligenceEngine').then(({ default: CreativeIntelligenceEngine }) => {
      const engine = CreativeIntelligenceEngine.getInstance();
      const presetParameters = engine.generateBalancedParameters(presetKey);
      setParameters(presetParameters);
      onParametersChange(presetParameters);
    });
    
    setContext(prev => ({ ...prev, industry: presetKey }));
    onContextChange({ ...context, industry: presetKey });
  }, [context, onParametersChange, onContextChange]);

  const handleContextChange = useCallback((field: keyof CreativeContext, value: string | string[]) => {
    const newContext = { ...context, [field]: value };
    setContext(newContext);
    onContextChange(newContext);
  }, [context, onContextChange]);

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-500';
    if (quality >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCreativityScore = () => {
    return Math.round(Object.values(parameters).reduce((sum, val) => sum + val, 0) / 5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Creative Intelligence Control Panel
          </CardTitle>
          <CardDescription>
            Fine-tune creativity parameters for optimal content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parameters">Creativity Parameters</TabsTrigger>
              <TabsTrigger value="context">Context & Targeting</TabsTrigger>
              <TabsTrigger value="analysis">Quality Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-6 mt-6">
              {/* Preset Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Industry Preset</label>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(industryPresets).map(([key, { name, emoji }]) => (
                      <SelectItem key={key} value={key}>
                        {emoji} {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Creativity Parameters */}
              <div className="space-y-6">
                {parameterConfig.map(({ key, label, description, icon: Icon, color }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <label className="text-sm font-medium">{label}</label>
                      </div>
                      <Badge variant="outline">{parameters[key]}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    <Slider
                      value={[parameters[key]]}
                      onValueChange={(value) => handleParameterChange(key, value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Creativity Score */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Creativity Score</span>
                  <Badge className={getQualityColor(getCreativityScore())}>
                    {getCreativityScore()}%
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="context" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Small business owners, 25-45 years old"
                    value={context.targetAudience}
                    onChange={(e) => handleContextChange('targetAudience', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Type</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., SaaS tool, Physical product, Service"
                    value={context.productType}
                    onChange={(e) => handleContextChange('productType', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Personality</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Professional, Innovative, Friendly"
                    value={context.brandPersonality}
                    onChange={(e) => handleContextChange('brandPersonality', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Competitive Position</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Premium alternative, Budget option"
                    value={context.competitivePosition}
                    onChange={(e) => handleContextChange('competitivePosition', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pain Points (comma-separated)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-20"
                  placeholder="e.g., Time consumption, High costs, Complexity"
                  value={context.painPoints.join(', ')}
                  onChange={(e) => handleContextChange('painPoints', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Desires & Goals (comma-separated)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-20"
                  placeholder="e.g., Save time, Increase revenue, Simplify processes"
                  value={context.desires.join(', ')}
                  onChange={(e) => handleContextChange('desires', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className={`text-lg font-bold ${getQualityColor(currentQuality)}`}>
                        {currentQuality}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Content Quality</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-lg font-bold">{getCreativityScore()}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Creativity Score</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-lg font-bold">{parameters.persuasionArchitecture}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Persuasion Power</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Optimization Suggestions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {getCreativityScore() < 70 && (
                    <li>• Consider increasing creativity parameters for more engaging content</li>
                  )}
                  {!context.targetAudience && (
                    <li>• Define your target audience for better personalization</li>
                  )}
                  {context.painPoints.length < 2 && (
                    <li>• Add more pain points to create stronger emotional connections</li>
                  )}
                  {parameters.persuasionArchitecture < 75 && (
                    <li>• Boost persuasion architecture for higher conversion potential</li>
                  )}
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Ready to generate with current settings
            </div>
            <Button 
              onClick={onGenerate} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Creative Content...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Creative Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativeControlPanel;