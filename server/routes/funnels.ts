import express from 'express';
import { db } from '../db';
import { funnels, leads, analyticsEvents } from '../schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all funnels for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userFunnels = await db.select()
      .from(funnels)
      .where(eq(funnels.userId, userId));

    res.json({ funnels: userFunnels });
  } catch (error) {
    console.error('Error fetching funnels:', error);
    res.status(500).json({ error: 'Failed to fetch funnels' });
  }
});

// Create new funnel
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, type, config } = req.body;
    
    const [newFunnel] = await db.insert(funnels).values({
      userId,
      name,
      description,
      type,
      config,
      status: 'draft'
    }).returning();

    res.json({ funnel: newFunnel });
  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({ error: 'Failed to create funnel' });
  }
});

// Update funnel
router.put('/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    const updates = req.body;
    
    const [updatedFunnel] = await db.update(funnels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(funnels.id, funnelId))
      .returning();

    res.json({ funnel: updatedFunnel });
  } catch (error) {
    console.error('Error updating funnel:', error);
    res.status(500).json({ error: 'Failed to update funnel' });
  }
});

// Delete funnel
router.delete('/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    
    await db.delete(funnels)
      .where(eq(funnels.id, funnelId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({ error: 'Failed to delete funnel' });
  }
});

// Get funnel analytics
router.get('/:funnelId/analytics', async (req, res) => {
  try {
    const { funnelId } = req.params;
    
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.funnelId, funnelId));

    const funnelLeads = await db.select()
      .from(leads)
      .where(eq(leads.funnelId, funnelId));

    res.json({
      events,
      leads: funnelLeads,
      totalLeads: funnelLeads.length,
      conversionRate: events.length > 0 ? (funnelLeads.length / events.length) * 100 : 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;