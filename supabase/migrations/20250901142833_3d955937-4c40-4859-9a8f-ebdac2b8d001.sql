-- Create secure function for validating public funnels
CREATE OR REPLACE FUNCTION public.validate_public_funnel_steps(
    funnel_id_param UUID,
    share_token_param TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    funnel_exists BOOLEAN := FALSE;
    step_count INTEGER := 0;
BEGIN
    -- Verify the funnel exists and is public with the correct share token
    SELECT EXISTS(
        SELECT 1 FROM interactive_funnels 
        WHERE id = funnel_id_param 
        AND share_token = share_token_param 
        AND is_public = true
    ) INTO funnel_exists;
    
    IF NOT funnel_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Check if funnel has steps
    SELECT COUNT(*) INTO step_count
    FROM interactive_funnel_steps 
    WHERE funnel_id = funnel_id_param;
    
    -- If no steps exist, create default ones
    IF step_count = 0 THEN
        -- Create default lead capture step
        INSERT INTO interactive_funnel_steps (
            funnel_id,
            title,
            description,
            step_type,
            step_order,
            is_required,
            fields_config,
            settings
        ) VALUES (
            funnel_id_param,
            'Iniziamo',
            'Condividi le tue informazioni di base',
            'lead_capture',
            1,
            true,
            '[
                {
                    "id": "name",
                    "type": "text",
                    "label": "Nome",
                    "required": true,
                    "placeholder": "Il tuo nome"
                },
                {
                    "id": "email",
                    "type": "email",
                    "label": "Email",
                    "required": true,
                    "placeholder": "La tua email"
                }
            ]'::jsonb,
            '{"submitButtonText": "Continua"}'::jsonb
        );
        
        -- Create qualification step
        INSERT INTO interactive_funnel_steps (
            funnel_id,
            title,
            description,
            step_type,
            step_order,
            is_required,
            fields_config,
            settings
        ) VALUES (
            funnel_id_param,
            'Le tue esigenze',
            'Aiutaci a capire meglio le tue necessità',
            'qualification',
            2,
            true,
            '[
                {
                    "id": "needs",
                    "type": "checkbox",
                    "label": "Cosa stai cercando?",
                    "required": true,
                    "options": ["Qualità", "Prezzo", "Velocità", "Supporto", "Innovazione"]
                }
            ]'::jsonb,
            '{"submitButtonText": "Avanti"}'::jsonb
        );
        
        -- Create contact form step
        INSERT INTO interactive_funnel_steps (
            funnel_id,
            title,
            description,
            step_type,
            step_order,
            is_required,
            fields_config,
            settings
        ) VALUES (
            funnel_id_param,
            'Contattaci',
            'Lasciaci i tuoi dati per essere ricontattato',
            'contact_form',
            3,
            true,
            '[
                {
                    "id": "phone",
                    "type": "tel",
                    "label": "Telefono",
                    "required": false,
                    "placeholder": "Il tuo numero di telefono"
                },
                {
                    "id": "message",
                    "type": "textarea",
                    "label": "Messaggio",
                    "required": false,
                    "placeholder": "Raccontaci di più..."
                }
            ]'::jsonb,
            '{"submitButtonText": "Invia richiesta"}'::jsonb
        );
        
        -- Update funnel status to active if it's public
        UPDATE interactive_funnels 
        SET status = 'active', updated_at = now()
        WHERE id = funnel_id_param AND is_public = true;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create function to get public funnel with steps safely
CREATE OR REPLACE FUNCTION public.get_public_funnel_with_steps(share_token_param TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    status TEXT,
    is_public BOOLEAN,
    share_token TEXT,
    views_count INTEGER,
    submissions_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    interactive_funnel_steps JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.description,
        f.status,
        f.is_public,
        f.share_token,
        f.views_count,
        f.submissions_count,
        f.created_at,
        f.updated_at,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', s.id,
                        'funnel_id', s.funnel_id,
                        'title', s.title,
                        'description', s.description,
                        'step_type', s.step_type,
                        'step_order', s.step_order,
                        'fields_config', s.fields_config,
                        'is_required', s.is_required,
                        'settings', s.settings,
                        'created_at', s.created_at,
                        'updated_at', s.updated_at
                    )
                    ORDER BY s.step_order
                )
                FROM interactive_funnel_steps s
                WHERE s.funnel_id = f.id
            ),
            '[]'::jsonb
        ) as interactive_funnel_steps
    FROM interactive_funnels f
    WHERE f.share_token = share_token_param 
    AND f.is_public = true;
END;
$$;

-- Update RLS policies to allow anonymous access to public funnels
DROP POLICY IF EXISTS "Allow anonymous read of public funnel steps" ON interactive_funnel_steps;
CREATE POLICY "Allow anonymous read of public funnel steps" 
ON interactive_funnel_steps FOR SELECT 
USING (
    funnel_id IN (
        SELECT id FROM interactive_funnels 
        WHERE is_public = true
    )
);