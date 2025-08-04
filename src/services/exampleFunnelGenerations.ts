import { DynamicSectionEngine } from './dynamicSectionEngine';

// Example 1: Fashion Brand (Luxury tone)
export const fashionBrandExample = {
  prompt: "Create a luxury fashion funnel showcasing our premium collections with elegant testimonials",
  industry: "fashion",
  objectives: ["product_showcase", "brand_awareness"],
  targetAudience: "affluent women 25-45",
  
  dynamicAnalysis: DynamicSectionEngine.generateDynamicFunnelStructure(
    "Create a luxury fashion funnel showcasing our premium collections with elegant testimonials",
    "fashion",
    ["product_showcase", "brand_awareness"],
    "affluent women 25-45"
  ),
  
  expectedSections: ["hero", "product_gallery", "testimonials", "trust_block", "lead_capture"],
  expectedRules: [
    "Applied luxury tone ordering",
    "Added product gallery for ecommerce",
    "Added testimonials based on keyword detection"
  ]
};

// Example 2: Financial Advisor (Professional tone)
export const financialAdvisorExample = {
  prompt: "Professional financial planning funnel with trust indicators and FAQ section",
  industry: "finance", 
  objectives: ["lead_generation", "trust_building"],
  targetAudience: "professionals 35-55",
  
  dynamicAnalysis: DynamicSectionEngine.generateDynamicFunnelStructure(
    "Professional financial planning funnel with trust indicators and FAQ section",
    "finance",
    ["lead_generation", "trust_building"],
    "professionals 35-55"
  ),
  
  expectedSections: ["hero", "trust_block", "faq", "testimonials", "lead_capture"],
  expectedRules: [
    "Applied professional tone ordering",
    "Added trust block for trust building objective",
    "Added faq based on keyword detection"
  ]
};

// Example 3: HR Coach (Educational tone)
export const hrCoachExample = {
  prompt: "Educational coaching funnel with free guide download and learning resources",
  industry: "coaching",
  objectives: ["lead_generation", "education"],
  targetAudience: "HR managers and team leaders",
  
  dynamicAnalysis: DynamicSectionEngine.generateDynamicFunnelStructure(
    "Educational coaching funnel with free guide download and learning resources", 
    "coaching",
    ["lead_generation", "education"],
    "HR managers and team leaders"
  ),
  
  expectedSections: ["hero", "faq", "testimonials", "trust_block", "lead_magnet"],
  expectedRules: [
    "Applied educational tone ordering",
    "Added testimonials for consulting",
    "Added lead_magnet based on keyword detection"
  ]
};

export const allExamples = [fashionBrandExample, financialAdvisorExample, hrCoachExample];