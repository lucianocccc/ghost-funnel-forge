import { supabase } from "@/integrations/supabase/client";
import type { VisualStyle, VisualTheme } from "@/theme/visualTheme";

export interface GenerateBrandAssetsParams {
  productName: string;
  productDescription?: string;
  industry?: string;
  visualStyle?: VisualStyle;
  theme?: VisualTheme;
  assets?: Array<'hero' | 'pattern' | 'shapes'>;
  quality?: 'high' | 'medium' | 'low';
}

export async function generateBrandAssets(params: GenerateBrandAssetsParams) {
  const { data, error } = await supabase.functions.invoke('generate-brand-assets', {
    body: params,
  });
  if (error) throw error;
  return data as { success: boolean; assets?: Record<string, string>; error?: string };
}
