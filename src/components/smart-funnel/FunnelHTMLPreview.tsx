import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, Download, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FunnelHTMLPreviewProps {
  htmlContent: string;
  funnelData: any;
  metadata?: any;
}

const FunnelHTMLPreview: React.FC<FunnelHTMLPreviewProps> = ({ 
  htmlContent, 
  funnelData, 
  metadata 
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const copyHTMLToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast({
        title: "HTML Copiato",
        description: "Il codice HTML è stato copiato negli appunti",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il codice HTML",
        variant: "destructive",
      });
    }
  };

  const downloadHTML = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${funnelData.business_name?.replace(/\s+/g, '-') || 'funnel'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Completato",
      description: "Il file HTML è stato scaricato",
    });
  };

  const openInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Landing Page Generata
            </CardTitle>
            <CardDescription>
              {funnelData.business_name} - {funnelData.business_type}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {metadata?.htmlLength ? `${Math.round(metadata.htmlLength / 1000)}KB` : 'HTML'}
            </Badge>
            <Badge variant="secondary">
              {metadata?.structure?.sectionsCount || 0} Sezioni
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'preview' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'code' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="h-4 w-4" />
            HTML
          </button>
        </div>

        {/* Content */}
        {activeTab === 'preview' ? (
          <div className="space-y-4">
            {/* Preview Frame */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="border-b px-4 py-2 bg-muted/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anteprima Landing Page</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-96 border-0"
                  title="Funnel Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={openInNewTab} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apri in Nuova Tab
              </Button>
              <Button onClick={downloadHTML} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Scarica HTML
              </Button>
              <Button onClick={copyHTMLToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copia Codice
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Code Display */}
            <div className="relative">
              <div className="border rounded-lg overflow-hidden">
                <div className="border-b px-4 py-2 bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Codice HTML</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyHTMLToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="p-4 text-sm overflow-auto max-h-96 bg-background">
                  <code>{htmlContent}</code>
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyHTMLToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copia Codice HTML
              </Button>
              <Button onClick={downloadHTML} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Scarica File
              </Button>
            </div>
          </div>
        )}

        {/* Fullscreen Modal */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-7xl w-full h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {funnelData.business_name} - Preview Completo
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0 rounded-lg"
                title="Fullscreen Funnel Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FunnelHTMLPreview;