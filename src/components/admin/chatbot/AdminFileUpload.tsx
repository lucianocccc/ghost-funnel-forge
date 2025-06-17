
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Image, FileText, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminFileUploadProps {
  onFilesUploaded: (files: any[]) => void;
  uploadedFiles: any[];
}

const AdminFileUpload: React.FC<AdminFileUploadProps> = ({ 
  onFilesUploaded,
  uploadedFiles
}) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  
  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type.includes('pdf')) {
      return 'pdf';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return 'document';
    } else if (file.type.includes('text') || file.type.includes('json') || file.type.includes('xml')) {
      return 'text';
    } else {
      return 'other';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-6 h-6 text-blue-400" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-400" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-400" />;
      case 'text':
        return <FileCode className="w-6 h-6 text-green-400" />;
      default:
        return <File className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    return new Promise<any>((resolve, reject) => {
      const fileType = getFileType(file);
      
      // Create a simple object with file metadata
      const fileData = {
        name: file.name,
        type: fileType,
        size: file.size,
        lastModified: file.lastModified
      };
      
      // If it's an image, read it as data URL
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.content = e.target?.result;
          resolve(fileData);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      }
      // For text files, read as text
      else if (fileType === 'text') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.content = e.target?.result;
          resolve(fileData);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      }
      // For other files, just return metadata
      else {
        resolve(fileData);
      }
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length > 5) {
        toast({
          title: "Troppi file",
          description: "Puoi caricare massimo 5 file alla volta",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const processedFiles = await Promise.all(files.map(processFile));
        onFilesUploaded(processedFiles);
      } catch (error) {
        console.error('Errore nel processamento dei file:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento dei file",
          variant: "destructive",
        });
      }
    }
  }, [onFilesUploaded, toast]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      if (files.length > 5) {
        toast({
          title: "Troppi file",
          description: "Puoi caricare massimo 5 file alla volta",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const processedFiles = await Promise.all(files.map(processFile));
        onFilesUploaded(processedFiles);
      } catch (error) {
        console.error('Errore nel processamento dei file:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento dei file",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    onFilesUploaded(newFiles);
  };

  const handleClearAll = () => {
    onFilesUploaded([]);
  };

  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-golden bg-gray-800/50' : 'border-gray-700 bg-gray-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-white mb-2">Trascina i file qui</h3>
        <p className="text-gray-400 mb-4">Supporta immagini, documenti e file di testo</p>
        
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          accept="image/*,text/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            as="span"
          >
            Seleziona file
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-3">Massimo 5 file, fino a 5MB ciascuno</p>
      </div>
      
      {uploadedFiles.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">File caricati ({uploadedFiles.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-gray-400 hover:text-white"
              >
                Rimuovi tutti
              </Button>
            </div>
            
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-400">
                I file caricati saranno allegati al prossimo messaggio che invierai
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFileUpload;
