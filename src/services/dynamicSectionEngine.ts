import { FunnelSectionLibraryItem } from '@/hooks/useFunnelSectionLibrary';
import { FunnelSection } from '@/hooks/useModularFunnelConfig';

// Expanded section templates with new types
export const expandedSectionTemplates: FunnelSectionLibraryItem[] = [
  // Existing templates (hero, problem_solution, social_proof, lead_capture, urgency)
  {
    section_name: "Hero con Video",
    section_type: "hero",
    category: "introduction",
    description: "Sezione hero con video di presentazione e CTA principale",
    content_template: {
      layout: "video_hero",
      video_url: "",
      headline: "Trasforma la tua vita con il nostro metodo rivoluzionario",
      subheadline: "Scopri come migliaia di persone hanno già cambiato il loro destino",
      cta_text: "Inizia Subito",
      cta_style: "primary"
    },
    configuration_options: {
      video_autoplay: { type: "boolean", default: true },
      video_muted: { type: "boolean", default: true },
      background_overlay: { type: "boolean", default: true },
      cta_position: { type: "select", options: ["center", "left", "right"], default: "center" }
    },
    industry_tags: ["business", "coaching", "ecommerce"],
    use_case_tags: ["lead_generation", "sales", "webinar"],
    conversion_impact_score: 8.5,
    complexity_level: "intermediate",
    is_premium: false
  },
  
  // NEW SECTION TYPES
  {
    section_name: "Galleria Testimonianze",
    section_type: "testimonials",
    category: "trust",
    description: "Galleria avanzata di testimonianze con foto e risultati",
    content_template: {
      layout: "testimonial_grid",
      testimonials: [
        {
          name: "[Nome Cliente]",
          role: "[Ruolo/Azienda]",
          text: "[Testimonianza personalizzata]",
          photo: "",
          result: "[Risultato specifico ottenuto]"
        }
      ],
      title: "Quello che Dicono i Nostri Clienti",
      subtitle: "Storie reali di trasformazione e successo"
    },
    configuration_options: {
      display_style: { type: "select", options: ["grid", "carousel", "masonry"], default: "grid" },
      include_photos: { type: "boolean", default: true },
      show_results: { type: "boolean", default: true },
      auto_rotate: { type: "boolean", default: false }
    },
    industry_tags: ["coaching", "consulting", "ecommerce", "saas"],
    use_case_tags: ["trust_building", "social_proof", "credibility"],
    conversion_impact_score: 9.0,
    complexity_level: "intermediate",
    is_premium: false
  },

  {
    section_name: "Galleria Prodotti",
    section_type: "product_gallery",
    category: "showcase",
    description: "Showcase interattivo dei prodotti/servizi",
    content_template: {
      layout: "interactive_gallery",
      products: [
        {
          name: "[Nome Prodotto]",
          description: "[Descrizione coinvolgente]",
          image: "",
          price: "[Prezzo]",
          features: ["[Feature 1]", "[Feature 2]", "[Feature 3]"]
        }
      ],
      title: "I Nostri Prodotti Esclusivi",
      subtitle: "Soluzioni progettate per te"
    },
    configuration_options: {
      gallery_style: { type: "select", options: ["grid", "slider", "masonry"], default: "grid" },
      show_prices: { type: "boolean", default: true },
      enable_quick_view: { type: "boolean", default: true },
      hover_effects: { type: "boolean", default: true }
    },
    industry_tags: ["ecommerce", "fashion", "technology", "health"],
    use_case_tags: ["product_showcase", "sales", "catalog"],
    conversion_impact_score: 8.2,
    complexity_level: "intermediate",
    is_premium: false
  },

  {
    section_name: "FAQ Dinamiche",
    section_type: "faq",
    category: "information",
    description: "Sezione FAQ con ricerca e categorizzazione",
    content_template: {
      layout: "searchable_accordion",
      faqs: [
        {
          question: "[Domanda frequente]",
          answer: "[Risposta dettagliata e rassicurante]",
          category: "generale"
        }
      ],
      title: "Domande Frequenti",
      subtitle: "Trova subito le risposte che cerchi",
      search_placeholder: "Cerca una domanda..."
    },
    configuration_options: {
      enable_search: { type: "boolean", default: true },
      categorize_faqs: { type: "boolean", default: true },
      expand_all: { type: "boolean", default: false },
      show_contact_cta: { type: "boolean", default: true }
    },
    industry_tags: ["saas", "ecommerce", "consulting", "education"],
    use_case_tags: ["support", "education", "objection_handling"],
    conversion_impact_score: 7.5,
    complexity_level: "beginner",
    is_premium: false
  },

  {
    section_name: "Blocco Fiducia",
    section_type: "trust_block",
    category: "trust",
    description: "Certificazioni, garanzie e badge di sicurezza",
    content_template: {
      layout: "trust_badges",
      badges: [
        { type: "security", text: "Pagamenti Sicuri", icon: "shield" },
        { type: "guarantee", text: "Garanzia 30 giorni", icon: "check" },
        { type: "support", text: "Supporto 24/7", icon: "headphones" }
      ],
      certifications: [],
      guarantees: {
        money_back: true,
        satisfaction: true,
        privacy: true
      }
    },
    configuration_options: {
      badge_style: { type: "select", options: ["minimal", "detailed", "icononly"], default: "detailed" },
      show_certifications: { type: "boolean", default: true },
      animated_badges: { type: "boolean", default: false }
    },
    industry_tags: ["ecommerce", "fintech", "health", "saas"],
    use_case_tags: ["trust_building", "security", "compliance"],
    conversion_impact_score: 8.7,
    complexity_level: "beginner",
    is_premium: false
  },

  {
    section_name: "Lead Magnet",
    section_type: "lead_magnet",
    category: "conversion",
    description: "Offerta irresistibile per raccogliere contatti",
    content_template: {
      layout: "magnet_offer",
      offer_title: "[Titolo dell'offerta esclusiva]",
      offer_description: "[Descrizione del valore]",
      offer_image: "",
      form_title: "Scarica Gratis",
      bonus_items: [
        "[Bonus 1]",
        "[Bonus 2]",
        "[Bonus 3]"
      ],
      value_proposition: "[Valore totale dell'offerta]"
    },
    configuration_options: {
      magnet_type: { type: "select", options: ["ebook", "checklist", "template", "course"], default: "ebook" },
      show_value: { type: "boolean", default: true },
      countdown_timer: { type: "boolean", default: false },
      social_sharing: { type: "boolean", default: true }
    },
    industry_tags: ["marketing", "coaching", "education", "consulting"],
    use_case_tags: ["lead_generation", "content_marketing", "email_list"],
    conversion_impact_score: 9.3,
    complexity_level: "intermediate",
    is_premium: true
  }
];

// Keyword mapping for dynamic section activation
export const keywordSectionMapping = {
  // Trust & Credibility keywords
  trust: ['testimonials', 'trust_block'],
  credibility: ['testimonials', 'trust_block'],
  reviews: ['testimonials'],
  testimonials: ['testimonials'],
  proof: ['testimonials', 'trust_block'],
  security: ['trust_block'],
  guarantee: ['trust_block'],
  
  // Product/Service showcase keywords
  products: ['product_gallery'],
  services: ['product_gallery'],
  catalog: ['product_gallery'],
  showcase: ['product_gallery'],
  gallery: ['product_gallery'],
  
  // Information & Support keywords
  faq: ['faq'],
  questions: ['faq'],
  help: ['faq'],
  support: ['faq'],
  answers: ['faq'],
  
  // Lead generation keywords
  download: ['lead_magnet'],
  free: ['lead_magnet', 'lead_capture'],
  bonus: ['lead_magnet'],
  gift: ['lead_magnet'],
  ebook: ['lead_magnet'],
  guide: ['lead_magnet'],
  
  // Urgency keywords
  limited: ['urgency'],
  exclusive: ['urgency'],
  deadline: ['urgency'],
  hurry: ['urgency'],
  scarcity: ['urgency']
};

// Tone of voice mapping for section ordering
export const toneOrderingRules = {
  professional: {
    priority: ['hero', 'trust_block', 'product_gallery', 'testimonials', 'faq', 'lead_capture'],
    avoid_urgency: true
  },
  friendly: {
    priority: ['hero', 'testimonials', 'product_gallery', 'faq', 'lead_magnet', 'trust_block'],
    emphasis_social: true
  },
  aggressive: {
    priority: ['hero', 'urgency', 'lead_magnet', 'testimonials', 'trust_block'],
    force_urgency: true
  },
  educational: {
    priority: ['hero', 'faq', 'testimonials', 'trust_block', 'lead_magnet'],
    emphasis_content: true
  },
  luxury: {
    priority: ['hero', 'product_gallery', 'testimonials', 'trust_block', 'lead_capture'],
    avoid_urgency: true,
    minimize_sections: true
  }
};

export class DynamicSectionEngine {
  
  // Analyze prompt for keywords and determine sections to activate
  static analyzeFunnelPrompt(prompt: string): {
    detectedKeywords: string[];
    suggestedSections: string[];
    toneOfVoice: string;
    confidence: number;
  } {
    const lowercasePrompt = prompt.toLowerCase();
    const detectedKeywords: string[] = [];
    const suggestedSections: string[] = [];
    
    // Detect keywords
    Object.entries(keywordSectionMapping).forEach(([keyword, sections]) => {
      if (lowercasePrompt.includes(keyword)) {
        detectedKeywords.push(keyword);
        sections.forEach(section => {
          if (!suggestedSections.includes(section)) {
            suggestedSections.push(section);
          }
        });
      }
    });
    
    // Detect tone of voice
    const toneOfVoice = this.detectToneOfVoice(prompt);
    
    // Calculate confidence based on keyword matches
    const confidence = Math.min(detectedKeywords.length * 0.2, 1.0);
    
    return {
      detectedKeywords,
      suggestedSections,
      toneOfVoice,
      confidence
    };
  }
  
  // Detect tone of voice from prompt
  static detectToneOfVoice(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Professional indicators
    if (/\b(professional|corporate|business|enterprise|executive)\b/.test(lowercasePrompt)) {
      return 'professional';
    }
    
    // Aggressive/Sales indicators
    if (/\b(buy now|limited|exclusive|hurry|act now|don't miss|urgent)\b/.test(lowercasePrompt)) {
      return 'aggressive';
    }
    
    // Educational indicators
    if (/\b(learn|understand|guide|tutorial|course|education|teach)\b/.test(lowercasePrompt)) {
      return 'educational';
    }
    
    // Luxury indicators
    if (/\b(luxury|premium|exclusive|elegant|sophisticated|high-end)\b/.test(lowercasePrompt)) {
      return 'luxury';
    }
    
    // Default to friendly
    return 'friendly';
  }
  
  // Apply IF/THEN rules to determine section configuration
  static applyStructuralRules(
    prompt: string,
    industry: string,
    objectives: string[]
  ): {
    enabledSections: string[];
    sectionOrder: string[];
    appliedRules: string[];
    microcopyPersonalization: any;
  } {
    const analysis = this.analyzeFunnelPrompt(prompt);
    const appliedRules: string[] = [];
    
    // Start with base sections
    let enabledSections = ['hero']; // Always include hero
    
    // Apply tone-based rules
    const toneRules = toneOrderingRules[analysis.toneOfVoice as keyof typeof toneOrderingRules];
    if (toneRules) {
      // Add sections based on tone priorities
      enabledSections = [...enabledSections, ...toneRules.priority.slice(1)];
      appliedRules.push(`Applied ${analysis.toneOfVoice} tone ordering`);
      
      // Force urgency if aggressive tone
      if ('force_urgency' in toneRules && toneRules.force_urgency && !enabledSections.includes('urgency')) {
        enabledSections.push('urgency');
        appliedRules.push('Added urgency for aggressive tone');
      }
      
      // Avoid urgency for professional/luxury
      if ('avoid_urgency' in toneRules && toneRules.avoid_urgency) {
        enabledSections = enabledSections.filter(s => s !== 'urgency');
        appliedRules.push('Removed urgency for professional/luxury tone');
      }
    }
    
    // Add keyword-suggested sections
    analysis.suggestedSections.forEach(section => {
      if (!enabledSections.includes(section)) {
        enabledSections.push(section);
        appliedRules.push(`Added ${section} based on keyword detection`);
      }
    });
    
    // Industry-specific rules
    if (industry === 'ecommerce' && !enabledSections.includes('product_gallery')) {
      enabledSections.push('product_gallery');
      appliedRules.push('Added product gallery for ecommerce');
    }
    
    if (industry === 'consulting' && !enabledSections.includes('testimonials')) {
      enabledSections.push('testimonials');
      appliedRules.push('Added testimonials for consulting');
    }
    
    // Objective-based rules
    if (objectives.includes('lead_generation') && !enabledSections.includes('lead_capture')) {
      enabledSections.push('lead_capture');
      appliedRules.push('Added lead capture for lead generation objective');
    }
    
    if (objectives.includes('trust_building') && !enabledSections.includes('trust_block')) {
      enabledSections.push('trust_block');
      appliedRules.push('Added trust block for trust building objective');
    }
    
    // Determine final order based on tone priorities
    const sectionOrder = this.orderSections(enabledSections, analysis.toneOfVoice);
    
    // Generate microcopy personalization
    const microcopyPersonalization = this.generateMicrocopyPersonalization(
      analysis.toneOfVoice,
      industry,
      objectives,
      prompt
    );
    
    return {
      enabledSections,
      sectionOrder,
      appliedRules,
      microcopyPersonalization
    };
  }
  
  // Order sections based on tone and best practices
  static orderSections(sections: string[], tone: string): string[] {
    const toneRules = toneOrderingRules[tone as keyof typeof toneOrderingRules];
    if (!toneRules) return sections;
    
    const ordered: string[] = [];
    
    // Add sections in priority order
    toneRules.priority.forEach(prioritySection => {
      if (sections.includes(prioritySection)) {
        ordered.push(prioritySection);
      }
    });
    
    // Add remaining sections
    sections.forEach(section => {
      if (!ordered.includes(section)) {
        ordered.push(section);
      }
    });
    
    return ordered;
  }
  
  // Generate microcopy personalization based on context
  static generateMicrocopyPersonalization(
    tone: string,
    industry: string,
    objectives: string[],
    prompt: string
  ): any {
    const personalization: any = {
      tone,
      industry,
      objectives,
      cta_variations: {},
      headlines: {},
      descriptions: {}
    };
    
    // Tone-based CTA variations
    switch (tone) {
      case 'professional':
        personalization.cta_variations = {
          primary: 'Richiedi Informazioni',
          secondary: 'Scopri di Più',
          urgency: 'Contattaci Oggi'
        };
        break;
      case 'aggressive':
        personalization.cta_variations = {
          primary: 'Ottieni Subito',
          secondary: 'Non Perdere Tempo',
          urgency: 'Ultima Possibilità'
        };
        break;
      case 'friendly':
        personalization.cta_variations = {
          primary: 'Inizia il Tuo Viaggio',
          secondary: 'Scopriamo Insieme',
          urgency: 'Unisciti a Noi Ora'
        };
        break;
      case 'educational':
        personalization.cta_variations = {
          primary: 'Impara di Più',
          secondary: 'Inizia a Studiare',
          urgency: 'Accedi al Corso'
        };
        break;
      case 'luxury':
        personalization.cta_variations = {
          primary: 'Richiedi Accesso Esclusivo',
          secondary: 'Scopri l\'Eccellenza',
          urgency: 'Prenota la Tua Esperienza'
        };
        break;
    }
    
    // Industry-specific customization
    if (industry === 'fashion') {
      personalization.headlines.hero = 'Scopri il Tuo Stile Unico';
      personalization.descriptions.products = 'Collezioni esclusive per ogni occasione';
    } else if (industry === 'finance') {
      personalization.headlines.hero = 'Il Tuo Futuro Finanziario Inizia Qui';
      personalization.descriptions.trust = 'Sicurezza e trasparenza garantite';
    } else if (industry === 'coaching') {
      personalization.headlines.hero = 'Trasforma la Tua Vita';
      personalization.descriptions.testimonials = 'Storie di vera trasformazione';
    }
    
    return personalization;
  }
  
  // Get section template by type
  static getSectionTemplate(sectionType: string): FunnelSectionLibraryItem | null {
    return expandedSectionTemplates.find(template => 
      template.section_type === sectionType
    ) || null;
  }
  
  // Generate funnel structure with dynamic rules applied
  static generateDynamicFunnelStructure(
    prompt: string,
    industry: string,
    objectives: string[],
    targetAudience: string
  ): {
    structure: FunnelSection[];
    analysis: any;
    appliedRules: string[];
  } {
    const rulesResult = this.applyStructuralRules(prompt, industry, objectives);
    
    const structure: FunnelSection[] = rulesResult.sectionOrder.map((sectionType, index) => ({
      id: `${sectionType}-${Date.now()}-${index}`,
      section_type: sectionType,
      position: index,
      config: {
        template: this.getSectionTemplate(sectionType)?.section_name || sectionType,
        industry,
        targetAudience,
        microcopy: rulesResult.microcopyPersonalization
      },
      is_enabled: true
    }));
    
    const analysis = this.analyzeFunnelPrompt(prompt);
    
    return {
      structure,
      analysis,
      appliedRules: rulesResult.appliedRules
    };
  }
}

export default DynamicSectionEngine;
