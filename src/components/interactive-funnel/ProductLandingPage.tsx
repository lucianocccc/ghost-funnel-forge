
import React, { useEffect } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { IntelligentProductShowcase } from '@/components/intelligent-product-showcase/IntelligentProductShowcase';
import BrandAssetsHero from '@/components/brand/BrandAssetsHero';

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
  
  // Determine industry and style from settings - using correct property names
  const industry = funnel.settings?.industry || 'general';
  const visualStyle = funnel.settings?.customer_facing?.style_theme || 'dynamic';
  const targetAudience = typeof funnel.settings?.target_audience === 'string' 
    ? funnel.settings.target_audience 
    : 'Professionisti ambiziosi';

  const handleLeadCapture = (leadData: any) => {
    console.log('🎯 Lead captured from intelligent cinematic funnel:', leadData);
    // Here you could send the lead data to your backend
    onComplete();
  };

  useEffect(() => {
    const title = `${productName} - Esperienza prodotto`;
    document.title = title.length > 58 ? title.slice(0, 58) : title;

    const descFull = `Scopri ${productName}: ${productDescription}`;
    const desc = descFull.length > 155 ? descFull.slice(0, 155) : descFull;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, [productName, productDescription]);

  return (
    <>
      <BrandAssetsHero
        productName={productName}
        productDescription={productDescription}
        industry={industry}
        visualStyle={visualStyle as 'minimal' | 'dynamic' | 'elegant' | 'technical'}
        className="animate-fade-in"
      />
      <IntelligentProductShowcase
        productName={productName}
        productDescription={productDescription}
        targetAudience={targetAudience}
        industry={industry}
        visualStyle={visualStyle as 'minimal' | 'dynamic' | 'elegant' | 'technical'}
        onLeadCapture={handleLeadCapture}
        className="min-h-screen"
      />
    </>
  );
};

export default ProductLandingPage;
