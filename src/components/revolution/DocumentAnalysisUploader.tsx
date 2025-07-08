// Ghost Funnel Revolution - AI Document Analysis Component

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { DocumentAnalysisService } from '@/services/revolutionServices';
import { DocumentAnalysis } from '@/types/revolutionTypes';

interface DocumentAnalysisUploaderProps {
  onAnalysisComplete?: (analysis: DocumentAnalysis) => void;
}

export const DocumentAnalysisUploader: React.FC<DocumentAnalysisUploaderProps> = ({
  onAnalysisComplete
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentAnalysis[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('audience_analysis');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File troppo grande",
            description: `${file.name} supera il limite di 10MB`,
            variant: "destructive",
          });
          continue;
        }

        const analysis = await DocumentAnalysisService.uploadAndAnalyze(file, selectedPurpose);
        setUploadedDocuments(prev => [...prev, analysis]);
        
        toast({
          title: "🚀 Documento caricato!",
          description: `${file.name} è in elaborazione. L'AI sta analizzando il contenuto...`,
        });

        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Errore nell'upload",
        description: "Si è verificato un errore durante il caricamento. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedPurpose, toast, onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true,
    disabled: isUploading
  });

  const purposeOptions = [
    {
      id: 'audience_analysis',
      label: 'Analisi Audience',
      icon: Users,
      description: 'Identifica target, demographics e psychographics'
    },
    {
      id: 'competitor_research',
      label: 'Ricerca Competitor',
      icon: Target,
      description: 'Analizza competitor e posizionamento di mercato'
    },
    {
      id: 'content_strategy',
      label: 'Strategia Contenuti',
      icon: FileText,
      description: 'Ottimizza messaggi e contenuti per la conversione'
    },
    {
      id: 'market_research',
      label: 'Ricerca di Mercato',
      icon: TrendingUp,
      description: 'Identifica opportunità e trend di mercato'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Analisi Completata';
      case 'processing':
        return 'Elaborazione in Corso...';
      case 'failed':
        return 'Elaborazione Fallita';
      default:
        return 'In Attesa';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-primary/20 transition-all duration-300 hover:border-primary/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Analisi Documentale AI-Powered
          </CardTitle>
          <CardDescription>
            Carica documenti per un'analisi intelligente del tuo mercato, audience e strategia.
            Supportati: PDF, DOCX, TXT, Immagini (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Purpose Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Seleziona il tipo di analisi:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {purposeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPurpose === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPurpose(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              {isUploading ? (
                <div className="space-y-2">
                  <div className="text-lg font-medium">Caricamento in corso...</div>
                  <Progress value={33} className="w-48" />
                </div>
              ) : isDragActive ? (
                <div className="text-lg font-medium">Rilascia i file qui...</div>
              ) : (
                <>
                  <div className="text-lg font-medium">
                    Trascina i documenti qui o clicca per selezionare
                  </div>
                  <div className="text-sm text-muted-foreground">
                    L'AI analizzerà automaticamente il contenuto per insights strategici
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Features Preview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-900">Insights Automatici</div>
                <div className="text-blue-700">Estrazione intelligente</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-900">Target Analysis</div>
                <div className="text-green-700">Segmentazione avanzata</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="text-sm">
                <div className="font-medium text-purple-900">Opportunità</div>
                <div className="text-purple-700">Business intelligence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documenti in Elaborazione</CardTitle>
            <CardDescription>
              Monitoraggio real-time del progresso dell'analisi AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.document_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.document_type.toUpperCase()} • {new Date(doc.created_at!).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={doc.processing_status === 'completed' ? 'default' : 'secondary'}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(doc.processing_status!)}
                        {getStatusLabel(doc.processing_status!)}
                      </div>
                    </Badge>
                    
                    {doc.processing_status === 'completed' && (
                      <Button size="sm" variant="outline">
                        Visualizza Analisi
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentAnalysisUploader;