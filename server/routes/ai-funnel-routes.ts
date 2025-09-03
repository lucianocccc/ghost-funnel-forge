import { Router, Request, Response } from 'express';
import { funnelGenerator, type FunnelGenerationRequest, type GenerationProgress } from '../ai/funnel-generator';
import { supabase } from '../../src/integrations/supabase/client';

const router = Router();

// Interface per request con user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Middleware per autenticazione Supabase
const requireAuth = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * POST /api/ai-funnels/generate
 * Inizia la generazione di un nuovo funnel AI
 */
router.post('/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const request: FunnelGenerationRequest = req.body;

    // Validazione richiesta base
    if (!request.businessContext?.businessName || !request.businessContext?.industry) {
      return res.status(400).json({
        error: 'Business name and industry are required'
      });
    }

    // Crea job di generazione nel database
    const { data: job, error: jobError } = await supabase
      .from('funnel_generation_jobs')
      .insert({
        user_id: userId,
        generation_request: request,
        current_stage: 'market_research',
        progress_percentage: 0,
        current_message: 'Starting funnel generation...'
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating generation job:', jobError);
      return res.status(500).json({ error: 'Failed to start generation job' });
    }

    // Progress callback per aggiornare database
    const progressCallback = async (progress: GenerationProgress) => {
      await supabase
        .from('funnel_generation_jobs')
        .update({
          current_stage: progress.stage,
          progress_percentage: progress.progress,
          current_message: progress.message,
          partial_results: progress.currentData || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
    };

    // Avvia generazione asincrona
    funnelGenerator.generateCompleteFunnel(request, progressCallback)
      .then(async (completeFunnel) => {
        // Salva funnel completo nel database
        const { data: savedFunnel, error: saveError } = await supabase
          .from('ai_generated_funnels')
          .insert({
            user_id: userId,
            name: completeFunnel.funnel.name,
            description: completeFunnel.funnel.description,
            business_name: request.businessContext.businessName,
            industry: request.businessContext.industry,
            target_audience: request.businessContext.targetAudience,
            main_product: request.businessContext.mainProduct,
            unique_value_proposition: request.businessContext.uniqueValueProposition,
            budget: request.businessContext.budget,
            business_location: request.businessContext.businessLocation,
            competitors: request.businessContext.competitors,
            brand_personality: request.businessContext.brandPersonality,
            funnel_structure: completeFunnel.funnel,
            market_research_data: completeFunnel.marketResearch,
            storytelling_data: completeFunnel.storytelling,
            generation_duration_ms: completeFunnel.metadata.generationDuration,
            ai_models_used: completeFunnel.metadata.aiModelsUsed,
            uniqueness_score: completeFunnel.metadata.uniquenessScore,
            estimated_setup_time: completeFunnel.metadata.estimatedSetupTime,
            recommended_budget: completeFunnel.metadata.recommendedBudget
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving funnel:', saveError);
          await supabase
            .from('funnel_generation_jobs')
            .update({
              status: 'failed',
              error_message: 'Failed to save generated funnel',
              updated_at: new Date().toISOString()
            })
            .eq('id', job.id);
          return;
        }

        // Salva varianti se presenti
        if (completeFunnel.variants?.length) {
          const variantInserts = completeFunnel.variants.map(variant => ({
            parent_funnel_id: savedFunnel.id,
            variant_name: `Variant ${completeFunnel.variants!.indexOf(variant) + 1}`,
            funnel_structure: variant.funnel,
            storytelling_data: variant.storytelling,
            uniqueness_score: variant.metadata.uniquenessScore,
            estimated_setup_time: variant.metadata.estimatedSetupTime
          }));

          await supabase
            .from('funnel_variants')
            .insert(variantInserts);
        }

        // Salva steps del funnel principale
        if (completeFunnel.funnel.steps?.length) {
          const stepInserts = completeFunnel.funnel.steps.map(step => ({
            funnel_id: savedFunnel.id,
            step_id: step.id,
            step_type: step.type,
            step_name: step.name,
            step_description: step.description,
            step_content: step.content,
            position: step.position,
            next_step_id: step.nextStepId
          }));

          await supabase
            .from('funnel_steps')
            .insert(stepInserts);
        }

        // Completa il job
        await supabase
          .from('funnel_generation_jobs')
          .update({
            status: 'completed',
            final_funnel_id: savedFunnel.id,
            progress_percentage: 100,
            current_message: 'Funnel generation completed successfully!',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

      })
      .catch(async (error) => {
        console.error('Funnel generation failed:', error);
        await supabase
          .from('funnel_generation_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      });

    // Risposta immediata con job ID
    res.json({
      success: true,
      jobId: job.id,
      message: 'Funnel generation started',
      estimatedDuration: '2-5 minutes'
    });

  } catch (error) {
    console.error('Error in funnel generation endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /api/ai-funnels/generation-status/:jobId
 * Controlla lo status di una generazione in corso
 */
router.get('/generation-status/:jobId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const { data: job, error } = await supabase
      .from('funnel_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: 'Generation job not found' });
    }

    const response = {
      id: job.id,
      status: job.status,
      currentStage: job.current_stage,
      progress: job.progress_percentage,
      message: job.current_message,
      partialResults: job.partial_results,
      finalFunnelId: job.final_funnel_id,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at
    };

    res.json(response);

  } catch (error) {
    console.error('Error checking generation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/ai-funnels
 * Lista tutti i funnel dell'utente
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data: funnels, error, count } = await supabase
      .from('ai_generated_funnels')
      .select(`
        *,
        funnel_variants(*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching funnels:', error);
      return res.status(500).json({ error: 'Failed to fetch funnels' });
    }

    res.json({
      funnels: funnels || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in funnels list endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/ai-funnels/:funnelId
 * Dettaglio di un funnel specifico
 */
router.get('/:funnelId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { funnelId } = req.params;
    const userId = req.user.id;

    const { data: funnel, error } = await supabase
      .from('ai_generated_funnels')
      .select(`
        *,
        funnel_variants(*),
        funnel_steps(*),
        funnel_analytics(*)
      `)
      .eq('id', funnelId)
      .eq('user_id', userId)
      .single();

    if (error || !funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json(funnel);

  } catch (error) {
    console.error('Error fetching funnel details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/ai-funnels/:funnelId/status
 * Aggiorna lo status di un funnel
 */
router.put('/:funnelId/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { funnelId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['draft', 'active', 'paused', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('ai_generated_funnels')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', funnelId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Funnel not found or update failed' });
    }

    res.json({ success: true, funnel: data });

  } catch (error) {
    console.error('Error updating funnel status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/ai-funnels/:funnelId
 * Elimina un funnel
 */
router.delete('/:funnelId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { funnelId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('ai_generated_funnels')
      .delete()
      .eq('id', funnelId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting funnel:', error);
      return res.status(500).json({ error: 'Failed to delete funnel' });
    }

    res.json({ success: true, message: 'Funnel deleted successfully' });

  } catch (error) {
    console.error('Error in funnel deletion endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/ai-funnels/:funnelId/analytics
 * Aggiunge record analytics per un funnel
 */
router.post('/:funnelId/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { funnelId } = req.params;
    const analyticsData = req.body;
    const userId = req.user.id;

    // Verifica che il funnel appartenga all'utente
    const { data: funnel } = await supabase
      .from('ai_generated_funnels')
      .select('id')
      .eq('id', funnelId)
      .eq('user_id', userId)
      .single();

    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    const { data, error } = await supabase
      .from('funnel_analytics')
      .insert({
        funnel_id: funnelId,
        ...analyticsData
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analytics:', error);
      return res.status(500).json({ error: 'Failed to save analytics' });
    }

    res.json({ success: true, analytics: data });

  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;