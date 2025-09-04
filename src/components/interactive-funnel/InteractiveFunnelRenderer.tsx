import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Copy,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InteractiveFunnelRendererProps {
  component: {
    tsx: string;
    metadata: {
      marketAnalysis: any;
      designStrategy: any;
      generatedAt: string;
    };
  };
  funnel: {
    name: string;
    description: string;
    mode: string;
    component_code: string;
  };
  onError?: (error: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  imports: string[];
  components: string[];
}

const InteractiveFunnelRenderer: React.FC<InteractiveFunnelRendererProps> = ({
  component,
  funnel,
  onError
}) => {
  const [showCode, setShowCode] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [renderMode, setRenderMode] = useState<'preview' | 'code' | 'hybrid'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Validate TSX component on mount and when TSX changes
  useEffect(() => {
    validateTSXComponent(component.tsx);
  }, [component.tsx]);

  const validateTSXComponent = async (tsxCode: string): Promise<void> => {
    setIsValidating(true);
    
    try {
      const result = await performTSXValidation(tsxCode);
      setValidation(result);
      
      if (!result.isValid && onError) {
        onError(`TSX Validation failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        isValid: false,
        errors: ['Validation failed: Unknown error'],
        warnings: [],
        imports: [],
        components: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const performTSXValidation = async (tsxCode: string): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const imports: string[] = [];
    const components: string[] = [];

    // Basic syntax validation
    try {
      // Check for balanced braces/brackets
      const openBraces = (tsxCode.match(/\{/g) || []).length;
      const closeBraces = (tsxCode.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push('Unbalanced braces detected');
      }

      const openParens = (tsxCode.match(/\(/g) || []).length;
      const closeParens = (tsxCode.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('Unbalanced parentheses detected');
      }

      // Check for proper React imports
      if (!tsxCode.includes('import React') && !tsxCode.includes('import { useState')) {
        warnings.push('React imports not found - this may cause issues');
      }

      // Extract imports
      const importMatches = tsxCode.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
      imports.push(...importMatches);

      // Extract component names (basic detection)
      const componentMatches = tsxCode.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g) || [];
      components.push(...componentMatches.map(match => match.split(/\s+/).pop() || ''));

      // Check for required exports
      if (!tsxCode.includes('export default') && !tsxCode.includes('export {')) {
        errors.push('No export statement found');
      }

      // Check for dangerous patterns
      if (tsxCode.includes('eval(') || tsxCode.includes('Function(')) {
        errors.push('Potentially dangerous code detected (eval/Function)');
      }

      if (tsxCode.includes('dangerouslySetInnerHTML')) {
        warnings.push('dangerouslySetInnerHTML detected - review for security');
      }

    } catch (syntaxError) {
      errors.push(`Syntax error: ${syntaxError.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      imports,
      components
    };
  };

  const copyCodeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(component.tsx);
      toast({
        title: "Copiato!",
        description: "Il codice TSX è stato copiato negli appunti",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il codice",
        variant: "destructive",
      });
    }
  };

  const downloadTSXFile = () => {
    const blob = new Blob([component.tsx], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${funnel.name.replace(/\s+/g, '')}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download completato",
      description: `${funnel.name}.tsx scaricato con successo`,
    });
  };

  const getValidationStatusColor = () => {
    if (!validation) return 'bg-gray-500';
    if (validation.isValid) return 'bg-green-500';
    return 'bg-red-500';
  };

  const formatGenerationDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-blue-500" />
              <div>
                <CardTitle className="text-xl">{funnel.name}</CardTitle>
                <p className="text-gray-600 text-sm mt-1">{funnel.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                TSX Interactive
              </Badge>
              <div className={`w-3 h-3 rounded-full ${getValidationStatusColor()}`} 
                   title={validation?.isValid ? 'Valid' : 'Invalid'} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Generato il {formatGenerationDate(component.metadata.generatedAt)}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCode ? 'Nascondi Codice' : 'Mostra Codice'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyCodeToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copia
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTSXFile}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              Stato Validazione
              {isValidating && <span className="text-sm text-gray-500">(Validando...)</span>}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Errori:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {validation.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Avvisi:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Import trovati:</strong> {validation.imports.length}
                {validation.imports.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {validation.imports.slice(0, 3).map((imp, index) => (
                      <li key={index} className="truncate">{imp}</li>
                    ))}
                    {validation.imports.length > 3 && <li>... e altri {validation.imports.length - 3}</li>}
                  </ul>
                )}
              </div>
              
              <div>
                <strong>Componenti trovati:</strong> {validation.components.length}
                {validation.components.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {validation.components.map((comp, index) => (
                      <li key={index}>{comp}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Display */}
      {showCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Codice TSX Generato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{component.tsx}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Warning */}
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Anteprima Sicura:</strong> Per motivi di sicurezza, il rendering dinamico del TSX 
              è disabilitato. Il codice generato può essere copiato e utilizzato nel tuo ambiente di sviluppo.
              In futuro sarà disponibile un sistema di anteprima sicura.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Metadata */}
      {component.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Metadati Generazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {component.metadata.marketAnalysis && (
              <div>
                <h4 className="font-semibold mb-2">Analisi di Mercato</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Target Primario:</strong> {component.metadata.marketAnalysis.target_analysis?.primary_audience}
                </div>
              </div>
            )}
            
            {component.metadata.designStrategy && (
              <div>
                <h4 className="font-semibold mb-2">Strategia Design</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Stile Visivo:</strong> {component.metadata.designStrategy.design_system?.visual_style}
                  <br />
                  <strong>Tone of Voice:</strong> {component.metadata.designStrategy.copy_strategy?.tone_of_voice}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveFunnelRenderer;