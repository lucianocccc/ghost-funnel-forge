
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔍 Product Intelligence Analysis Function Started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, sessionId, userId, analysisId } = await req.json();
    
    console.log('Avvio analisi di product intelligence...');
    console.log('Context:', {
      productName: context.productName,
      industry: context.industry,
      targetAudience: context.targetAudience
    });

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the analysis prompt
    const analysisPrompt = `
    Analyze this product/service and provide a comprehensive intelligence report:

    Product Name: ${context.productName}
    Product Description: ${context.productDescription}
    Industry: ${context.industry || 'Not specified'}
    Target Audience: ${context.targetAudience || 'Not specified'}
    Category: ${context.category || 'Not specified'}
    User Context: ${context.userPrompt || 'Not provided'}

    Please provide a detailed analysis in the following JSON format:

    {
      "product_summary": {
        "name": "Product name",
        "description": "Clear product description", 
        "category": "Product category",
        "industry": "Industry sector",
        "target_audience": "Primary target audience",
        "unique_value_proposition": "What makes this unique",
        "key_features": ["feature1", "feature2", "feature3"],
        "competitive_advantages": ["advantage1", "advantage2"]
      },
      "market_analysis": {
        "market_size": "Market size description",
        "growth_trends": ["trend1", "trend2", "trend3"],
        "competitive_landscape": "Description of competition",
        "market_opportunities": ["opportunity1", "opportunity2"],
        "threats": ["threat1", "threat2"]
      },
      "target_audience_insights": {
        "primary_audience": "Main target audience",
        "demographics": {"age": "age range", "income": "income level"},
        "psychographics": {"values": ["value1", "value2"]},
        "pain_points": ["pain1", "pain2", "pain3"],
        "motivations": ["motivation1", "motivation2"],
        "buying_behavior": {"research": "research style", "timeline": "decision timeline"}
      },
      "competitor_analysis": {
        "direct_competitors": ["competitor1", "competitor2"],
        "competitive_advantages": ["our_advantage1", "our_advantage2"],
        "market_gaps": ["gap1", "gap2"],
        "positioning": "Recommended positioning"
      },
      "strategic_recommendations": {
        "messaging_strategy": "Key messaging approach",
        "positioning_statement": "Clear positioning statement",
        "key_differentiators": ["differentiator1", "differentiator2"],
        "marketing_channels": ["channel1", "channel2"],
        "content_strategy": "Content approach recommendation"
      },
      "confidence_score": 0.85
    }

    Provide practical, actionable insights based on the information given. Focus on being specific and relevant to the product and target audience.
    `;

    // Call OpenAI API
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
            content: 'You are an expert business analyst specializing in product intelligence, market analysis, and competitive positioning. Provide detailed, actionable insights in structured JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Raw AI response:', aiResponse.substring(0, 200) + '...');

    // Parse the AI response
    let analysis;
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      analysis = JSON.parse(cleanResponse);
      console.log('Analysis parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse analysis response');
    }

    // Transform to expected format
    const transformedAnalysis = {
      productSummary: {
        name: analysis.product_summary?.name || context.productName,
        description: analysis.product_summary?.description || context.productDescription,
        category: analysis.product_summary?.category || context.category || 'General',
        industry: analysis.product_summary?.industry || context.industry || 'General',
        targetAudience: analysis.product_summary?.target_audience || context.targetAudience || 'General users',
        uniqueValueProposition: analysis.product_summary?.unique_value_proposition || 'Unique value proposition',
        keyFeatures: analysis.product_summary?.key_features || ['Quality', 'Reliability', 'Innovation'],
        competitiveAdvantages: analysis.product_summary?.competitive_advantages || ['Better quality', 'Great support']
      },
      marketAnalysis: {
        marketSize: analysis.market_analysis?.market_size || 'Growing market',
        growthTrends: analysis.market_analysis?.growth_trends || ['Digital transformation', 'Market expansion'],
        competitiveLandscape: analysis.market_analysis?.competitive_landscape || 'Competitive market with opportunities',
        marketOpportunities: analysis.market_analysis?.market_opportunities || ['Market expansion', 'Innovation'],
        threats: analysis.market_analysis?.threats || ['Competition', 'Market changes']
      },
      targetAudienceInsights: {
        primaryAudience: analysis.target_audience_insights?.primary_audience || context.targetAudience || 'General users',
        demographics: analysis.target_audience_insights?.demographics || { age: '25-45', income: 'Medium' },
        psychographics: analysis.target_audience_insights?.psychographics || { values: ['Quality', 'Innovation'] },
        painPoints: analysis.target_audience_insights?.pain_points || ['Time constraints', 'Budget concerns'],
        motivations: analysis.target_audience_insights?.motivations || ['Better results', 'Efficiency'],
        buyingBehavior: analysis.target_audience_insights?.buying_behavior || { research: 'Thorough', timeline: 'Medium' }
      },
      competitorAnalysis: {
        directCompetitors: analysis.competitor_analysis?.direct_competitors || ['Competitor A', 'Competitor B'],
        competitiveAdvantages: analysis.competitor_analysis?.competitive_advantages || ['Better quality', 'Lower price'],
        marketGaps: analysis.competitor_analysis?.market_gaps || ['Personalization', 'User experience'],
        positioning: analysis.competitor_analysis?.positioning || 'Quality-focused solution'
      },
      strategicRecommendations: {
        messagingStrategy: analysis.strategic_recommendations?.messaging_strategy || 'Focus on unique benefits',
        positioningStatement: analysis.strategic_recommendations?.positioning_statement || `The best solution for ${context.targetAudience || 'your needs'}`,
        keyDifferentiators: analysis.strategic_recommendations?.key_differentiators || ['Quality', 'Support', 'Innovation'],
        marketingChannels: analysis.strategic_recommendations?.marketing_channels || ['Digital marketing', 'Content marketing'],
        contentStrategy: analysis.strategic_recommendations?.content_strategy || 'Educational and benefit-focused content'
      },
      confidenceScore: analysis.confidence_score || 0.75,
      analysisMetadata: {
        analysisId: analysisId || crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sources: ['AI Analysis'],
        dataQuality: analysis.confidence_score || 0.75
      }
    };

    // Optionally save to database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey && userId) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from('document_analysis').insert({
          user_id: userId,
          document_name: `Product Analysis: ${context.productName}`,
          document_type: 'product_intelligence',
          ai_analysis: transformedAnalysis,
          confidence_score: transformedAnalysis.confidenceScore,
          processing_status: 'completed'
        });
        
        console.log('Analysis saved to database');
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Don't fail the entire request if database save fails
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: transformedAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Product intelligence analysis error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
