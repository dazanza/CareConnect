-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Fix function search path for cleanup_old_notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = true;
END;
$$;

-- Fix function search path for create_appointment_reminder
CREATE OR REPLACE FUNCTION public.create_appointment_reminder()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, message, data)
    VALUES (
        NEW.user_id::uuid,
        'APPOINTMENT_REMINDER',
        'You have an upcoming appointment',
        jsonb_build_object(
            'appointment_id', NEW.id,
            'appointment_date', NEW.date,
            'patient_id', NEW.patient_id
        )
    );
    RETURN NEW;
END;
$$;

-- Fix function search path for create_timeline_event_vitals
CREATE OR REPLACE FUNCTION public.create_timeline_event_vitals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.timeline_events (
        patient_id,
        user_id,
        type,
        date,
        title,
        description,
        metadata,
        created_by,
        vitals_id
    )
    VALUES (
        NEW.patient_id,
        NEW.user_id::uuid,
        'VITALS'::text,
        NEW.date_time,
        'Vitals Recorded',
        'New vitals measurement recorded',
        jsonb_build_object(
            'blood_pressure', NEW.blood_pressure,
            'heart_rate', NEW.heart_rate,
            'temperature', NEW.temperature,
            'oxygen_saturation', NEW.oxygen_saturation,
            'blood_sugar', NEW.blood_sugar
        ),
        NEW.user_id::uuid,
        NEW.id
    );
    RETURN NEW;
END;
$$;

-- Fix function search path for create_timeline_event_lab_results
CREATE OR REPLACE FUNCTION public.create_timeline_event_lab_results()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.timeline_events (
        patient_id,
        user_id,
        type,
        date,
        title,
        description,
        metadata,
        created_by,
        lab_result_id
    )
    VALUES (
        NEW.patient_id,
        NEW.user_id,
        'LAB_RESULT'::text,
        NEW.date,
        'Lab Result: ' || NEW.test_name,
        'New lab result recorded: ' || NEW.test_name || ' - ' || NEW.result_value || COALESCE(' ' || NEW.unit, ''),
        jsonb_build_object(
            'test_name', NEW.test_name,
            'test_type', NEW.test_type,
            'result_value', NEW.result_value,
            'unit', NEW.unit,
            'reference_range', NEW.reference_range
        ),
        NEW.user_id,
        NEW.id
    );
    RETURN NEW;
END;
$$;

-- Fix requesting_user_id_immutable function
CREATE OR REPLACE FUNCTION public.requesting_user_id_immutable()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'email')::text
  );
$$;

-- Fix requesting_user_id function (original function)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.requesting_user_id_immutable();
$$; 