
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Users, Rocket, TrendingUp } from 'lucide-react';

interface DashboardOverviewProps {
  subscription: any;
  canAccessFeature: (feature: string) => boolean;
  freeForAllMode: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  subscription,
  canAccessFeature,
  freeForAllMode
}) => {
  const stats = [
    {
      title: 'Funnel Attivi',
      value: '3',
      icon: Rocket,
      color: 'text-blue-500'
    },
    {
      title: 'Lead Totali',
      value: '247',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Tasso Conversione',
      value: '12.5%',
      icon: TrendingUp,
      color: 'text-golden'
    },
    {
      title: 'Analytics',
      value: 'Avanzate',
      icon: BarChart3,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitora le performance dei tuoi funnel e l'andamento delle conversioni.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {freeForAllMode && (
        <Card className="bg-golden/10 border-golden/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-golden mb-2">
                Modalità Test Attiva
              </h3>
              <p className="text-sm text-muted-foreground">
                Tutte le funzionalità premium sono temporaneamente disponibili gratuitamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverview;
