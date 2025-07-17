
import React from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { IntelligentProductShowcase } from '@/components/intelligent-product-showcase/IntelligentProductShowcase';

interface ProductLandingPageProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ 
  funnel, 
  onComplete 
}) => {
  console.log('ProductLandingPage using intelligent cinematic system:', {
    funnelId: funnel.id,
    name: funnel.name,
    isProductSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType
  });

  // Extract product context from funnel settings
  const productName = funnel.name || 'Prodotto Innovativo';
  const productDescription = funnel.description || 'Una soluzione rivoluzionaria per il tuo business';
  
  // Determine industry and style from settings
  const industry = funnel.settings?.industry || 'general';
  const visualStyle = funnel.settings?.visualStyle || 'dynamic';
  const targetAudience = funnel.settings?.targetAudience || 'Professionisti ambiziosi';

  const handleLeadCapture = (leadData: any) => {
    console.log('🎯 Lead captured from intelligent cinematic funnel:', leadData);
    // Here you could send the lead data to your backend
    onComplete();
  };

  return (
    <IntelligentProductShowcase
      productName={productName}
      productDescription={productDescription}
      targetAudience={targetAudience}
      industry={industry}
      visualStyle={visualStyle}
      onLeadCapture={handleLeadCapture}
      className="min-h-screen"
    />
  );
};

export default ProductLandingPage;
