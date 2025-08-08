import React from 'react';
import type { VisualTheme } from '@/theme/visualTheme';

interface ThemeEditorProps {
  value: VisualTheme;
  onChange: (theme: VisualTheme) => void;
}

// Minimal editor stub – extend with color pickers and font selectors later
export const ThemeEditor: React.FC<ThemeEditorProps> = ({ value }) => {
  return (
    <section className="p-4 rounded-lg border bg-background">
      <header className="mb-3">
        <h1 className="text-lg font-semibold">Brand & Visual Theme</h1>
        <p className="text-sm text-muted-foreground">Preview dei colori generati per il tuo prodotto</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md p-4 border" style={{ background: `hsl(${value.palette.primary})` }}>
          <span className="text-white font-medium">Primary</span>
        </div>
        <div className="rounded-md p-4 border" style={{ background: `hsl(${value.palette.secondary})` }}>
          <span className="text-white font-medium">Secondary</span>
        </div>
        <div className="rounded-md p-4 border" style={{ background: `hsl(${value.palette.accent})` }}>
          <span className="text-white font-medium">Accent</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Tipografia: <span className="font-medium">{value.typography.heading.split(',')[0]}</span> / {value.typography.body.split(',')[0]}
      </div>
    </section>
  );
};
