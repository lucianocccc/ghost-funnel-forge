// Visual Theme types and generator

export type VisualStyle = 'minimal' | 'dynamic' | 'elegant' | 'technical';

export interface VisualTheme {
  palette: {
    // HSL components string without the hsl() wrapper, e.g. "221 83% 53%"
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    heading: string; // CSS font-family stack
    body: string;    // CSS font-family stack
    accent?: string;
  };
  graphics: {
    style: VisualStyle;
    pattern?: 'dots' | 'grid' | 'none';
  };
  animations: {
    motionLevel: 'low' | 'medium' | 'high';
  };
}

// Build CSS variables compatible with shadcn/tailwind tokens
export const buildCssVariables = (theme: VisualTheme): Record<string, string> => {
  return {
    '--primary': theme.palette.primary,
    '--primary-foreground': '0 0% 100%',
    '--secondary': theme.palette.secondary,
    '--secondary-foreground': '0 0% 100%',
    '--accent': theme.palette.accent,
    '--accent-foreground': '0 0% 100%',
  };
};

const fontStacks = {
  sans: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
  serif: "\"Playfair Display\", ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  elegant: "\"Cormorant Garamond\", ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  tech: "\"Space Grotesk\", Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
};

export const generateBrandVisualTheme = (
  productName: string,
  industry?: string,
  visualStyle: VisualStyle = 'dynamic'
): VisualTheme => {
  const name = productName.toLowerCase();
  const ind = (industry || 'general').toLowerCase();

  // Base palettes by style
  const stylePalettes: Record<VisualStyle, { primary: string; secondary: string; accent: string }> = {
    minimal: { primary: '220 14% 96%', secondary: '220 9% 46%', accent: '221 83% 53%' },
    dynamic: { primary: '221 83% 53%', secondary: '262 83% 58%', accent: '142 76% 36%' },
    elegant: { primary: '271 91% 33%', secondary: '43 96% 56%', accent: '271 95% 24%' },
    technical: { primary: '226 71% 40%', secondary: '189 94% 43%', accent: '262 83% 58%' },
  };

  let palette = { ...stylePalettes[visualStyle] };

  // Industry nudges
  if (ind.includes('finance') || ind.includes('fintech')) {
    palette = { primary: '222 76% 45%', secondary: '43 92% 50%', accent: palette.accent };
  } else if (ind.includes('health') || ind.includes('wellness') || ind.includes('med')) {
    palette = { primary: '142 70% 42%', secondary: '189 85% 42%', accent: '27 96% 61%' };
  } else if (ind.includes('ecommerce') || ind.includes('retail')) {
    palette = { primary: '25 95% 53%', secondary: '221 83% 53%', accent: '14 90% 57%' };
  } else if (ind.includes('saas') || ind.includes('software') || ind.includes('technology') || ind.includes('tech')) {
    palette = { primary: '226 71% 40%', secondary: '262 83% 58%', accent: '189 94% 43%' };
  }

  // Keyword adjustments from product name
  if (name.includes('eco') || name.includes('green')) {
    palette.accent = '142 72% 35%';
  }
  if (name.includes('pro') || name.includes('ultra')) {
    // slightly deeper primary for premium feel
    const premiumPrimary = visualStyle === 'elegant' ? '271 92% 28%' : '221 83% 48%';
    palette.primary = premiumPrimary;
  }

  // Typography by style
  const typography =
    visualStyle === 'elegant'
      ? { heading: fontStacks.elegant, body: fontStacks.serif }
      : visualStyle === 'technical'
      ? { heading: fontStacks.tech, body: fontStacks.sans }
      : { heading: fontStacks.sans, body: fontStacks.sans };

  // Graphics/animation
  const graphics = {
    style: visualStyle,
    pattern: visualStyle === 'minimal' ? 'grid' : visualStyle === 'elegant' ? 'dots' : 'none',
  } as const;

  const animations = {
    motionLevel: visualStyle === 'minimal' ? 'low' : visualStyle === 'elegant' ? 'medium' : 'high',
  } as const;

  return {
    palette,
    typography,
    graphics,
    animations,
  };
};
