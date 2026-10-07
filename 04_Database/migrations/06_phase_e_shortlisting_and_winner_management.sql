-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 06: SHORTLISTING, WINNER MANAGEMENT & GRAND FINALE RESULTS
-- File: 04_Database/migrations/06_phase_e_shortlisting_and_winner_management.sql
-- ==============================================================================
-- Purpose:
--   1. Enhances `application_shortlists` with committee locking metadata.
--   2. Enhances `winners` with editorial showcase fields and publication workflow.
--   3. Seeds authorized status transitions for shortlisting and winner reversion.
--   4. Strengthens Row-Level Security (RLS) policies for shortlists and winners.
--   5. Refreshes PostgREST schema cache.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENHANCE `application_shortlists` TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.application_shortlists
    ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS locked_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS deliberation_notes TEXT NULL,
    ADD COLUMN IF NOT EXISTS shortlist_rank INTEGER NULL;

COMMENT ON COLUMN public.application_shortlists.locked_at IS 'Timestamp when the committee officially locked the shortlist.';
COMMENT ON COLUMN public.application_shortlists.locked_by IS 'Administrator user ID who executed the shortlist lock.';
COMMENT ON COLUMN public.application_shortlists.deliberation_notes IS 'Confidential committee deliberation notes for final review.';

-- ------------------------------------------------------------------------------
-- 2. ENHANCE `winners` TABLE WITH EDITORIAL PROFILES & PUBLICATION WORKFLOW
-- ------------------------------------------------------------------------------
ALTER TABLE public.winners
    ADD COLUMN IF NOT EXISTS winner_title VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS winner_type VARCHAR(50) NOT NULL DEFAULT 'winner',
    ADD COLUMN IF NOT EXISTS publication_status VARCHAR(50) NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS project_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS entrant_name VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS organization_name VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS project_location VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS summary_description TEXT NULL,
    ADD COLUMN IF NOT EXISTS editorial_statement TEXT NULL,
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.winners.winner_type IS 'Category honor type: winner, runner_up, special_commendation, finalist.';
COMMENT ON COLUMN public.winners.publication_status IS 'Editorial publication workflow: draft, approved, published.';
COMMENT ON COLUMN public.winners.is_published IS 'Strict boolean gate: TRUE only when officially published for public showcase.';

-- ------------------------------------------------------------------------------
-- 3. SEED AUTHORIZED STATUS TRANSITIONS FOR SHORTLISTING & WINNER REVERSION
-- ------------------------------------------------------------------------------
INSERT INTO public.status_transitions (from_status, to_status, allowed_role)
VALUES
    ('shortlisted', 'jury_review', 'admin'),
    ('shortlisted', 'jury_review', 'super_admin'),
    ('winner', 'shortlisted', 'admin'),
    ('winner', 'shortlisted', 'super_admin'),
    ('jury_review', 'rejected', 'super_admin'),
    ('shortlisted', 'rejected', 'super_admin'),
    ('jury_review', 'disqualified', 'super_admin'),
    ('shortlisted', 'disqualified', 'super_admin')
ON CONFLICT (from_status, to_status, allowed_role) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Ensure RLS is active on both tables
ALTER TABLE public.application_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- SHORTLISTS: Admin & Super Admin Full Access
DROP POLICY IF EXISTS "Admins full access shortlists" ON public.application_shortlists;
CREATE POLICY "Admins full access shortlists"
    ON public.application_shortlists FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

-- WINNERS: Admin & Super Admin Full Access
DROP POLICY IF EXISTS "Admins full access winners" ON public.winners;
CREATE POLICY "Admins full access winners"
    ON public.winners FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

-- WINNERS: Public Read Access Strictly Gated to Published Winners
DROP POLICY IF EXISTS "Public can view published winners" ON public.winners;
CREATE POLICY "Public can view published winners"
    ON public.winners FOR SELECT
    USING (is_published = TRUE AND publication_status = 'published');

-- ------------------------------------------------------------------------------
-- 5. REFRESH SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
