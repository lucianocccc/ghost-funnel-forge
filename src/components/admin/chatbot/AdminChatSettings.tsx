
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { ChatBotSettings } from '@/types/chatbot';

interface AdminChatSettingsProps {
  settings: ChatBotSettings;
  onSaveSettings: (settings: ChatBotSettings) => void;
}

const AdminChatSettings: React.FC<AdminChatSettingsProps> = ({
  settings,
  onSaveSettings
}) => {
  const [currentSettings, setCurrentSettings] = useState<ChatBotSettings>({...settings});
  
  const handleChange = (field: keyof ChatBotSettings, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    onSaveSettings(currentSettings);
  };
  
  const handleReset = () => {
    setCurrentSettings({...settings});
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-golden" />
          <h2 className="text-xl font-semibold text-white">Personalizza il tuo Assistente AI</h2>
        </div>
        
        <p className="text-gray-300 mb-6">
          Configura il comportamento e lo stile dell'assistente AI in base alle tue preferenze.
          Le modifiche verranno applicate a tutte le conversazioni future.
        </p>

        <div className="space-y-8">
          {/* Personality Section */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Personalità</h3>
              
              <RadioGroup 
                value={currentSettings.personality}
                onValueChange={(value) => handleChange('personality', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional" id="professional" className="border-golden text-golden" />
                  <Label htmlFor="professional" className="text-white cursor-pointer">Professionale</Label>
                  <span className="text-xs text-gray-400 ml-2">(Tono formale e orientato ai risultati)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friendly" id="friendly" className="border-golden text-golden" />
                  <Label htmlFor="friendly" className="text-white cursor-pointer">Amichevole</Label>
                  <span className="text-xs text-gray-400 ml-2">(Tono cordiale e conversazionale)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="analytical" id="analytical" className="border-golden text-golden" />
                  <Label htmlFor="analytical" className="text-white cursor-pointer">Analitico</Label>
                  <span className="text-xs text-gray-400 ml-2">(Focus su dati e analisi dettagliate)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creative" id="creative" className="border-golden text-golden" />
                  <Label htmlFor="creative" className="text-white cursor-pointer">Creativo</Label>
                  <span className="text-xs text-gray-400 ml-2">(Pensiero laterale e soluzioni innovative)</span>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Response Length Section */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Lunghezza delle risposte</h3>
              
              <RadioGroup 
                value={currentSettings.responseLength}
                onValueChange={(value) => handleChange('responseLength', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="concise" id="concise" className="border-golden text-golden" />
                  <Label htmlFor="concise" className="text-white cursor-pointer">Concise</Label>
                  <span className="text-xs text-gray-400 ml-2">(Risposte brevi e al punto)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="detailed" className="border-golden text-golden" />
                  <Label htmlFor="detailed" className="text-white cursor-pointer">Dettagliate</Label>
                  <span className="text-xs text-gray-400 ml-2">(Risposte con spiegazioni e contesto)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comprehensive" id="comprehensive" className="border-golden text-golden" />
                  <Label htmlFor="comprehensive" className="text-white cursor-pointer">Complete</Label>
                  <span className="text-xs text-gray-400 ml-2">(Risposte esaustive e approfondite)</span>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Specialization Section */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Specializzazione</h3>
              
              <RadioGroup 
                value={currentSettings.specialization}
                onValueChange={(value) => handleChange('specialization', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="marketing" id="marketing" className="border-golden text-golden" />
                  <Label htmlFor="marketing" className="text-white cursor-pointer">Marketing</Label>
                  <span className="text-xs text-gray-400 ml-2">(Focus su strategie e contenuti di marketing)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sales" id="sales" className="border-golden text-golden" />
                  <Label htmlFor="sales" className="text-white cursor-pointer">Vendite</Label>
                  <span className="text-xs text-gray-400 ml-2">(Orientato alla conversione e alla vendita)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" className="border-golden text-golden" />
                  <Label htmlFor="technical" className="text-white cursor-pointer">Tecnico</Label>
                  <span className="text-xs text-gray-400 ml-2">(Conoscenze tecniche e implementazioni)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" className="border-golden text-golden" />
                  <Label htmlFor="general" className="text-white cursor-pointer">Generale</Label>
                  <span className="text-xs text-gray-400 ml-2">(Bilanciato tra tutti gli aspetti)</span>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Language Section */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Lingua</h3>
              
              <RadioGroup 
                value={currentSettings.language}
                onValueChange={(value) => handleChange('language', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="italian" id="italian" className="border-golden text-golden" />
                  <Label htmlFor="italian" className="text-white cursor-pointer">Italiano</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="english" id="english" className="border-golden text-golden" />
                  <Label htmlFor="english" className="text-white cursor-pointer">Inglese</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Temperature Slider */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Creatività (Temperature)</h3>
                <span className="text-golden font-semibold">{currentSettings.temperature.toFixed(1)}</span>
              </div>
              
              <Slider
                value={[currentSettings.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => handleChange('temperature', value[0])}
                className="my-4"
              />
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Preciso</span>
                <span>Bilanciato</span>
                <span>Creativo</span>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Un valore più basso produce risposte più deterministiche e coerenti.
                Un valore più alto produce risposte più diverse e creative.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Ripristina
            </Button>
            <Button
              onClick={handleSave}
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Salva Impostazioni
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatSettings;
