
import React from 'react';
import { AdminLead } from '@/hooks/useAdminLeads';

interface LeadDetailModalBaseInfoProps {
  lead: AdminLead;
}

const LeadDetailModalBaseInfo: React.FC<LeadDetailModalBaseInfoProps> = ({ lead }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-golden mb-3">Informazioni Lead</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-400">Nome:</span>
          <p className="text-white font-medium">{lead.nome}</p>
        </div>
        <div>
          <span className="text-sm text-gray-400">Email:</span>
          <p className="text-white font-medium">{lead.email}</p>
        </div>
        <div>
          <span className="text-sm text-gray-400">Servizio:</span>
          <p className="text-white font-medium">{lead.servizio}</p>
        </div>
        {lead.bio && (
          <div className="col-span-full">
            <span className="text-sm text-gray-400">Bio:</span>
            <p className="text-white">{lead.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailModalBaseInfo;
