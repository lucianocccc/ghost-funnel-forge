import { supabase } from '@/integrations/supabase/client';

/**
 * Test utility to validate and fix existing funnels without steps
 */
export const testFunnelValidation = async (shareToken: string) => {
  console.log('🧪 Testing funnel validation for token:', shareToken);
  
  try {
    // Step 1: Check current funnel state
    const { data: currentFunnel, error: fetchError } = await supabase
      .from('interactive_funnels')
      .select(`
        id, name, status, is_public, share_token,
        interactive_funnel_steps (
          id, title, step_type, step_order, is_required
        )
      `)
      .eq('share_token', shareToken)
      .eq('is_public', true)
      .single();

    if (fetchError || !currentFunnel) {
      console.error('❌ Funnel not found:', fetchError);
      return { success: false, error: 'Funnel not found' };
    }

    console.log('📊 Current funnel state:', {
      id: currentFunnel.id,
      name: currentFunnel.name,
      stepCount: currentFunnel.interactive_funnel_steps?.length || 0,
      steps: currentFunnel.interactive_funnel_steps
    });

    // Step 2: Run validation function if no steps
    if (!currentFunnel.interactive_funnel_steps || currentFunnel.interactive_funnel_steps.length === 0) {
      console.log('🔧 Running validation to create steps...');
      
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_public_funnel_steps', {
          funnel_id_param: currentFunnel.id,
          share_token_param: shareToken
        });

      if (validationError) {
        console.error('❌ Validation failed:', validationError);
        return { success: false, error: validationError.message };
      }

      console.log('✅ Validation result:', validationResult);

      // Step 3: Check funnel state after validation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB updates
      
      const { data: updatedFunnel } = await supabase
        .from('interactive_funnels')
        .select(`
          id, name, status,
          interactive_funnel_steps (
            id, title, step_type, step_order, is_required
          )
        `)
        .eq('id', currentFunnel.id)
        .single();

      console.log('📊 Updated funnel state:', {
        id: updatedFunnel?.id,
        name: updatedFunnel?.name,
        stepCount: updatedFunnel?.interactive_funnel_steps?.length || 0,
        steps: updatedFunnel?.interactive_funnel_steps
      });

      return {
        success: true,
        before: currentFunnel.interactive_funnel_steps?.length || 0,
        after: updatedFunnel?.interactive_funnel_steps?.length || 0,
        steps: updatedFunnel?.interactive_funnel_steps
      };
    } else {
      console.log('✅ Funnel already has steps');
      return {
        success: true,
        before: currentFunnel.interactive_funnel_steps.length,
        after: currentFunnel.interactive_funnel_steps.length,
        steps: currentFunnel.interactive_funnel_steps
      };
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Test the full funnel loading flow
 */
export const testFunnelLoadFlow = async (shareToken: string) => {
  console.log('🧪 Testing complete funnel load flow for token:', shareToken);
  
  try {
    // Use the same function that the app uses
    const { data: result, error } = await supabase
      .rpc('get_shared_funnel_safe', {
        share_token_param: shareToken
      });

    if (error) {
      console.error('❌ Load flow failed:', error);
      return { success: false, error: error.message };
    }

    const steps = result?.[0]?.steps;
    const stepCount = Array.isArray(steps) ? steps.length : 0;
    
    console.log('📊 Load flow result:', {
      found: !!result && Array.isArray(result) && result.length > 0,
      funnel: result?.[0] ? {
        id: result[0].id,
        name: result[0].name,
        stepCount
      } : null
    });

    return {
      success: true,
      funnel: result?.[0] || null,
      stepCount
    };

  } catch (error) {
    console.error('❌ Load flow test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Add to window for console testing
if (typeof window !== 'undefined') {
  (window as any).testFunnelValidation = testFunnelValidation;
  (window as any).testFunnelLoadFlow = testFunnelLoadFlow;
}