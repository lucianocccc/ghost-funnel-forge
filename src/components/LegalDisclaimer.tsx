import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, FileText, Shield } from 'lucide-react';

export function LegalDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <Scale className="w-3 h-3" />
          Note Legali
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Informativa Legale e Conformità Normativa
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Conformità al Codice Deontologico Forense
              </h3>
              <div className="space-y-3">
                <p>
                  ClientStream è progettato nel rispetto del Codice Deontologico Forense (CNF) vigente, 
                  in particolare degli articoli che disciplinano l'informazione e la pubblicità professionale.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Principi Fondamentali:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Veridicità:</strong> Tutte le informazioni devono essere veritiere e verificabili</li>
                    <li><strong>Decoro e Dignità:</strong> Il contenuto deve rispettare il decoro della professione forense</li>
                    <li><strong>Non Comparazione:</strong> Divieto di confronti diretti con altri professionisti</li>
                    <li><strong>Non Captazione:</strong> Divieto di sollecitazione diretta della clientela</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">Limiti della Pubblicità Professionale</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">NON CONSENTITO:</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-200 text-xs">
                    <li>Promesse di risultati specifici</li>
                    <li>Indicazione di percentuali di successo</li>
                    <li>Confronti con altri studi legali</li>
                    <li>Sollecitazione diretta di potenziali clienti</li>
                    <li>Uso di linguaggio sensazionalistico</li>
                    <li>Testimonial di clienti identificabili</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">CONSENTITO:</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-200 text-xs">
                    <li>Informazioni su aree di specializzazione</li>
                    <li>Titoli professionali e accademici</li>
                    <li>Anni di esperienza generica</li>
                    <li>Pubblicazioni e conferenze</li>
                    <li>Lingue parlate</li>
                    <li>Orari e modalità di contatto</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">GDPR e Privacy per Studi Legali</h3>
              <div className="space-y-3">
                <p>
                  I funnel generati da ClientStream includono automaticamente le clausole privacy 
                  specifiche per la professione legale, in conformità al GDPR e alle normative italiane.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Elementi Inclusi:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-200 text-xs">
                    <li>Informativa privacy conforme al segreto professionale</li>
                    <li>Consenso specifico per il trattamento di dati sensibili</li>
                    <li>Clausole sulla conservazione dei dati</li>
                    <li>Diritti dell'interessato (accesso, cancellazione, portabilità)</li>
                    <li>Base giuridica per il trattamento</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">Responsabilità dell'Utilizzatore</h3>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">IMPORTANTE:</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                  L'avvocato o lo studio legale che utilizza ClientStream rimane l'unico responsabile 
                  della conformità dei contenuti pubblicati alle norme deontologiche. È raccomandato 
                  rivedere sempre i contenuti generati prima della pubblicazione e consultare l'Ordine 
                  degli Avvocati di riferimento in caso di dubbi.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">Fonti Normative</h3>
              <div className="text-xs space-y-2">
                <p><strong>Codice Deontologico Forense</strong> - Approvato dal CNF il 31 gennaio 2014</p>
                <p><strong>Articoli di riferimento:</strong> Art. 17-19 (Informazione e pubblicità)</p>
                <p><strong>Regolamento UE 679/2016</strong> - GDPR</p>
                <p><strong>D.Lgs. 196/2003</strong> - Codice Privacy (come modificato dal D.Lgs. 101/2018)</p>
                <p className="text-muted-foreground mt-3">
                  Ultimo aggiornamento: Gennaio 2025 - Basato sulle modifiche al Codice Deontologico pubblicate in G.U.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">Contatti e Segnalazioni</h3>
              <p className="text-xs">
                Per segnalazioni di non conformità o richieste di chiarimenti normativi, 
                contattare il supporto tecnico di ClientStream o consultare l'Ordine degli Avvocati competente.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}