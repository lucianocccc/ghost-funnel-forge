// Predefined fallback scenes for when OpenAI is unavailable

import { CinematicScene } from './types.ts';

// Create enhanced fallback scenes in Italian
export function createFallbackScenes(productName: string, productDescription?: string): CinematicScene[] {
  const scenes: CinematicScene[] = [
    {
      id: "scene_1",
      type: "hero",
      imagePrompt: `Ultra-cinematic hero image for ${productName} - dramatic lighting, professional photography, high resolution`,
      title: `Scopri ${productName}`,
      subtitle: `${productDescription || 'Il prodotto che stavi cercando'}`,
      content: `Benvenuto nel futuro con ${productName}. Un'esperienza che trasformerà il tuo modo di vedere le cose. Qualità superiore, risultati garantiti.`,
      cta: {
        text: "Scopri di più",
        action: "scroll"
      },
      scrollTrigger: {
        start: 0,
        end: 0.2
      },
      parallaxLayers: [
        {
          element: "✨",
          speed: 0.5,
          scale: 1.2,
          opacity: 0.8
        }
      ]
    },
    {
      id: "scene_2", 
      type: "benefit",
      imagePrompt: `Cinematic product benefit visualization for ${productName}`,
      title: "Qualità Premium",
      subtitle: "Realizzato con eccellenza",
      content: `${productName} è progettato per offrire la migliore esperienza possibile. Ogni dettaglio è curato per garantire risultati eccezionali e soddisfazione duratura.`,
      scrollTrigger: {
        start: 0.2,
        end: 0.4
      },
      parallaxLayers: [
        {
          element: "⭐",
          speed: 0.3,
          scale: 1.1,
          opacity: 0.9
        }
      ]
    },
    {
      id: "scene_3",
      type: "proof",
      imagePrompt: `Social proof and testimonials cinematic scene for ${productName}`,
      title: "Migliaia di clienti soddisfatti",
      subtitle: "Testimonianze reali",
      content: "Clienti da tutto il mondo hanno già scelto la qualità e l'affidabilità che solo noi possiamo offrire. Unisciti anche tu alla nostra famiglia di clienti soddisfatti.",
      scrollTrigger: {
        start: 0.4,
        end: 0.6
      },
      parallaxLayers: [
        {
          element: "🌟",
          speed: 0.4,
          scale: 1.0,
          opacity: 0.7
        }
      ]
    },
    {
      id: "scene_4",
      type: "demo",
      imagePrompt: `Interactive product demonstration scene for ${productName}`,
      title: "Vedi in azione",
      subtitle: "Funzionalità avanzate",
      content: `Scopri come ${productName} può semplificare la tua vita quotidiana. Funzionalità innovative pensate per te, con un'interfaccia intuitiva e risultati immediati.`,
      scrollTrigger: {
        start: 0.6,
        end: 0.8
      },
      parallaxLayers: [
        {
          element: "💫",
          speed: 0.6,
          scale: 0.9,
          opacity: 0.8
        }
      ]
    },
    {
      id: "scene_5",
      type: "conversion",
      imagePrompt: `Final conversion scene with call-to-action for ${productName}`,
      title: "Inizia ora",
      subtitle: "Non perdere l'occasione",
      content: "Questo è il momento perfetto per fare il grande passo. Unisciti a migliaia di persone che hanno già scelto la qualità e l'innovazione. Inizia oggi stesso.",
      cta: {
        text: "Inizia subito",
        action: "convert"
      },
      scrollTrigger: {
        start: 0.8,
        end: 1.0
      },
      parallaxLayers: [
        {
          element: "🚀",
          speed: 0.2,
          scale: 1.3,
          opacity: 1.0
        }
      ]
    }
  ];

  return scenes;
}