import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { generateBrandVisualTheme, type VisualStyle } from '@/theme/visualTheme';
import { generateBrandAssets } from '@/services/brandAssets';

interface BrandAssetsHeroProps {
  productName: string;
  productDescription?: string;
  industry?: string;
  visualStyle?: VisualStyle;
  className?: string;
}

export const BrandAssetsHero: React.FC<BrandAssetsHeroProps> = ({
  productName,
  productDescription,
  industry,
  visualStyle,
  className,
}) => {
  const theme = useMemo(
    () => generateBrandVisualTheme(productName, industry, visualStyle),
    [productName, industry, visualStyle]
  );

  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function run() {
      try {
        setLoading(true);
        const res = await generateBrandAssets({
          productName,
          productDescription,
          industry,
          visualStyle,
          theme,
          assets: ['hero', 'pattern'],
          quality: 'medium',
        });
        if (isMounted && res?.success) {
          setAssets(res.assets || {});
        }
      } catch (e) {
        console.error('BrandAssetsHero generation error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    run();
    return () => {
      isMounted = false;
    };
  }, [productName, productDescription, industry, visualStyle, theme]);

  return (
    <section className={`relative w-full overflow-hidden ${className ?? ''}`}>
      <ThemeProvider theme={theme}>
        <div className="relative w-full min-h-[56vh] sm:min-h-[60vh] lg:min-h-[70vh]">
          {/* Background imagery */}
          {assets.hero && !loading ? (
            <img
              src={assets.hero}
              alt={`Immagine hero brand per ${productName}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/60" />
          )}

          {assets.pattern && !loading && (
            <img
              src={assets.pattern}
              alt="Pattern di brand astratto"
              className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
              loading="lazy"
              decoding="async"
              aria-hidden="true"
            />
          )}

          {/* Soft overlay to ensure text contrast using design tokens */}
          <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/20 to-transparent" />

          {/* Content */}
          <header className="relative z-10">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                  {productName}
                </h1>
                {productDescription && (
                  <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                    {productDescription}
                  </p>
                )}
              </div>
            </div>
          </header>
        </div>
      </ThemeProvider>
    </section>
  );
};

export default BrandAssetsHero;
