
import React from 'react';
import AdminRoute from '@/components/AdminRoute';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';
import FunnelList from '@/components/FunnelList';

const Funnels = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestione <span className="text-golden">Funnel</span>
              </h1>
              <p className="text-gray-300 mt-2">
                Crea e gestisci i tuoi funnel di vendita personalizzati
              </p>
            </div>
            <FunnelTemplateSelector />
          </div>

          <FunnelList />
        </div>
      </div>
    </AdminRoute>
  );
};

export default Funnels;
