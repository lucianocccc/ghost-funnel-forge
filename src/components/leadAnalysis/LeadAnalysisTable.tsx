
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Brain } from 'lucide-react';

const LeadAnalysisTable: React.FC<{ lead: any }> = ({ lead }) => {
  if (!lead.gpt_analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Analisi Non Disponibile</h3>
        <p className="text-gray-400">Questo lead non è ancora stato analizzato con GPT</p>
      </div>
    );
  }

  const analysis = lead.gpt_analysis;

  return (
    <div className="space-y-6">
      {/* Informazioni Base */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-golden mb-3">Informazioni Base</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Nome:</TableCell>
              <TableCell className="text-white font-medium">{lead.nome}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Email:</TableCell>
              <TableCell className="text-white font-medium">{lead.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Servizio di Interesse:</TableCell>
              <TableCell className="text-white font-medium">{lead.servizio}</TableCell>
            </TableRow>
            {analysis.categoria_cliente && (
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Categoria Cliente:</TableCell>
                <TableCell className="text-white font-medium">{analysis.categoria_cliente}</TableCell>
              </TableRow>
            )}
            {analysis.priorita && (
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Priorità:</TableCell>
                <TableCell>
                  <Badge className={`ml-2 ${
                    analysis.priorita.toLowerCase() === 'alta' ? 'bg-red-500' :
                      analysis.priorita.toLowerCase() === 'media' ? 'bg-yellow-500' :
                        'bg-green-500'
                  }`}>
                    {analysis.priorita}
                  </Badge>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Analisi del Profilo in tabella */}
      {(analysis.categoria_cliente || analysis.analisi_profilo) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Analisi del Profilo</h3>
          <Table>
            <TableBody>
              {analysis.categoria_cliente && (
                <TableRow>
                  <TableCell className="font-medium text-gray-400 w-1/4">Categoria Cliente</TableCell>
                  <TableCell className="text-white">{analysis.categoria_cliente}</TableCell>
                </TableRow>
              )}
              {analysis.analisi_profilo && (
                <TableRow>
                  <TableCell className="font-medium text-gray-400 w-1/4">Analisi Dettagliata</TableCell>
                  <TableCell className="text-white leading-relaxed">{analysis.analisi_profilo}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Funnel Personalizzato */}
      {Array.isArray(analysis.funnel_personalizzato) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Funnel Personalizzato</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-left text-gray-400">Step</TableHead>
                <TableHead className="text-left text-gray-400">Azione Strategica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.funnel_personalizzato.map((step: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-blue-400 font-bold">{index + 1}</TableCell>
                  <TableCell className="text-white">{step}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Strategie di Approccio (in tabella) */}
      {Array.isArray(analysis.strategie_approccio) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Strategie di Approccio</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Strategia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.strategie_approccio.map((strategia: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-golden">{index + 1}</TableCell>
                  <TableCell className="text-white">{strategia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Punti di Dolore in tabella */}
      {Array.isArray(analysis.punti_dolore) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Punti di Dolore Identificati</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Punto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.punti_dolore.map((punto: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-red-400">{index + 1}</TableCell>
                  <TableCell className="text-white">{punto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Opportunità in tabella */}
      {Array.isArray(analysis.opportunita) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Opportunità di Business</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Opportunità</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.opportunita.map((opp: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-green-400">{index + 1}</TableCell>
                  <TableCell className="text-white">{opp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Prossimi Passi in tabella */}
      {Array.isArray(analysis.next_steps) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Piano d'Azione</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-left text-gray-400">Priorità</TableHead>
                <TableHead className="text-left text-gray-400">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.next_steps.map((step: string, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge className={`
                      ${index === 0 ? 'bg-red-500 text-white' :
                        index === 1 ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-white'}
                      font-bold
                    `}>
                      {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{step}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bio se presente */}
      {lead.bio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Biografia</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Bio</TableCell>
                <TableCell className="text-white leading-relaxed">{lead.bio}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeadAnalysisTable;
