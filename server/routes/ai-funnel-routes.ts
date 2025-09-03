import { Router, Request, Response } from 'express';
import { funnelGenerator, type FunnelGenerationRequest, type GenerationProgress } from '../ai/funnel-generator';

const router = Router();

// Interface per request con user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// In-memory storage per generazione jobs (temporaneo)
interface GenerationJob {
  id: string;
  userId: string;
  status: 'running' | 'completed' | 'failed';
  currentStage: string;
  progress: number;
  message: string;
  result?: any;
  error?: string;
  startedAt: Date;
}

const generationJobs = new Map<string, GenerationJob>();

// Middleware per autenticazione semplificato (per development)
const requireAuth = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // Per ora, simuliamo un utente autenticato
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || token === 'undefined') {
      // Utente di test per development
      req.user = { id: 'dev-user-123', email: 'test@example.com' };
    } else {
      // Simulazione validazione token
      req.user = { id: 'user-' + Math.random().toString(36).substr(2, 9), email: 'user@example.com' };
    }
    
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
    const userId = req.user!.id;
    const request: FunnelGenerationRequest = req.body;

    // Validazione richiesta base
    if (!request.businessContext?.businessName || !request.businessContext?.industry) {
      return res.status(400).json({
        error: 'Business name and industry are required'
      });
    }

    // Crea job di generazione in memoria
    const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const job: GenerationJob = {
      id: jobId,
      userId,
      status: 'running',
      currentStage: 'market_research',
      progress: 0,
      message: 'Starting funnel generation...',
      startedAt: new Date()
    };
    
    generationJobs.set(jobId, job);

    // Progress callback per aggiornare job in memoria
    const progressCallback = async (progress: GenerationProgress) => {
      const currentJob = generationJobs.get(jobId);
      if (currentJob) {
        currentJob.currentStage = progress.stage;
        currentJob.progress = progress.progress;
        currentJob.message = progress.message;
        generationJobs.set(jobId, currentJob);
      }
    };

    // Avvia generazione in background
    setTimeout(async () => {
      try {
        const result = await funnelGenerator.generateCompleteFunnel(request, progressCallback);
        
        // Aggiorna job come completato
        const currentJob = generationJobs.get(jobId);
        if (currentJob) {
          currentJob.status = 'completed';
          currentJob.result = result;
          currentJob.progress = 100;
          currentJob.message = 'Funnel generation completed!';
          generationJobs.set(jobId, currentJob);
        }

        console.log('Funnel generated successfully:', result.funnel?.name || 'AI Generated Funnel');

      } catch (error) {
        console.error('Generation error:', error);
        const currentJob = generationJobs.get(jobId);
        if (currentJob) {
          currentJob.status = 'failed';
          currentJob.error = error.message;
          generationJobs.set(jobId, currentJob);
        }
      }
    }, 100);

    res.json({
      success: true,
      jobId: jobId,
      message: 'Funnel generation started'
    });

  } catch (error) {
    console.error('Error starting generation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-funnels/generation-status/:jobId
 * Ottiene lo status di un job di generazione
 */
router.get('/generation-status/:jobId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.id;

    const job = generationJobs.get(jobId);
    
    if (!job || job.userId !== userId) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      status: job.status,
      currentStage: job.currentStage,
      progress: job.progress,
      message: job.message,
      result: job.result,
      errorMessage: job.error,
      startedAt: job.startedAt
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-funnels/user-funnels
 * Ottiene tutti i funnel generati dall'AI per l'utente
 */
router.get('/user-funnels', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Per ora restituisce i funnel completati da questo utente
    const userJobs = Array.from(generationJobs.values())
      .filter(job => job.userId === userId && job.status === 'completed')
      .map(job => ({
        id: job.id,
        name: job.result?.name || 'Generated Funnel',
        description: job.result?.description || 'AI-generated marketing funnel',
        ai_generated: true,
        created_at: job.startedAt,
        config: job.result
      }));

    res.json({ funnels: userJobs });

  } catch (error) {
    console.error('Error fetching user funnels:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;