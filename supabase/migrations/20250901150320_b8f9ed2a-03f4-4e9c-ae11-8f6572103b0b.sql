-- Fix the validate_public_funnel_steps function to use correct step_types
CREATE OR REPLACE FUNCTION public.validate_public_funnel_steps(funnel_id_param uuid, share_token_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- If no steps exist, create default ones with VALID step types
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
            'lead_capture',  -- Using valid step_type
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
            'qualification',  -- Using valid step_type
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
        
        -- Create contact/final step
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
            'form',  -- Using valid step_type for contact
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
$function$;