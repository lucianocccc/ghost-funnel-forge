
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

interface AdminDeepThinkingProps {
  onSubmitQuery: (query: string) => Promise<void>;
  deepThinkingResult: string;
  isLoading: boolean;
}

const AdminDeepThinking: React.FC<AdminDeepThinkingProps> = ({ 
  onSubmitQuery,
  deepThinkingResult,
  isLoading 
}) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      await onSubmitQuery(query);
    }
  };

  // Function to render code blocks and other formatted text
  const formatMessageContent = (content: string) => {
    if (!content) return null;
    
    // Split by code blocks
    const parts = content.split(/```([^`]+)```/);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        return (
          <pre key={index} className="bg-gray-800 p-3 rounded my-2 overflow-x-auto">
            <code>{part}</code>
          </pre>
        );
      } else {
        // Regular text - convert line breaks
        const textWithBreaks = part.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
        
        return <p key={index}>{textWithBreaks}</p>;
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-golden" />
          <h2 className="text-xl font-semibold text-white">Deep Thinking</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Utilizza la modalità Deep Thinking per analisi approfondite e strutturate. 
          Questa modalità permette all'AI di elaborare il tuo input con più tempo e attenzione,
          fornendo risultati dettagliati e organizzati.
        </p>
        
        <form onSubmit={handleSubmit}>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Descrivi un problema complesso o una situazione che richiede un'analisi approfondita..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mb-4 min-h-[150px]"
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="bg-golden hover:bg-yellow-600 text-black"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Avvia Deep Thinking
              </>
            )}
          </Button>
        </form>
      </div>
      
      {(deepThinkingResult || isLoading) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-golden" />
              <h3 className="text-lg font-semibold text-white">Risultato Deep Thinking</h3>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-10 h-10 text-golden animate-spin mb-4" />
                <p className="text-gray-300">Analisi approfondita in corso...</p>
                <p className="text-gray-400 text-sm mt-2">Questo processo potrebbe richiedere più tempo del normale</p>
              </div>
            ) : (
              <div className="text-white prose prose-invert max-w-none">
                {formatMessageContent(deepThinkingResult)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDeepThinking;
