export interface BrandStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    subtle: string;
    medium: string;
    strong: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export const brandStyles: Record<string, BrandStyle> = {
  apple: {
    id: 'apple',
    name: 'Apple Minimal',
    description: 'Design minimalista e elegante ispirato ad Apple',
    colors: {
      primary: '210 100% 50%',
      secondary: '210 40% 90%',
      accent: '210 100% 60%',
      background: '0 0% 100%',
      surface: '210 40% 98%',
      text: '210 22% 8%',
      muted: '210 40% 60%',
    },
    typography: {
      headingFont: 'system-ui, -apple-system, sans-serif',
      bodyFont: 'system-ui, -apple-system, sans-serif',
      headingWeight: '600',
      bodyWeight: '400',
    },
    spacing: {
      unit: 8,
      scale: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128],
    },
    borderRadius: {
      small: '6px',
      medium: '12px',
      large: '20px',
    },
    shadows: {
      subtle: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      strong: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  nike: {
    id: 'nike',
    name: 'Nike Dynamic',
    description: 'Design dinamico e energico ispirato a Nike',
    colors: {
      primary: '0 0% 0%',
      secondary: '0 0% 20%',
      accent: '210 100% 50%',
      background: '0 0% 100%',
      surface: '0 0% 98%',
      text: '0 0% 9%',
      muted: '0 0% 45%',
    },
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      headingWeight: '700',
      bodyWeight: '400',
    },
    spacing: {
      unit: 8,
      scale: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64],
    },
    borderRadius: {
      small: '4px',
      medium: '8px',
      large: '16px',
    },
    shadows: {
      subtle: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      medium: '0 8px 16px 0 rgb(0 0 0 / 0.1)',
      strong: '0 24px 48px 0 rgb(0 0 0 / 0.2)',
    },
    animations: {
      duration: '0.2s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Professional',
    description: 'Design professionale e affidabile ispirato ad Amazon',
    colors: {
      primary: '36 100% 50%',
      secondary: '36 70% 90%',
      accent: '200 100% 50%',
      background: '0 0% 100%',
      surface: '36 30% 98%',
      text: '36 45% 15%',
      muted: '36 23% 55%',
    },
    typography: {
      headingFont: 'Amazon Ember, Arial, sans-serif',
      bodyFont: 'Amazon Ember, Arial, sans-serif',
      headingWeight: '500',
      bodyWeight: '400',
    },
    spacing: {
      unit: 8,
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
    },
    borderRadius: {
      small: '3px',
      medium: '6px',
      large: '12px',
    },
    shadows: {
      subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      medium: '0 4px 8px 0 rgb(0 0 0 / 0.1)',
      strong: '0 16px 32px 0 rgb(0 0 0 / 0.15)',
    },
    animations: {
      duration: '0.25s',
      easing: 'ease-in-out',
    },
  },
};

export const getBrandStyle = (brandId: string): BrandStyle => {
  return brandStyles[brandId] || brandStyles.apple;
};

export const applyBrandStyles = (brandId: string) => {
  const style = getBrandStyle(brandId);
  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(style.colors).forEach(([key, value]) => {
    root.style.setProperty(`--brand-${key}`, value);
  });
  
  root.style.setProperty('--brand-font-heading', style.typography.headingFont);
  root.style.setProperty('--brand-font-body', style.typography.bodyFont);
  root.style.setProperty('--brand-weight-heading', style.typography.headingWeight);
  root.style.setProperty('--brand-weight-body', style.typography.bodyWeight);
  
  root.style.setProperty('--brand-radius-sm', style.borderRadius.small);
  root.style.setProperty('--brand-radius-md', style.borderRadius.medium);
  root.style.setProperty('--brand-radius-lg', style.borderRadius.large);
  
  root.style.setProperty('--brand-shadow-subtle', style.shadows.subtle);
  root.style.setProperty('--brand-shadow-medium', style.shadows.medium);
  root.style.setProperty('--brand-shadow-strong', style.shadows.strong);
  
  root.style.setProperty('--brand-duration', style.animations.duration);
  root.style.setProperty('--brand-easing', style.animations.easing);
};