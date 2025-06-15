
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import { useTestPanel } from './testPanel/useTestPanel';
import TestDataForm from './testPanel/TestDataForm';
import ScoringResults from './testPanel/ScoringResults';

const AdminTestPanel: React.FC = () => {
  const {
    testData,
    setTestData,
    scoreResult,
    handleSimulateScoring,
    handleSendTestEmail
  } = useTestPanel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TestTube className="w-5 h-5" />
          Test AI/Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TestDataForm
            testData={testData}
            setTestData={setTestData}
            onSimulateScoring={handleSimulateScoring}
          />
          
          <ScoringResults
            scoreResult={scoreResult}
            onSendTestEmail={handleSendTestEmail}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTestPanel;
