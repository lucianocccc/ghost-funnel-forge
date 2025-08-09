import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';

interface BrandStyleIndicatorProps {
  // Can be a preset name ("Apple" | "Nike" | "Amazon"), any string, or an object produced by the generator
  style: unknown;
  className?: string;
}

type PresetInfo = {
  label: string;
  description: string;
  color: string; // CSS color (HSL preferred)
  traits: string[];
};

const PRESETS: Record<string, PresetInfo> = {
  apple: {
    label: 'Apple',
    description: 'Minimalista ed Elegante',
    color: 'hsl(210 100% 50%)',
    traits: ['Clean', 'Sofisticato', 'Premium']
  },
  nike: {
    label: 'Nike',
    description: 'Dinamico ed Energico',
    color: 'hsl(0 0% 0%)',
    traits: ['Motivazionale', 'Sportivo', 'Bold']
  },
  amazon: {
    label: 'Amazon',
    description: 'Professionale e Affidabile',
    color: 'hsl(36 100% 50%)',
    traits: ['Trustworthy', 'Efficiente', 'Business']
  },
};

function normalizeStyleInfo(style: unknown): PresetInfo {
  // Default fallback
  const fallback: PresetInfo = {
    label: 'Stile Generico',
    description: 'Selezionato automaticamente',
    color: 'hsl(210 10% 50%)',
    traits: ['Adattabile', 'Pulito', 'Moderno']
  };

  // If string: try to match preset, else use generic with label
  if (typeof style === 'string') {
    const key = style.toLowerCase();
    if (PRESETS[key]) return PRESETS[key];
    return { ...fallback, label: style };
  }

  // If object: try to infer fields
  if (style && typeof style === 'object') {
    const s = style as any;
    const label: string = s.visualStyle || s.name || s.label || 'Stile Personalizzato';
    const colorCandidate: string | undefined = s.color || s.primaryColor || s.primary || s?.palette?.primary;
    const traits: string[] = Array.isArray(s.traits) && s.traits.length
      ? s.traits
      : [
          (s.tone || 'Professionale'),
          (s.industry || 'Generale'),
          'AI Generated'
        ];

    // prefer valid CSS color strings; fall back to preset color based on known visual style names
    if (typeof colorCandidate === 'string' && colorCandidate.trim().length > 0) {
      return {
        label,
        description: s.description || 'Stile generato automaticamente',
        color: colorCandidate,
        traits,
      };
    }

    // Try to map visualStyle to a preset color if possible
    const mappedKey = String(label).toLowerCase();
    if (PRESETS[mappedKey]) {
      const preset = PRESETS[mappedKey];
      return { ...preset, label: preset.label };
    }

    return { ...fallback, label };
  }

  return fallback;
}

const BrandStyleIndicator: React.FC<BrandStyleIndicatorProps> = ({ style, className }) => {
  const styleInfo = normalizeStyleInfo(style);

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div
        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: styleInfo.color }}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 opacity-70" />
          <span className="font-semibold">{styleInfo.label}</span>
          <span className="text-sm opacity-70">- {styleInfo.description}</span>
        </div>
        <div className="flex gap-1 mt-1">
          {styleInfo.traits.map((trait, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs py-0 px-2"
              style={{
                borderColor: styleInfo.color,
                color: styleInfo.color,
              }}
            >
              {trait}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandStyleIndicator;