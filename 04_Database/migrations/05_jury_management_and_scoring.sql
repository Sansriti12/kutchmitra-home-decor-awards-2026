-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 05: JURY MANAGEMENT, CRITERIA & EVALUATION SCHEMA ENHANCEMENT
-- File: 04_Database/migrations/05_jury_management_and_scoring.sql
-- ==============================================================================
-- Purpose:
--   1. Seeds the 5 approved Kutchmitra evaluation criteria into `scoring_criteria`.
--   2. Enhances `jury_evaluations` and `jury_scores` with qualitative evaluation fields.
--   3. Configures secure Row-Level Security (RLS) policies for Jury and Admin access.
--   4. Grants required permissions and refreshes PostgREST schema cache.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED 5 APPROVED KUTCHMITRA EVALUATION CRITERIA
-- ------------------------------------------------------------------------------
INSERT INTO public.scoring_criteria (
    id,
    edition_id,
    category_id,
    code,
    title,
    description,
    weight_percentage,
    max_score,
    display_order,
    is_active
) VALUES
(
    'c2026001-0000-0000-0000-000000000001',
    'e2026000-0000-0000-0000-000000002026',
    NULL,
    'design_excellence_innovation',
    'Design Excellence & Innovation',
    'Aesthetic distinction, spatial clarity, design thinking, originality of concept, and creative architectural or interior problem-solving.',
    20.00,
    5.00,
    1,
    TRUE
),
(
    'c2026002-0000-0000-0000-000000000002',
    'e2026000-0000-0000-0000-000000002026',
    NULL,
    'functionality_usability',
    'Functionality & Usability',
    'Liveability, efficient space planning, intelligent circulation flow, ergonomic comfort, and functional responsiveness to occupants lifestyle.',
    20.00,
    5.00,
    2,
    TRUE
),
(
    'c2026003-0000-0000-0000-000000000003',
    'e2026000-0000-0000-0000-000000002026',
    NULL,
    'craftsmanship_execution',
    'Quality of Craftsmanship & Execution',
    'Structural integrity, precision detailing, finishing craftsmanship, material joining excellence, and execution fidelity.',
    20.00,
    5.00,
    3,
    TRUE
),
(
    'c2026004-0000-0000-0000-000000000004',
    'e2026000-0000-0000-0000-000000002026',
    NULL,
    'sustainability_material',
    'Sustainability & Material Sensitivity',
    'Resource efficiency, passive climate response, natural daylighting and ventilation, durability, and environmentally sensitive material choices.',
    20.00,
    5.00,
    4,
    TRUE
),
(
    'c2026005-0000-0000-0000-000000000005',
    'e2026000-0000-0000-0000-000000002026',
    NULL,
    'cultural_context',
    'Contextual Relevance & Cultural Harmony',
    'Distinctiveness, cultural heritage integration, sensitivity to Kutch regional identity, climate adaptation, and lasting spatial contribution.',
    20.00,
    5.00,
    5,
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    weight_percentage = EXCLUDED.weight_percentage,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. ENHANCE JURY EVALUATIONS & SCORES WITH QUALITATIVE EVALUATION FIELDS
-- ------------------------------------------------------------------------------
ALTER TABLE public.jury_evaluations
    ADD COLUMN IF NOT EXISTS strengths TEXT NULL,
    ADD COLUMN IF NOT EXISTS areas_of_concern TEXT NULL,
    ADD COLUMN IF NOT EXISTS recommendation VARCHAR(60) NULL,
    ADD COLUMN IF NOT EXISTS qualitative_assessment TEXT NULL;

ALTER TABLE public.jury_scores
    ADD COLUMN IF NOT EXISTS qualitative_rating VARCHAR(60) NULL;

-- ------------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY POLICIES
-- ------------------------------------------------------------------------------

-- JURY PROFILES
ALTER TABLE public.jury_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access jury profiles" ON public.jury_profiles;
CREATE POLICY "Admins full access jury profiles"
    ON public.jury_profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Jurors view own profile" ON public.jury_profiles;
CREATE POLICY "Jurors view own profile"
    ON public.jury_profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public can view public jury profiles" ON public.jury_profiles;
CREATE POLICY "Public can view public jury profiles"
    ON public.jury_profiles FOR SELECT
    USING (is_public = TRUE);

-- JURY ASSIGNMENTS
ALTER TABLE public.jury_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access jury assignments" ON public.jury_assignments;
CREATE POLICY "Admins full access jury assignments"
    ON public.jury_assignments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Jurors view own assignments" ON public.jury_assignments;
CREATE POLICY "Jurors view own assignments"
    ON public.jury_assignments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jury_profiles jp
            WHERE jp.id = jury_assignments.jury_profile_id
            AND jp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Jurors update own conflict status" ON public.jury_assignments;
CREATE POLICY "Jurors update own conflict status"
    ON public.jury_assignments FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jury_profiles jp
            WHERE jp.id = jury_assignments.jury_profile_id
            AND jp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.jury_profiles jp
            WHERE jp.id = jury_assignments.jury_profile_id
            AND jp.user_id = auth.uid()
        )
    );

-- SCORING CRITERIA
ALTER TABLE public.scoring_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access scoring criteria" ON public.scoring_criteria;
CREATE POLICY "Admins full access scoring criteria"
    ON public.scoring_criteria FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Authenticated users view active scoring criteria" ON public.scoring_criteria;
CREATE POLICY "Authenticated users view active scoring criteria"
    ON public.scoring_criteria FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- JURY EVALUATIONS
ALTER TABLE public.jury_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access jury evaluations" ON public.jury_evaluations;
CREATE POLICY "Admins full access jury evaluations"
    ON public.jury_evaluations FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Jurors manage own evaluations" ON public.jury_evaluations;
CREATE POLICY "Jurors manage own evaluations"
    ON public.jury_evaluations FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jury_assignments ja
            JOIN public.jury_profiles jp ON ja.jury_profile_id = jp.id
            WHERE ja.id = jury_evaluations.jury_assignment_id
            AND jp.user_id = auth.uid()
        )
    );

-- JURY SCORES
ALTER TABLE public.jury_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access jury scores" ON public.jury_scores;
CREATE POLICY "Admins full access jury scores"
    ON public.jury_scores FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Jurors manage own scores" ON public.jury_scores;
CREATE POLICY "Jurors manage own scores"
    ON public.jury_scores FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jury_evaluations je
            JOIN public.jury_assignments ja ON je.jury_assignment_id = ja.id
            JOIN public.jury_profiles jp ON ja.jury_profile_id = jp.id
            WHERE je.id = jury_scores.evaluation_id
            AND jp.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. PERMISSIONS & SCHEMA CACHE RELOAD
-- ------------------------------------------------------------------------------
GRANT ALL ON public.jury_profiles TO postgres, service_role;
GRANT SELECT ON public.jury_profiles TO authenticated;

GRANT ALL ON public.jury_assignments TO postgres, service_role;
GRANT SELECT, UPDATE ON public.jury_assignments TO authenticated;

GRANT ALL ON public.scoring_criteria TO postgres, service_role;
GRANT SELECT ON public.scoring_criteria TO authenticated;

GRANT ALL ON public.jury_evaluations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.jury_evaluations TO authenticated;

GRANT ALL ON public.jury_scores TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jury_scores TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
