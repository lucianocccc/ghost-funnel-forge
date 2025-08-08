import React, { useEffect } from 'react';
import { VisualTheme, buildCssVariables } from './visualTheme';

interface ThemeProviderProps {
  theme: VisualTheme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const vars = buildCssVariables(theme);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.setAttribute('data-visual-style', theme.graphics.style);
  }, [theme]);

  return <>{children}</>;
};
