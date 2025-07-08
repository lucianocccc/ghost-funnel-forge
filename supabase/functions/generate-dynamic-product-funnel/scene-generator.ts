// Scene generation using OpenAI API with enhanced retry logic

import { CinematicScene } from './types.ts';
import { cleanOpenAIResponse } from './utils.ts';
import { createFallbackScenes } from './fallback-scenes.ts';

// Enhanced scene structure generation with retry logic and request tracking
export async function generateSceneStructureWithRetry(
  productName: string, 
  productDescription?: string, 
  targetAudience?: string, 
  industry?: string,
  openAIApiKey?: string,
  requestId?: string
): Promise<CinematicScene[]> {
  const logPrefix = `[${requestId || 'unknown'}]`;
  
  // Enhanced fallback scenes with better Italian content
  const fallbackScenes = createFallbackScenes(productName, productDescription);
  
  // If no OpenAI key or empty key, return fallback immediately
  if (!openAIApiKey || openAIApiKey.trim() === '') {
    console.log(`🎬 ${logPrefix} No OpenAI API key available - using fallback scenes`);
    return fallbackScenes;
  }

  const prompt = `
Crea un funnel cinematografico COINVOLGENTE per "${productName}". Genera esattamente 5 scene in ITALIANO che fluiscono perfettamente insieme.

Contesto Prodotto:
- Nome: ${productName}
- Descrizione: ${productDescription || 'Prodotto premium'}
- Pubblico Target: ${targetAudience || 'Consumatori generici'}
- Settore: ${industry || 'Prodotti di consumo'}

Genera ESATTAMENTE questa struttura JSON per 5 scene:
{
  "scenes": [
    {
      "id": "scene_1",
      "type": "hero",
      "imagePrompt": "Immagine cinematografica hero ultra-professionale per ${productName} - illuminazione drammatica, fotografia professionale, risoluzione 8K",
      "title": "Titolo hero coinvolgente in italiano",
      "subtitle": "Sottotitolo hero accattivante",
      "content": "Contenuto della sezione hero che cattura l'attenzione del visualizzatore",
      "cta": {
        "text": "Scopri di più",
        "action": "scroll"
      },
      "scrollTrigger": {
        "start": 0,
        "end": 0.2
      },
      "parallaxLayers": [
        {
          "element": "✨",
          "speed": 0.5,
          "scale": 1.2,
          "opacity": 0.8
        }
      ]
    },
    {
      "id": "scene_2", 
      "type": "benefit",
      "imagePrompt": "Visualizzazione cinematografica dei benefici del prodotto per ${productName}",
      "title": "Titolo beneficio chiave",
      "subtitle": "Spiegazione del beneficio",
      "content": "Descrizione dettagliata del beneficio",
      "scrollTrigger": {
        "start": 0.2,
        "end": 0.4
      },
      "parallaxLayers": [
        {
          "element": "⭐",
          "speed": 0.3,
          "scale": 1.1,
          "opacity": 0.9
        }
      ]
    },
    {
      "id": "scene_3",
      "type": "proof",
      "imagePrompt": "Scena cinematografica di prova sociale e testimonianze per ${productName}",
      "title": "Titolo prova sociale",
      "subtitle": "Fiducia e credibilità",
      "content": "Testimonianze e prove di efficacia",
      "scrollTrigger": {
        "start": 0.4,
        "end": 0.6
      },
      "parallaxLayers": [
        {
          "element": "🌟",
          "speed": 0.4,
          "scale": 1.0,
          "opacity": 0.7
        }
      ]
    },
    {
      "id": "scene_4",
      "type": "demo",
      "imagePrompt": "Scena di dimostrazione interattiva del prodotto per ${productName}",
      "title": "Vedi in azione",
      "subtitle": "Dimostrazione del prodotto",
      "content": "Contenuto della demo interattiva",
      "scrollTrigger": {
        "start": 0.6,
        "end": 0.8
      },
      "parallaxLayers": [
        {
          "element": "💫",
          "speed": 0.6,
          "scale": 0.9,
          "opacity": 0.8
        }
      ]
    },
    {
      "id": "scene_5",
      "type": "conversion",
      "imagePrompt": "Scena finale di conversione con call-to-action per ${productName}",
      "title": "Agisci ora",
      "subtitle": "Non perdere l'occasione",
      "content": "Spinta finale alla conversione",
      "cta": {
        "text": "Inizia subito",
        "action": "convert"
      },
      "scrollTrigger": {
        "start": 0.8,
        "end": 1.0
      },
      "parallaxLayers": [
        {
          "element": "🚀",
          "speed": 0.2,
          "scale": 1.3,
          "opacity": 1.0
        }
      ]
    }
  ]
}

Ritorna SOLO JSON valido. Rendi i prompt delle immagini estremamente dettagliati e cinematografici.`;

  // Enhanced retry logic with better error handling
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`🤖 ${logPrefix} OpenAI API call attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Sei un esperto di storytelling cinematografico. Crea scene immersive e narrative fluide. Ritorna sempre solo JSON valido in italiano.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const cleanedContent = cleanOpenAIResponse(data.choices[0].message.content);
        
        const parsed = JSON.parse(cleanedContent);
        console.log(`✅ ${logPrefix} OpenAI API success on attempt ${attempt + 1}`);
        
        // Validate the response structure
        if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          return parsed.scenes;
        } else {
          console.warn(`⚠️ ${logPrefix} Invalid response structure, using fallback`);
          return fallbackScenes;
        }
      }
      
      // Handle rate limiting (429) and server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        const errorBody = await response.text();
        console.warn(`⚠️ ${logPrefix} OpenAI API error ${response.status} on attempt ${attempt + 1}: ${errorBody}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 2^attempt seconds (2s, 4s, 8s)
          const waitTime = Math.pow(2, attempt + 1) * 1000;
          console.log(`⏳ ${logPrefix} Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }
      }
      
      // For other errors, fail immediately but gracefully
      const errorText = await response.text();
      console.error(`❌ ${logPrefix} OpenAI API error ${response.status}: ${errorText}`);
      console.log(`🔄 ${logPrefix} Falling back to pre-built scenes`);
      return fallbackScenes;
      
    } catch (error) {
      console.error(`❌ ${logPrefix} Exception in OpenAI API call:`, error.message);
      
      if (attempt < maxRetries && (error.message.includes('429') || error.message.includes('rate limit'))) {
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        console.log(`⏳ ${logPrefix} Retrying after rate limit error, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempt++;
        continue;
      }
      
      // If it's the last attempt or non-retryable error, return fallback
      if (attempt >= maxRetries) {
        console.log(`🔄 ${logPrefix} All attempts exhausted, using fallback scenes`);
        return fallbackScenes;
      }
      
      attempt++;
    }
  }
  
  // If we get here, all retries failed, return fallback scenes
  console.log(`🚨 ${logPrefix} All OpenAI API attempts failed - returning fallback scenes`);
  return fallbackScenes;
}

// Legacy function kept for backward compatibility - now redirects to enhanced version
export async function generateSceneStructure(
  productName: string, 
  productDescription?: string, 
  targetAudience?: string, 
  industry?: string,
  openAIApiKey?: string
): Promise<CinematicScene[]> {
  return generateSceneStructureWithRetry(productName, productDescription, targetAudience, industry, openAIApiKey);
}