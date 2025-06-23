
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsolidatedLeadWithDetails } from '@/types/consolidatedLeads';
import { format } from 'date-fns';

interface ConsolidatedLeadSubmissionsTabProps {
  lead: ConsolidatedLeadWithDetails;
}

const ConsolidatedLeadSubmissionsTab: React.FC<ConsolidatedLeadSubmissionsTabProps> = ({
  lead
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission del Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {lead.lead_submissions_mapping && lead.lead_submissions_mapping.length > 0 ? (
          <div className="space-y-4">
            {lead.lead_submissions_mapping.map((mapping) => (
              <div key={mapping.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    Submission #{mapping.submission_id?.slice(0, 8)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(mapping.created_at!), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(mapping.submission_data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nessuna submission disponibile per questo lead
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsolidatedLeadSubmissionsTab;
