import { useState, useEffect } from 'react';
import { BrandStyle, getBrandStyle, applyBrandStyles } from '@/config/brandStyles';

export const useBrandStyle = (initialBrandId: string = 'apple') => {
  const [currentBrandId, setCurrentBrandId] = useState(initialBrandId);
  const [brandStyle, setBrandStyle] = useState<BrandStyle>(() => getBrandStyle(initialBrandId));

  useEffect(() => {
    const style = getBrandStyle(currentBrandId);
    setBrandStyle(style);
    applyBrandStyles(currentBrandId);
  }, [currentBrandId]);

  const switchBrand = (brandId: string) => {
    setCurrentBrandId(brandId);
  };

  return {
    currentBrandId,
    brandStyle,
    switchBrand,
    availableBrands: ['apple', 'nike', 'amazon'] as const,
  };
};