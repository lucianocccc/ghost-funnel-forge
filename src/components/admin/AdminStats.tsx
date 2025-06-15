
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Brain, 
  TrendingUp
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    total: number;
    analyzed: number;
    nuovo: number;
    inTrattativa: number;
    chiusoVinto: number;
  };
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="bg-white border-golden border">
        <CardContent className="p-4 text-center">
          <Users className="w-8 h-8 text-golden mx-auto mb-2" />
          <p className="text-2xl font-bold text-black">{stats.total}</p>
          <p className="text-sm text-gray-600">Lead Totali</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-golden border">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-black">{stats.analyzed}</p>
          <p className="text-sm text-gray-600">Analizzati</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-golden border">
        <CardContent className="p-4 text-center">
          <Badge className="w-8 h-8 bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-2 text-lg font-bold">
            N
          </Badge>
          <p className="text-2xl font-bold text-black">{stats.nuovo}</p>
          <p className="text-sm text-gray-600">Nuovi</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-golden border">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-black">{stats.inTrattativa}</p>
          <p className="text-sm text-gray-600">In Trattativa</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-golden border">
        <CardContent className="p-4 text-center">
          <Badge className="w-8 h-8 bg-green-100 text-green-800 flex items-center justify-center mx-auto mb-2 text-lg font-bold">
            ✓
          </Badge>
          <p className="text-2xl font-bold text-black">{stats.chiusoVinto}</p>
          <p className="text-sm text-gray-600">Chiusi Vinti</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
