-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 04: CREATE ADMIN NOTES TABLE & RLS POLICIES
-- File: 04_Database/migrations/04_create_admin_notes.sql
-- ==============================================================================
-- Purpose:
--   Creates the dedicated `public.admin_notes` table to store confidential internal
--   observations, desk audit commentary, and review notes made by administrators
--   and verification team members.
--
-- Security & Confidentiality:
--   - Row Level Security (RLS) is enabled.
--   - Only authenticated users with roles 'admin', 'super_admin', or 'verification_team'
--     can SELECT or INSERT admin notes.
--   - Applicants have ZERO SELECT, INSERT, UPDATE, or DELETE access.
--   - Safe & Idempotent: Can be run multiple times safely.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.admin_notes IS 'Confidential internal notes by administrators and verification team. Strictly inaccessible to applicants.';
COMMENT ON COLUMN public.admin_notes.note_text IS 'Internal review, verification observation, or administrative commentary.';

-- Indexes for performant lookups by application and sorting by date
CREATE INDEX IF NOT EXISTS idx_admin_notes_application_id ON public.admin_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_author_id ON public.admin_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON public.admin_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to allow clean re-application
DROP POLICY IF EXISTS "Admin and verification team can view admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admin and verification team can insert admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Super admins can delete admin notes" ON public.admin_notes;

-- SELECT: Only admin, super_admin, and verification_team can read notes
CREATE POLICY "Admin and verification team can view admin notes"
    ON public.admin_notes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin', 'verification_team')
        )
    );

-- INSERT: Only admin, super_admin, and verification_team can create notes
CREATE POLICY "Admin and verification team can insert admin notes"
    ON public.admin_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin', 'verification_team')
        )
    );

-- DELETE: Only super_admin can delete admin notes if necessary
CREATE POLICY "Super admins can delete admin notes"
    ON public.admin_notes FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id = 'super_admin'
        )
    );

-- Permissions
GRANT ALL ON public.admin_notes TO postgres, service_role;
GRANT SELECT, INSERT ON public.admin_notes TO authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
