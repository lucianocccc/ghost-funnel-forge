interface BackgroundConfig {
  elements: string[];
  backgroundGradient: string;
  environmentDescription: string;
  particleType: 'falling' | 'floating' | 'rising' | 'static';
  density: number;
}

export const generateCreativeBackground = (
  productName: string, 
  industry: string, 
  productDescription?: string
): BackgroundConfig => {
  const product = productName.toLowerCase();
  const desc = productDescription?.toLowerCase() || '';

  // Analizza il prodotto e genera background creativi
  if (product.includes('mirtill') || product.includes('berry') || product.includes('frutt')) {
    return {
      elements: ['🫐', '💙', '🔵', '🟣'],
      backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #581c87 100%)',
      environmentDescription: 'cascata_mirtilli_realistici',
      particleType: 'falling',
      density: 100
    };
  }

  if (product.includes('pane') || product.includes('farina') || product.includes('bread') || product.includes('wheat')) {
    return {
      elements: ['🌾', '🟤', '🟡', '🤎'],
      backgroundGradient: 'linear-gradient(135deg, #92400e 0%, #d97706 30%, #f59e0b 60%, #fbbf24 100%)',
      environmentDescription: 'grani_farina_volano',
      particleType: 'floating',
      density: 80
    };
  }

  if (product.includes('latte') || product.includes('milk') || product.includes('formaggio')) {
    return {
      elements: ['🥛', '⚪', '💧', '🤍'],
      backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #cbd5e1 60%, #94a3b8 100%)',
      environmentDescription: 'gocce_latte_cadono',
      particleType: 'falling',
      density: 60
    };
  }

  if (product.includes('yoga') || product.includes('fitness') || product.includes('sport') || product.includes('wellness')) {
    return {
      elements: ['🧘‍♀️', '🧘‍♂️', '💚', '🌿'],
      backgroundGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 30%, #059669 60%, #10b981 100%)',
      environmentDescription: 'palestra_zen_persone_yoga',
      particleType: 'floating',
      density: 40
    };
  }

  if (product.includes('caffè') || product.includes('coffee') || product.includes('espresso')) {
    return {
      elements: ['☕', '🫘', '💨', '🤎'],
      backgroundGradient: 'linear-gradient(135deg, #451a03 0%, #7c2d12 30%, #a16207 60%, #ca8a04 100%)',
      environmentDescription: 'chicchi_caffè_vapore',
      particleType: 'rising',
      density: 70
    };
  }

  if (product.includes('tech') || product.includes('app') || product.includes('software') || product.includes('digital')) {
    return {
      elements: ['⚡', '💻', '🔮', '✨'],
      backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 30%, #4f46e5 60%, #7c3aed 100%)',
      environmentDescription: 'particelle_digitali_futuristiche',
      particleType: 'floating',
      density: 90
    };
  }

  if (product.includes('casa') || product.includes('home') || product.includes('arredamento')) {
    return {
      elements: ['🏠', '🪴', '✨', '🤍'],
      backgroundGradient: 'linear-gradient(135deg, #374151 0%, #4b5563 30%, #6b7280 60%, #9ca3af 100%)',
      environmentDescription: 'ambiente_casa_accogliente',
      particleType: 'static',
      density: 30
    };
  }

  if (product.includes('beauty') || product.includes('bellezza') || product.includes('cosmet')) {
    return {
      elements: ['💄', '✨', '🌸', '💗'],
      backgroundGradient: 'linear-gradient(135deg, #be185d 0%, #db2777 30%, #ec4899 60%, #f472b6 100%)',
      environmentDescription: 'petali_rosa_brillantini',
      particleType: 'floating',
      density: 85
    };
  }

  if (product.includes('travel') || product.includes('viaggio') || product.includes('tourism')) {
    return {
      elements: ['✈️', '🌍', '⭐', '☁️'],
      backgroundGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 30%, #0284c7 60%, #0ea5e9 100%)',
      environmentDescription: 'nuvole_aereo_viaggio',
      particleType: 'floating',
      density: 50
    };
  }

  // Default creative background
  return {
    elements: ['✨', '⭐', '💫', '🌟'],
    backgroundGradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 30%, #a855f7 60%, #c084fc 100%)',
    environmentDescription: 'stelle_magiche_brillanti',
    particleType: 'floating',
    density: 75
  };
};