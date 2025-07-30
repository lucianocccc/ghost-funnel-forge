export interface PromptTemplates {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  benefits: {
    headline: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  emotional: {
    headline: string;
    story: string;
    urgency: string;
  };
}

export interface BrandPromptConfig {
  tone: string;
  vocabulary: string[];
  ctaStyle: string;
  emotionalTriggers: string[];
  templateStructure: PromptTemplates;
}

export const brandPromptConfigs: Record<string, BrandPromptConfig> = {
  apple: {
    tone: "minimalista, elegante, innovativo",
    vocabulary: ["think different", "rivoluzionario", "semplicemente", "intuitive", "premium", "esperienza"],
    ctaStyle: "chiaro e diretto con focus sull'azione",
    emotionalTriggers: ["aspirazione", "eleganza", "semplicità", "innovazione"],
    templateStructure: {
      hero: {
        title: "Think Different. [PRODOTTO] che cambia le regole.",
        subtitle: "Un'esperienza senza compromessi, progettata per chi non si accontenta.",
        cta: "Scopri la differenza"
      },
      benefits: {
        headline: "Perché scegliere [PRODOTTO]",
        items: [
          {
            title: "Design Intuitivo",
            description: "Ogni dettaglio è pensato per la massima semplicità d'uso."
          },
          {
            title: "Tecnologia Avanzata",
            description: "All'avanguardia della tecnologia, sempre un passo avanti."
          },
          {
            title: "Qualità Premium",
            description: "Materiali e lavorazioni di qualità superiore, per durare nel tempo."
          }
        ]
      },
      emotional: {
        headline: "Non è solo un prodotto. È il tuo nuovo standard.",
        story: "Ogni giorno usi strumenti che limitano le tue possibilità. È arrivato il momento di elevare i tuoi standard.",
        urgency: "Unisciti alla rivoluzione. Solo oggi, condizioni esclusive."
      }
    }
  },
  nike: {
    tone: "motivazionale, energico, determinato",
    vocabulary: ["just do it", "performanza", "superare i limiti", "vincere", "energia", "forza"],
    ctaStyle: "imperativo e motivazionale",
    emotionalTriggers: ["determinazione", "successo", "superamento", "energia"],
    templateStructure: {
      hero: {
        title: "Just Do It. [PRODOTTO] per chi non si arrende.",
        subtitle: "Supera ogni limite. Raggiungi ogni obiettivo. Vinci ogni sfida.",
        cta: "Inizia ora la tua vittoria"
      },
      benefits: {
        headline: "La tua arma segreta per il successo",
        items: [
          {
            title: "Prestazioni Superiori",
            description: "Progettato per chi vuole dare sempre il massimo."
          },
          {
            title: "Resistenza Estrema",
            description: "Testato nelle condizioni più difficili, per superare ogni sfida."
          },
          {
            title: "Risultati Garantiti",
            description: "I campioni lo scelgono perché funziona. Sempre."
          }
        ]
      },
      emotional: {
        headline: "I vincenti non aspettano. Agiscono.",
        story: "Ogni grande vittoria è iniziata con una decisione. La tua è oggi.",
        urgency: "Non rimandare la tua vittoria. Agisci ora."
      }
    }
  },
  amazon: {
    tone: "professionale, affidabile, orientato al valore",
    vocabulary: ["convenienza", "qualità", "affidabilità", "risparmio", "pratico", "efficiente"],
    ctaStyle: "orientato al valore e alla convenienza",
    emotionalTriggers: ["fiducia", "sicurezza", "convenienza", "praticità"],
    templateStructure: {
      hero: {
        title: "[PRODOTTO] - La scelta intelligente per [TARGET]",
        subtitle: "Qualità garantita, prezzo conveniente, consegna rapida. Tutto quello che cerchi.",
        cta: "Acquista ora con fiducia"
      },
      benefits: {
        headline: "Perché migliaia di clienti ci scelgono",
        items: [
          {
            title: "Qualità Certificata",
            description: "Prodotti selezionati e testati per garantire la massima qualità."
          },
          {
            title: "Prezzo Conveniente",
            description: "Il miglior rapporto qualità-prezzo sul mercato."
          },
          {
            title: "Servizio Affidabile",
            description: "Assistenza clienti 24/7 e garanzia soddisfatti o rimborsati."
          }
        ]
      },
      emotional: {
        headline: "La scelta di cui non ti pentirai",
        story: "Migliaia di clienti soddisfatti hanno già scelto la qualità e l'affidabilità.",
        urgency: "Offerta limitata nel tempo. Approfitta ora del prezzo speciale."
      }
    }
  }
};

export const optimizePromptForBrand = (
  originalPrompt: string, 
  brandId: string, 
  productName: string,
  targetAudience: string
): string => {
  const config = brandPromptConfigs[brandId];
  if (!config) return originalPrompt;

  // Sostituzioni dinamiche
  let optimizedPrompt = originalPrompt
    .replace(/\[PRODOTTO\]/g, productName)
    .replace(/\[TARGET\]/g, targetAudience);

  // Aggiunge il tono specifico del brand
  const brandContext = `
Tono di comunicazione: ${config.tone}
Parole chiave da utilizzare: ${config.vocabulary.join(', ')}
Trigger emotivi: ${config.emotionalTriggers.join(', ')}
Stile CTA: ${config.ctaStyle}

Prompt originale: ${optimizedPrompt}

Riscrivi il contenuto seguendo questo stile di comunicazione specifico.
`;

  return brandContext;
};