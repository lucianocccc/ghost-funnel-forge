
import React from 'react';
import LeadRowProfileSection from './sections/LeadRowProfileSection';
import LeadRowFunnelSection from './sections/LeadRowFunnelSection';
import LeadRowOpportunitiesSection from './sections/LeadRowOpportunitiesSection';
import LeadRowNextStepsSection from './sections/LeadRowNextStepsSection';

interface LeadRowAnalysisSectionProps {
  type: 'profile' | 'funnel' | 'opportunities' | 'nextSteps';
  title: string;
  icon: React.ReactNode;
  data: any;
  bgColor: string;
}

const LeadRowAnalysisSection: React.FC<LeadRowAnalysisSectionProps> = ({
  type,
  title,
  icon,
  data,
  bgColor
}) => {
  const renderContent = () => {
    switch (type) {
      case 'profile':
        return <LeadRowProfileSection data={data} />;
      case 'funnel':
        return <LeadRowFunnelSection data={data} />;
      case 'opportunities':
        return <LeadRowOpportunitiesSection data={data} />;
      case 'nextSteps':
        return <LeadRowNextStepsSection data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
        {icon}
        {title}
      </h4>
      {renderContent()}
    </div>
  );
};

export default LeadRowAnalysisSection;
