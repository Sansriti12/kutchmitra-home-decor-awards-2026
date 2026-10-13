-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 09: PHASE H — CMS & CONTENT MANAGEMENT SCHEMA
-- File: 04_Database/migrations/09_phase_h_cms_content_management.sql
-- ==============================================================================
-- Purpose:
--   1. Creates CMS content tables:
--      - `cms_important_dates` (Award milestone timeline management)
--      - `cms_faqs` (Frequently Asked Questions management)
--      - `cms_announcements` (Public notices, alerts, and deadline announcements)
--      - `cms_site_settings` (Contact info, support channels, and homepage notice bar)
--   2. Reuses existing tables:
--      - `jury_profiles` (Public juror profiles, bio, photo, display_order, is_public)
--      - `categories` (Category descriptions and briefs, strictly preserving 12 active)
--      - `winners` (Public winners showcase via authoritative Winner Management)
--      - `audit_logs` (Immutable administrative audit trail)
--   3. Creates public storage bucket `cms-public-assets` for public CMS imagery.
--   4. Configures strict Row-Level Security (RLS) policies for anon, auth, and admin.
--   5. Seeds initial baseline content from approved website data.
--   6. Reloads PostgREST schema cache.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: `cms_important_dates`
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_important_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_number VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    date_text VARCHAR(100) NOT NULL DEFAULT 'TBD',
    start_date DATE NULL,
    end_date DATE NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.cms_important_dates IS 'CMS-managed award milestones and important timeline dates.';

-- ------------------------------------------------------------------------------
-- 2. TABLE: `cms_faqs`
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.cms_faqs IS 'CMS-managed Frequently Asked Questions and answers.';

-- ------------------------------------------------------------------------------
-- 3. TABLE: `cms_announcements`
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    short_description TEXT NULL,
    content TEXT NULL,
    announcement_type VARCHAR(50) NOT NULL DEFAULT 'general',
    badge_text VARCHAR(100) NULL,
    action_url VARCHAR(255) NULL,
    action_label VARCHAR(100) NULL,
    image_url VARCHAR(500) NULL,
    publish_date TIMESTAMPTZ NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.cms_announcements IS 'CMS-managed public notices, deadline updates, and news alerts.';

-- ------------------------------------------------------------------------------
-- 4. TABLE: `cms_site_settings`
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
    office_address TEXT NOT NULL DEFAULT 'Kutchmitra
Nr. Indirabai Park
Bhuj, Kutch – 370001',
    official_email VARCHAR(255) NOT NULL DEFAULT 'Kutchmitraweb@gmail.com',
    helpline_phone VARCHAR(50) NOT NULL DEFAULT '+91 7211189211',
    support_hours VARCHAR(255) NOT NULL DEFAULT 'Monday – Saturday: 10:00 AM – 6:00 PM IST',
    privacy_contact_email VARCHAR(255) NOT NULL DEFAULT 'Kutchmitraweb@gmail.com',
    homepage_banner_active BOOLEAN NOT NULL DEFAULT FALSE,
    homepage_banner_badge VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT',
    homepage_banner_text VARCHAR(255) NOT NULL DEFAULT 'Nominations for the 2026 edition are opening soon across all 12 categories.',
    homepage_banner_link VARCHAR(255) NOT NULL DEFAULT '/categories',
    homepage_banner_link_text VARCHAR(100) NOT NULL DEFAULT 'View Categories',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.cms_site_settings IS 'Global CMS settings, official contact information, and homepage notice strip.';

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET: `cms-public-assets`
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cms-public-assets',
    'cms-public-assets',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- ------------------------------------------------------------------------------
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.cms_important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_site_settings ENABLE ROW LEVEL SECURITY;

-- Important Dates RLS
DROP POLICY IF EXISTS "Public read published cms_important_dates" ON public.cms_important_dates;
CREATE POLICY "Public read published cms_important_dates" ON public.cms_important_dates
    FOR SELECT USING (status = 'published' AND is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage cms_important_dates" ON public.cms_important_dates;
CREATE POLICY "Admins manage cms_important_dates" ON public.cms_important_dates
    FOR ALL TO authenticated
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

-- FAQs RLS
DROP POLICY IF EXISTS "Public read published cms_faqs" ON public.cms_faqs;
CREATE POLICY "Public read published cms_faqs" ON public.cms_faqs
    FOR SELECT USING (status = 'published' AND is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage cms_faqs" ON public.cms_faqs;
CREATE POLICY "Admins manage cms_faqs" ON public.cms_faqs
    FOR ALL TO authenticated
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

-- Announcements RLS
DROP POLICY IF EXISTS "Public read published cms_announcements" ON public.cms_announcements;
CREATE POLICY "Public read published cms_announcements" ON public.cms_announcements
    FOR SELECT USING (status = 'published' AND is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage cms_announcements" ON public.cms_announcements;
CREATE POLICY "Admins manage cms_announcements" ON public.cms_announcements
    FOR ALL TO authenticated
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

-- Site Settings RLS
DROP POLICY IF EXISTS "Public read cms_site_settings" ON public.cms_site_settings;
CREATE POLICY "Public read cms_site_settings" ON public.cms_site_settings
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage cms_site_settings" ON public.cms_site_settings;
CREATE POLICY "Admins manage cms_site_settings" ON public.cms_site_settings
    FOR ALL TO authenticated
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

-- Storage Policies for cms-public-assets
DROP POLICY IF EXISTS "Public read cms assets" ON storage.objects;
CREATE POLICY "Public read cms assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'cms-public-assets');

DROP POLICY IF EXISTS "Admins upload cms assets" ON storage.objects;
CREATE POLICY "Admins upload cms assets" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'cms-public-assets'
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins update cms assets" ON storage.objects;
CREATE POLICY "Admins update cms assets" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'cms-public-assets'
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins delete cms assets" ON storage.objects;
CREATE POLICY "Admins delete cms assets" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'cms-public-assets'
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN ('admin', 'super_admin')
        )
    );

-- ------------------------------------------------------------------------------
-- 7. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Seed Site Settings
INSERT INTO public.cms_site_settings (id, homepage_banner_active, homepage_banner_badge, homepage_banner_text, homepage_banner_link, homepage_banner_link_text)
VALUES ('current', FALSE, 'ANNOUNCEMENT', 'Nominations for the 2026 edition are opening soon across all 12 categories.', '/categories', 'View Categories')
ON CONFLICT (id) DO NOTHING;

-- Seed Important Dates
INSERT INTO public.cms_important_dates (milestone_number, title, description, date_text, status, is_active, display_order)
VALUES
('01', 'Nomination Opens', 'Official opening of the digital nomination portal for all 12 award categories.', 'TBD', 'published', TRUE, 1),
('02', 'Nomination Closes', 'Final deadline for applicants to submit complete dossiers and supporting uploads.', 'TBD', 'published', TRUE, 2),
('03', 'Verification', 'Technical review period to verify completeness and adherence to submission guidelines.', 'TBD', 'published', TRUE, 3),
('04', 'Jury Evaluation', 'Confidential assessment by the independent expert jury across defined evaluation criteria.', 'TBD', 'published', TRUE, 4),
('05', 'Shortlisting', 'Announcement of shortlisted projects advancing to the final awards stage.', 'TBD', 'published', TRUE, 5),
('06', 'Awards Ceremony', 'Grand gala ceremony honoring winners and celebrating architectural excellence.', 'TBD', 'published', TRUE, 6);

-- Seed FAQs (12 approved FAQs from official site)
INSERT INTO public.cms_faqs (question, answer, category, is_featured_homepage, status, is_active, display_order)
VALUES
(
    'Who can nominate for the Kutchmitra Home & Decor Awards 2026?',
    'The awards celebrate excellence across residential architecture, interior design, craftsmanship, and the built environment. Practicing architects, interior designers, landscape specialists, structural consultants, and project studios with completed or eligible works are invited to participate. Detailed category-specific eligibility guidelines will be confirmed by Kutchmitra ahead of portal opening.',
    'Eligibility & Submission',
    TRUE,
    'published',
    TRUE,
    1
),
(
    'How do I submit a nomination?',
    'The nomination process is conducted entirely online through the digital portal: (1) Register your entrant profile, (2) Select your award category, (3) Enter project details and built area, (4) Complete the category-specific questions, (5) Upload required high-resolution drawings and photos, (6) Review your dossier preview, and (7) Submit your final declaration. You may save your progress as a draft at any stage and resume at your convenience.',
    'Eligibility & Submission',
    TRUE,
    'published',
    TRUE,
    2
),
(
    'Can I nominate a project in more than one category?',
    'Yes. Applicants may nominate different projects across multiple categories, or enter a single comprehensive project into more than one eligible category (such as Best Luxury Residence and Interior Designer of the Year), provided each entry fulfills the distinct criteria of that specific category.',
    'Eligibility & Submission',
    TRUE,
    'published',
    TRUE,
    3
),
(
    'What happens after I submit my nomination?',
    'Upon final submission, your nomination dossier receives an official Nomination ID and timestamped confirmation. It enters technical verification to confirm completeness of drawings, narratives, and uploads. Verified entries subsequently advance to the independent Grand Jury for confidential evaluation.',
    'Eligibility & Submission',
    TRUE,
    'published',
    TRUE,
    4
),
(
    'How will entries be evaluated?',
    'Every qualifying entry undergoes a confidential, criteria-based evaluation by the independent jury across five core parameters: Design Excellence & Innovation, Functionality & Usability, Quality of Craftsmanship & Execution, Sustainability & Material Sensitivity, and Contextual Relevance & Cultural Harmony.',
    'Jury & Evaluation',
    TRUE,
    'published',
    TRUE,
    5
),
(
    'Who will evaluate the nominations?',
    'Nominations are evaluated by an independent Grand Jury composed of distinguished architects, interior designers, urban planners, and design authorities. To preserve absolute meritocracy, jury scoring remains confidential, and jurors declare any potential conflict of interest prior to evaluating assigned entries.',
    'Jury & Evaluation',
    TRUE,
    'published',
    TRUE,
    6
),
(
    'When will the jury profiles be announced?',
    'Jury profiles will be announced by Kutchmitra ahead of the jury evaluation stage.',
    'Jury & Evaluation',
    FALSE,
    'published',
    TRUE,
    7
),
(
    'When will the important award dates be announced?',
    'Official milestone dates for nomination opening, submission deadlines, verification, jury evaluation, shortlisting, and the awards gala will be formally announced by Kutchmitra.',
    'General',
    FALSE,
    'published',
    TRUE,
    8
),
(
    'When will shortlisted projects and winners be announced?',
    'A shortlist of qualifying finalist entries will be announced following jury evaluation. The final winners across all 12 categories will be celebrated and officially announced at the grand awards ceremony.',
    'General',
    FALSE,
    'published',
    TRUE,
    9
),
(
    'Does submitting a nomination guarantee an award?',
    'No. Submitting a nomination registers your project for consideration. Awards and commendations are conferred strictly on merit through independent jury deliberations and scoring standards.',
    'General',
    FALSE,
    'published',
    TRUE,
    10
),
(
    'Where can I find the submission requirements?',
    'General guidelines and supported materials (photographs, floor plans, 3D renderings, and project sheets) are listed on our How to Nominate and Category detail pages. Specific upload limits, file formats, and detailed questionnaire guidelines will be confirmed and published by Kutchmitra.',
    'Eligibility & Submission',
    FALSE,
    'published',
    TRUE,
    11
),
(
    'How can I contact Kutchmitra regarding my nomination?',
    'You can connect directly with Kutchmitra via email at Kutchmitraweb@gmail.com, call our dedicated helpline at +91 7211189211, or submit an inquiry through our Contact page. Our regional office is located at Kutchmitra, Nr. Indirabai Park, Bhuj, Kutch – 370001.',
    'Support',
    FALSE,
    'published',
    TRUE,
    12
);

-- Seed Initial Announcement
INSERT INTO public.cms_announcements (title, short_description, announcement_type, badge_text, action_url, action_label, status, is_active, display_order)
VALUES
(
    '2026 Edition Portal Launch',
    'Digital nomination submissions will formally open across all 12 award categories. Review submission guidelines and category briefs in advance.',
    'general',
    'EDITION 2026',
    '/how-to-nominate',
    'Read Guidelines',
    'published',
    TRUE,
    1
);

-- ------------------------------------------------------------------------------
-- 8. PERMISSIONS & SCHEMA CACHE RELOAD
-- ------------------------------------------------------------------------------
GRANT SELECT ON public.cms_important_dates TO anon, authenticated;
GRANT SELECT ON public.cms_faqs TO anon, authenticated;
GRANT SELECT ON public.cms_announcements TO anon, authenticated;
GRANT SELECT ON public.cms_site_settings TO anon, authenticated;

GRANT ALL ON public.cms_important_dates TO service_role;
GRANT ALL ON public.cms_faqs TO service_role;
GRANT ALL ON public.cms_announcements TO service_role;
GRANT ALL ON public.cms_site_settings TO service_role;

NOTIFY pgrst, 'reload schema';
