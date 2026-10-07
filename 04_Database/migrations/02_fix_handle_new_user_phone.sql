-- ==============================================================================
-- Migration: 02_fix_handle_new_user_phone.sql
-- Description:
--   1. Updates public.handle_new_user() trigger function to extract phone from
--      COALESCE(new.phone, new.raw_user_meta_data->>'phone'), ensuring that
--      applicant phone numbers provided during registration are saved into
--      public.users.phone.
--   2. Performs safe, idempotent backfill for existing users who have phone
--      stored in auth.users.raw_user_meta_data while public.users.phone IS NULL.
-- ==============================================================================

-- Part 1: Update the handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, phone, full_name, is_active)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
        SET email     = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
            phone     = COALESCE(EXCLUDED.phone, public.users.phone);

    -- Default to applicant role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, 'applicant')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

-- Ensure the trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Part 2: One-time safe backfill of existing missing phone numbers
-- Only updates where public.users.phone is NULL or blank, preserving any existing value
UPDATE public.users u
SET phone = a.raw_user_meta_data->>'phone'
FROM auth.users a
WHERE u.id = a.id
  AND (u.phone IS NULL OR u.phone = '')
  AND a.raw_user_meta_data->>'phone' IS NOT NULL;
