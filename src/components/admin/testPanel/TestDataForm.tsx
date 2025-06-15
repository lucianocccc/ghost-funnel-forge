
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TestDataFormProps {
  testData: {
    message: string;
    tone: string;
    urgency: string;
    email: string;
  };
  setTestData: React.Dispatch<React.SetStateAction<{
    message: string;
    tone: string;
    urgency: string;
    email: string;
  }>>;
  onSimulateScoring: () => void;
}

const TestDataForm: React.FC<TestDataFormProps> = ({
  testData,
  setTestData,
  onSimulateScoring
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Messaggio Lead
        </label>
        <Textarea
          placeholder="Inserisci il messaggio del lead..."
          value={testData.message}
          onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tono
          </label>
          <Select value={testData.tone} onValueChange={(value) => setTestData(prev => ({ ...prev, tone: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Seleziona tono" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positivo">Positivo</SelectItem>
              <SelectItem value="neutro">Neutro</SelectItem>
              <SelectItem value="negativo">Negativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Urgenza
          </label>
          <Select value={testData.urgency} onValueChange={(value) => setTestData(prev => ({ ...prev, urgency: value }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Seleziona urgenza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="bassa">Bassa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Test
        </label>
        <Input
          type="email"
          value={testData.email}
          onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <Button 
        onClick={onSimulateScoring}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!testData.message}
      >
        Simula Scoring
      </Button>
    </div>
  );
};

export default TestDataForm;
