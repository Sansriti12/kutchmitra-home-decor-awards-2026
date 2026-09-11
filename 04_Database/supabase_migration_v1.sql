-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026 — SUPABASE MASTER MIGRATION V1
-- Platform: Supabase Free (PostgreSQL 15+)
-- Ground Truth: 04_Database/schema.sql & 04_Database/seed_reference_data.sql
-- Contains:
--   - All 28 Tables from schema.sql (Fully preserved)
--   - Multi-edition composite integrity & partial indexes
--   - Supabase Auth sync trigger (auth.users -> public.users + default role)
--   - Granular RLS policies (Public, Applicant, Jury, Admin)
--   - Private storage bucket (application-files) with folder-level access policies
--   - Seed data for 2026 Edition, 5 roles, 10 workflow states, 12 categories
-- NOTE: Scoring criteria are intentionally omitted pending committee ratification.
-- ==============================================================================

-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS — DATABASE SCHEMA (PostgreSQL)
-- Architecture: Multi-Edition, Configurable Awards & Nomination Management System
-- Compatibility: Standard PostgreSQL 14+ / Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CORE SYSTEM & AWARD EDITIONS
-- ==============================================================================

-- Award editions represent distinct annual cycles (e.g., 2026, 2027, 2028).
-- All categories, questions, applications, and winners belong to an edition.
CREATE TABLE award_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'nominations_open', 'nominations_closed', 'under_evaluation', 'completed', 'archived')),
    nomination_start_at TIMESTAMPTZ NULL,  -- Nullable: 2026 dates are provisional/TBD
    nomination_end_at TIMESTAMPTZ NULL,
    verification_start_at TIMESTAMPTZ NULL,
    verification_end_at TIMESTAMPTZ NULL,
    judging_start_at TIMESTAMPTZ NULL,
    judging_end_at TIMESTAMPTZ NULL,
    ceremony_date TIMESTAMPTZ NULL,
    description TEXT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE award_editions IS 'Annual award cycles allowing complete reusability for future editions without schema alterations.';

-- ==============================================================================
-- 2. ROLES & USERS
-- ==============================================================================

-- Defined roles according to project BRD security boundaries
CREATE TABLE roles (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    description TEXT NULL
);

COMMENT ON TABLE roles IS 'System roles: applicant, verification_team, jury_member, admin, super_admin.';

-- Central application users directory.
-- When integrated with Supabase Auth or external JWT auth, id matches auth.users.id.
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Application user directory linked to authentication provider ID without storing plaintext credentials.';

-- User role assignments (supports multi-role and edition-scoped roles)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    edition_id UUID NULL REFERENCES award_editions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_roles IS 'Many-to-many role assignments with optional edition scope.';

-- Profile specific to applicants
CREATE TABLE applicant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(200) NULL,
    designation VARCHAR(100) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NULL,
    address_line TEXT NULL,
    website_url VARCHAR(255) NULL,
    portfolio_url VARCHAR(255) NULL,
    terms_accepted_at TIMESTAMPTZ NOT NULL,
    privacy_accepted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE applicant_profiles IS 'Applicant registration profile details separated from core identity.';

-- Profile specific to jury members
CREATE TABLE jury_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE RESTRICT,
    honorific VARCHAR(20) NULL,
    organization VARCHAR(200) NULL,
    designation VARCHAR(150) NULL,
    bio TEXT NULL,
    photo_url VARCHAR(500) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Kept FALSE until organizing committee ratifies
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_jury_profile_id_edition UNIQUE(id, edition_id)
);

COMMENT ON TABLE jury_profiles IS 'Jury member profiles with public visibility switch controlled by committee.';

-- ==============================================================================
-- 3. CATEGORIES & DYNAMIC CONFIGURATION
-- ==============================================================================

-- Configurable award categories per edition
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE RESTRICT,
    code VARCHAR(10) NOT NULL,           -- e.g. "01", "02", ... "12"
    name VARCHAR(150) NOT NULL,          -- e.g. "Architect of the Year"
    slug VARCHAR(150) NOT NULL,          -- e.g. "architect-of-the-year"
    short_description TEXT NOT NULL,
    full_description TEXT NULL,
    eligibility_criteria TEXT NULL,
    cover_image_url VARCHAR(500) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_edition_slug UNIQUE(edition_id, slug),
    CONSTRAINT uq_category_edition_code UNIQUE(edition_id, code),
    CONSTRAINT uq_category_id_edition UNIQUE(id, edition_id)
);

COMMENT ON TABLE categories IS 'Admin-configurable categories per award edition (12 approved categories for 2026).';

-- Dynamic category-specific form questions
CREATE TABLE category_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    question_key VARCHAR(60) NOT NULL,   -- Machine key (e.g. built_up_area_sqft)
    question_text TEXT NOT NULL,
    help_text TEXT NULL,
    placeholder TEXT NULL,
    field_type VARCHAR(30) NOT NULL
        CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox', 'url')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    validation_rules JSONB NULL,         -- e.g. {"min": 0, "max": 50000, "pattern": "..."}
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_question_key UNIQUE(category_id, question_key)
);

COMMENT ON TABLE category_questions IS 'Dynamic category questions configured by admin without code changes.';

-- Options for select, radio, or multi-select checkbox questions
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES category_questions(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    value VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_question_option_value UNIQUE(question_id, value)
);

COMMENT ON TABLE question_options IS 'Options for select, radio, and multi-checkbox dynamic questions.';

-- Configurable media upload requirements per category
CREATE TABLE category_upload_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    upload_type VARCHAR(50) NOT NULL
        CHECK (upload_type IN ('cover_image', 'project_photo', 'interior_photo', 'exterior_photo', 'floor_plan', 'rendering_3d', 'portfolio_pdf', 'supporting_doc')),
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    min_count INTEGER NOT NULL DEFAULT 0,
    max_count INTEGER NOT NULL DEFAULT 10,
    max_file_size_mb INTEGER NOT NULL DEFAULT 15,
    allowed_mime_types TEXT[] NOT NULL,  -- e.g. ARRAY['image/jpeg', 'image/png', 'application/pdf']
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_upload_type UNIQUE(category_id, upload_type)
);

COMMENT ON TABLE category_upload_requirements IS 'Configurable upload constraints (MIME, max count, file size) per category.';

-- ==============================================================================
-- 4. APPLICATION STATUS & WORKFLOW ENGINE
-- ==============================================================================

-- Configurable status codes (replaces hard-coded ENUMs to allow future transitions)
CREATE TABLE application_statuses (
    code VARCHAR(30) PRIMARY KEY,
    label VARCHAR(60) NOT NULL,
    description TEXT NULL,
    step_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE application_statuses IS 'Workflow states: draft, submitted, under_verification, eligible, clarification_required, jury_review, shortlisted, winner, rejected, disqualified.';

-- State machine transitions allowed by role
CREATE TABLE status_transitions (
    from_status VARCHAR(30) NOT NULL REFERENCES application_statuses(code),
    to_status VARCHAR(30) NOT NULL REFERENCES application_statuses(code),
    allowed_role VARCHAR(30) NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (from_status, to_status, allowed_role)
);

COMMENT ON TABLE status_transitions IS 'Strict transition matrix enforcing which roles can change an application state.';

-- ==============================================================================
-- 5. APPLICATIONS / NOMINATIONS
-- ==============================================================================

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomination_id VARCHAR(50) NOT NULL UNIQUE, -- Human-readable identifier (e.g., KHA26-01-0001)
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    project_name VARCHAR(250) NOT NULL,
    project_city VARCHAR(100) NOT NULL,
    project_state VARCHAR(100) NOT NULL,
    project_completion_date DATE NULL,
    built_up_area_sqft NUMERIC(12, 2) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' REFERENCES application_statuses(code),
    current_wizard_step INTEGER NOT NULL DEFAULT 1,
    declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    declaration_accepted_at TIMESTAMPTZ NULL,
    submitted_at TIMESTAMPTZ NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE, -- Once submitted, locked against applicant edits
    reopened_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    reopened_at TIMESTAMPTZ NULL,
    reopen_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_category_edition
        FOREIGN KEY (category_id, edition_id)
        REFERENCES categories(id, edition_id) ON DELETE RESTRICT,
    CONSTRAINT uq_application_id_edition UNIQUE(id, edition_id),
    CONSTRAINT uq_application_id_edition_category UNIQUE(id, edition_id, category_id),
    CONSTRAINT uq_applicant_project_category UNIQUE(applicant_id, edition_id, category_id, project_name)
);

COMMENT ON TABLE applications IS 'Core nominations submitted by applicants; belongs to one applicant, one category, one edition.';

-- Application status audit trail
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status VARCHAR(30) NULL REFERENCES application_statuses(code),
    to_status VARCHAR(30) NOT NULL REFERENCES application_statuses(code),
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    comments TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE application_status_history IS 'Complete chronological audit log of status updates per nomination.';

-- Flexible answers to dynamic category questions
CREATE TABLE application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES category_questions(id) ON DELETE RESTRICT,
    answer_text TEXT NULL,               -- Standard string/date/text answers
    answer_number NUMERIC(14, 4) NULL,   -- Numeric value for range queries
    answer_json JSONB NULL,              -- Array/compound answers (e.g. multi-select)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_application_question UNIQUE(application_id, question_id)
);

COMMENT ON TABLE application_answers IS 'Answers to dynamic category questions; supports text, numeric indexing, and JSONB.';

-- Metadata for media and documents uploaded by applicant
CREATE TABLE application_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    upload_requirement_id UUID NULL REFERENCES category_upload_requirements(id) ON DELETE SET NULL,
    upload_type VARCHAR(50) NOT NULL
        CHECK (upload_type IN ('cover_image', 'project_photo', 'interior_photo', 'exterior_photo', 'floor_plan', 'rendering_3d', 'portfolio_pdf', 'supporting_doc')),
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,  -- Bucket key / path in object storage
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'supabase',
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    caption VARCHAR(255) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE application_files IS 'Metadata for all uploaded photos, architectural drawings, and PDFs stored in object storage.';

-- ==============================================================================
-- 6. VERIFICATION & CLARIFICATION
-- ==============================================================================

-- Verification decision records created by Verification Team / Admin
CREATE TABLE verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    verified_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision VARCHAR(30) NOT NULL
        CHECK (decision IN ('eligible', 'ineligible', 'clarification_required')),
    internal_notes TEXT NULL,            -- Confidential verification notes (never seen by applicant)
    verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE verification_records IS 'Verification results with internal notes restricted to verification team.';

-- Formal clarification request cycle between verifiers and applicants
CREATE TABLE clarification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    applicant_message TEXT NOT NULL,     -- Clear explanation shown to applicant in dashboard
    internal_note TEXT NULL,             -- Confidential verification context
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'resolved', 'expired')),
    due_date TIMESTAMPTZ NULL,
    response_text TEXT NULL,
    responded_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clarification_requests IS 'Bi-directional clarification messaging between verification team and applicant.';

-- ==============================================================================
-- 7. JURY ASSIGNMENTS, SCORING & EVALUATIONS
-- ==============================================================================

-- Assigning a jury member to an entire category (optional bulk assignment)
CREATE TABLE jury_category_assignments (
    jury_profile_id UUID NOT NULL REFERENCES jury_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (jury_profile_id, category_id)
);

COMMENT ON TABLE jury_category_assignments IS 'Assigns a juror to review all eligible entries in a category.';

-- Direct application assignments to individual jury members
CREATE TABLE jury_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE RESTRICT,
    jury_profile_id UUID NOT NULL,
    application_id UUID NOT NULL,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined_conflict')),
    conflict_declared BOOLEAN NOT NULL DEFAULT FALSE,
    conflict_reason TEXT NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jury_assignment_juror_edition
        FOREIGN KEY (jury_profile_id, edition_id)
        REFERENCES jury_profiles(id, edition_id) ON DELETE CASCADE,
    CONSTRAINT fk_jury_assignment_application_edition
        FOREIGN KEY (application_id, edition_id)
        REFERENCES applications(id, edition_id) ON DELETE CASCADE,
    CONSTRAINT uq_jury_application_assignment UNIQUE(jury_profile_id, application_id)
);

COMMENT ON TABLE jury_assignments IS 'Explicit assignment link between juror and entry; enforces matching edition between juror and entry.';

-- Configurable scoring criteria per edition / category
CREATE TABLE scoring_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE RESTRICT,
    category_id UUID NULL,               -- NULL = edition-wide default
    code VARCHAR(50) NOT NULL,           -- e.g. "design_excellence", "creativity_innovation"
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    weight_percentage NUMERIC(5, 2) NOT NULL, -- e.g. 25.00
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_criteria_category_edition
        FOREIGN KEY (category_id, edition_id)
        REFERENCES categories(id, edition_id) ON DELETE CASCADE
);

COMMENT ON TABLE scoring_criteria IS 'Configurable scoring weights and criteria; category-specific criteria must belong to the same edition.';

-- Jury evaluation container for an assigned entry
CREATE TABLE jury_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jury_assignment_id UUID NOT NULL UNIQUE REFERENCES jury_assignments(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted')),
    total_weighted_score NUMERIC(6, 2) NULL,
    general_comment TEXT NULL,           -- Confidential jury feedback
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE jury_evaluations IS 'Confidential evaluation submission per juror; locked upon final submission.';

-- Individual scores per criterion within an evaluation
CREATE TABLE jury_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES jury_evaluations(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES scoring_criteria(id) ON DELETE RESTRICT,
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0),
    confidential_comment TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evaluation_criterion UNIQUE(evaluation_id, criterion_id)
);

COMMENT ON TABLE jury_scores IS 'Granular numerical score and confidential notes per criterion.';

-- ==============================================================================
-- 8. SHORTLISTS & WINNERS
-- ==============================================================================

-- Explicit administrative shortlisting decisions
CREATE TABLE application_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE,
    edition_id UUID NOT NULL,
    category_id UUID NOT NULL,
    shortlisted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision_notes TEXT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shortlist_application_edition_category
        FOREIGN KEY (application_id, edition_id, category_id)
        REFERENCES applications(id, edition_id, category_id) ON DELETE CASCADE
);

COMMENT ON TABLE application_shortlists IS 'Shortlisted entries selected after jury review; locked upon final committee decision.';

-- Official winners and published honorees
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE, -- An application can win at most one award title
    edition_id UUID NOT NULL,
    category_id UUID NOT NULL,
    award_title VARCHAR(150) NOT NULL,   -- e.g. "Winner", "Special Commendation", "Runner-Up"
    citation TEXT NULL,                  -- Official commendation citation
    project_story TEXT NULL,             -- Narrative for public winner showcase
    hero_image_url VARCHAR(500) NULL,
    gallery_urls TEXT[] NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE, -- Must be TRUE for public /winners page visibility
    published_at TIMESTAMPTZ NULL,
    published_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_winner_application_edition_category
        FOREIGN KEY (application_id, edition_id, category_id)
        REFERENCES applications(id, edition_id, category_id) ON DELETE RESTRICT
);

COMMENT ON TABLE winners IS 'Official winners showcase; public visibility strictly gated by is_published = TRUE.';

-- ==============================================================================
-- 9. NOTIFICATIONS & AUDIT LOGS
-- ==============================================================================

-- Dispatch and delivery history of notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    edition_id UUID NULL REFERENCES award_editions(id) ON DELETE SET NULL,
    application_id UUID NULL REFERENCES applications(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL
        CHECK (channel IN ('email', 'sms', 'in_app', 'whatsapp')),
    notification_type VARCHAR(60) NOT NULL, -- e.g. 'registration_welcome', 'nomination_submitted'
    recipient_address VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULL,
    body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ NULL,
    error_message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'Notification dispatch log supporting email, SMS, and in-app alerts.';

-- Append-only audit trail for sensitive administrative, jury, and status actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,        -- e.g. 'application_status_change', 'score_submitted'
    entity_type VARCHAR(50) NOT NULL,    -- e.g. 'application', 'jury_evaluation', 'winner'
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Immutable chronological audit trail of all sensitive modifications and state transitions.';

-- ==============================================================================
-- 10. LIGHTWEIGHT CMS / EDITABLE CONTENT
-- ==============================================================================

-- Editable content blocks for website announcements, dates, FAQs, and contact info
CREATE TABLE cms_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES award_editions(id) ON DELETE CASCADE,
    block_key VARCHAR(100) NOT NULL,     -- e.g. 'hero_announcement', 'important_dates', 'contact_details'
    title VARCHAR(200) NULL,
    content_json JSONB NOT NULL,         -- Flexible structured JSON payload
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_edition_cms_block UNIQUE(edition_id, block_key)
);

COMMENT ON TABLE cms_content_blocks IS 'Lightweight JSONB-backed CMS content blocks for public website announcements and copy.';

-- ==============================================================================
-- 11. INDEXES FOR PERFORMANCE & QUERY OPTIMIZATION
-- ==============================================================================

-- Core entity lookups
CREATE INDEX idx_editions_year ON award_editions(year);
CREATE INDEX idx_editions_status ON award_editions(status);
CREATE INDEX idx_users_email ON users(email);
-- User role assignments uniqueness (edition-scoped vs global)
CREATE UNIQUE INDEX uq_user_roles_edition ON user_roles(user_id, role_id, edition_id) WHERE edition_id IS NOT NULL;
CREATE UNIQUE INDEX uq_user_roles_global ON user_roles(user_id, role_id) WHERE edition_id IS NULL;
CREATE INDEX idx_applicant_city_state ON applicant_profiles(city, state);
CREATE INDEX idx_categories_edition_order ON categories(edition_id, display_order);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Application query optimization (frequently filtered by admin & applicant)
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_edition_category ON applications(edition_id, category_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_nomination_id ON applications(nomination_id);
CREATE INDEX idx_applications_city_state ON applications(project_city, project_state);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at) WHERE submitted_at IS NOT NULL;

-- Dynamic answers & uploads
CREATE INDEX idx_answers_application ON application_answers(application_id);
CREATE INDEX idx_answers_question ON application_answers(question_id);
CREATE INDEX idx_answers_number ON application_answers(answer_number) WHERE answer_number IS NOT NULL;
CREATE INDEX idx_files_application ON application_files(application_id);
CREATE INDEX idx_files_upload_type ON application_files(application_id, upload_type);

-- Scoring criteria uniqueness (category-scoped vs edition-wide default)
CREATE UNIQUE INDEX uq_scoring_criteria_category ON scoring_criteria(edition_id, category_id, code) WHERE category_id IS NOT NULL;
CREATE UNIQUE INDEX uq_scoring_criteria_edition_default ON scoring_criteria(edition_id, code) WHERE category_id IS NULL;

-- Verification & Jury workflows
CREATE INDEX idx_verification_decision ON verification_records(decision);
CREATE INDEX idx_clarifications_app_status ON clarification_requests(application_id, status);
CREATE INDEX idx_jury_assignments_juror ON jury_assignments(jury_profile_id, status);
CREATE INDEX idx_jury_assignments_app ON jury_assignments(application_id);
CREATE INDEX idx_jury_evaluations_status ON jury_evaluations(status);
CREATE INDEX idx_jury_scores_eval ON jury_scores(evaluation_id);

-- Winners & shortlists
CREATE INDEX idx_shortlists_edition_cat ON application_shortlists(edition_id, category_id);
CREATE INDEX idx_winners_published ON winners(edition_id, category_id, is_published);
-- Ensure only one primary "Winner" per category, while allowing multiple commendations/honorees
CREATE UNIQUE INDEX uq_category_primary_winner ON winners(category_id) WHERE award_title = 'Winner';

-- Notifications & Audit logs
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, status);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);


-- ==============================================================================
-- 12. SUPABASE AUTH SYNCHRONIZATION TRIGGER (Rule #7)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- 1. Insert or synchronize with public.users
    INSERT INTO public.users (id, email, phone, full_name, is_active)
    VALUES (
        new.id,
        new.email,
        new.phone,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = CURRENT_TIMESTAMP;

    -- 2. Default role assignment as 'applicant' (preserves role architecture)
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, 'applicant')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 13. ROLE HELPER FUNCTIONS & RLS POLICIES (Rule #8)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.has_role(required_role VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_id = required_role
  );
$$;

-- Enable Row Level Security across all 28 tables
ALTER TABLE award_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_upload_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_blocks ENABLE ROW LEVEL SECURITY;

-- --- Public Read Policies (Anon & Authenticated) ---
CREATE POLICY "Public can view active editions" ON award_editions FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active questions" ON category_questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view question options" ON question_options FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view upload requirements" ON category_upload_requirements FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view public jury profiles" ON jury_profiles FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Public can view published winners" ON winners FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view published cms content" ON cms_content_blocks FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view statuses" ON application_statuses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view roles" ON roles FOR SELECT USING (TRUE);

-- --- Applicant Access Policies (Scoped to auth.uid()) ---
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY "Applicants can manage own profile" ON applicant_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Applicants view own applications" ON applications FOR SELECT USING (applicant_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('verification_team'));
CREATE POLICY "Applicants insert own applications" ON applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Applicants update unlocked applications" ON applications FOR UPDATE USING (applicant_id = auth.uid() AND is_locked = FALSE);

CREATE POLICY "Applicants view own answers" ON application_answers FOR SELECT USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND (a.applicant_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('verification_team'))));
CREATE POLICY "Applicants insert own answers" ON application_answers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid() AND a.is_locked = FALSE));
CREATE POLICY "Applicants update own answers" ON application_answers FOR UPDATE USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid() AND a.is_locked = FALSE));
CREATE POLICY "Applicants delete own answers" ON application_answers FOR DELETE USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid() AND a.is_locked = FALSE));

CREATE POLICY "Applicants view own files" ON application_files FOR SELECT USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND (a.applicant_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('verification_team'))));
CREATE POLICY "Applicants insert own files" ON application_files FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid() AND a.is_locked = FALSE));
CREATE POLICY "Applicants delete own files" ON application_files FOR DELETE USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid() AND a.is_locked = FALSE));

CREATE POLICY "Applicants view clarifications" ON clarification_requests FOR SELECT USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND (a.applicant_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('verification_team'))));
CREATE POLICY "Applicants respond to clarifications" ON clarification_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid()));

CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (recipient_user_id = auth.uid());

-- --- Jury Member Policies (Confidential & Scoped) ---
CREATE POLICY "Jurors view assigned applications" ON applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jury_assignments ja
        JOIN jury_profiles jp ON ja.jury_profile_id = jp.id
        WHERE ja.application_id = applications.id
        AND jp.user_id = auth.uid()
        AND ja.conflict_declared = FALSE
    )
);

CREATE POLICY "Jurors view assigned answers" ON application_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jury_assignments ja
        JOIN jury_profiles jp ON ja.jury_profile_id = jp.id
        WHERE ja.application_id = application_answers.application_id
        AND jp.user_id = auth.uid()
        AND ja.conflict_declared = FALSE
    )
);

CREATE POLICY "Jurors view assigned files" ON application_files FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jury_assignments ja
        JOIN jury_profiles jp ON ja.jury_profile_id = jp.id
        WHERE ja.application_id = application_files.application_id
        AND jp.user_id = auth.uid()
        AND ja.conflict_declared = FALSE
    )
);

CREATE POLICY "Jurors manage own evaluations" ON jury_evaluations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM jury_assignments ja
        JOIN jury_profiles jp ON ja.jury_profile_id = jp.id
        WHERE ja.id = jury_assignment_id
        AND jp.user_id = auth.uid()
    )
);

CREATE POLICY "Jurors manage own scores" ON jury_scores FOR ALL USING (
    EXISTS (
        SELECT 1 FROM jury_evaluations je
        JOIN jury_assignments ja ON je.jury_assignment_id = ja.id
        JOIN jury_profiles jp ON ja.jury_profile_id = jp.id
        WHERE je.id = evaluation_id
        AND jp.user_id = auth.uid()
    )
);

-- --- Verification Team Policies ---
CREATE POLICY "Verifiers manage records" ON verification_records FOR ALL USING (public.has_role('verification_team') OR public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Verifiers create clarifications" ON clarification_requests FOR INSERT WITH CHECK (public.has_role('verification_team') OR public.has_role('admin') OR public.has_role('super_admin'));

-- --- Admin & Super Admin Full Access ---
CREATE POLICY "Admins full access editions" ON award_editions FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access categories" ON categories FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access questions" ON category_questions FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access question options" ON question_options FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access upload reqs" ON category_upload_requirements FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access jury profiles" ON jury_profiles FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access jury assignments" ON jury_assignments FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access scoring criteria" ON scoring_criteria FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access shortlists" ON application_shortlists FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access winners" ON winners FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins full access cms" ON cms_content_blocks FOR ALL USING (public.has_role('admin') OR public.has_role('super_admin'));
CREATE POLICY "Admins view audit logs" ON audit_logs FOR SELECT USING (public.has_role('admin') OR public.has_role('super_admin'));

-- ==============================================================================
-- 14. PRIVATE STORAGE BUCKET CONFIGURATION (Rule #9)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('application-files', 'application-files', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Applicants upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Applicants view own files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Staff view application files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'application-files' AND
    (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('verification_team'))
);

-- ==============================================================================
-- 15. INITIAL REFERENCE SEED DATA (Rule #1, #6)
-- ==============================================================================

-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026 — REFERENCE SEED DATA
-- Purpose: Initial operational configuration & BRD-approved reference data
-- Note: Contains ZERO fake users, ZERO fake jurors, ZERO fake winners, ZERO fake dates.
-- ==============================================================================

-- 1. AWARD EDITION: 2026 (Inaugural Edition)
-- Fixed ID used so foreign keys in reference seed scripts can reliably attach.
INSERT INTO award_editions (
    id,
    year,
    name,
    slug,
    status,
    nomination_start_at,
    nomination_end_at,
    verification_start_at,
    verification_end_at,
    judging_start_at,
    judging_end_at,
    ceremony_date,
    description,
    is_current
) VALUES (
    'e2026000-0000-0000-0000-000000002026'::uuid,
    2026,
    'Kutchmitra Home & Decor Awards 2026',
    '2026',
    'upcoming',
    NULL, -- Dates strictly marked NULL (TBD by organizing committee)
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Recognizing visionary architecture, interior design, residential craftsmanship, and spatial innovation across the region.',
    TRUE
) ON CONFLICT (year) DO NOTHING;

-- 2. SYSTEM ROLES
INSERT INTO roles (id, name, description) VALUES
('applicant', 'Applicant', 'Registers, creates and manages project nomination entries.'),
('verification_team', 'Verification Team', 'Reviews submitted entries for eligibility and dossier completeness; issues clarifications.'),
('jury_member', 'Jury Member', 'Evaluates assigned entries and submits confidential criteria scores and commentary.'),
('admin', 'Administrator', 'Operational management of categories, applications, assignments, shortlisting, and CMS.'),
('super_admin', 'Super Administrator', 'Full platform governance, security controls, role assignments, and audit management.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. WORKFLOW STATUSES
INSERT INTO application_statuses (code, label, description, step_order, is_active, is_terminal) VALUES
('draft', 'Draft', 'Applicant has created a draft nomination entry; unsubmitted.', 1, TRUE, FALSE),
('submitted', 'Submitted', 'Application submitted by applicant; locked against further edits.', 2, TRUE, FALSE),
('under_verification', 'Under Verification', 'Verification team is auditing document compliance and eligibility.', 3, TRUE, FALSE),
('clarification_required', 'Clarification Required', 'Action required from applicant to resolve missing or ambiguous details.', 4, TRUE, FALSE),
('eligible', 'Eligible', 'Application passed verification checks; ready for jury assignment.', 5, TRUE, FALSE),
('jury_review', 'Jury Review', 'Entry is assigned to jury members and undergoing scoring.', 6, TRUE, FALSE),
('shortlisted', 'Shortlisted', 'Entry has advanced to the final shortlist upon committee review.', 7, TRUE, FALSE),
('winner', 'Winner', 'Honored as an official award winner or commended recipient.', 8, TRUE, TRUE),
('rejected', 'Rejected', 'Application does not meet eligibility requirements or was not selected.', 9, TRUE, TRUE),
('disqualified', 'Disqualified', 'Entry disqualified due to breach of guidelines or false declaration.', 10, TRUE, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description;

-- 4. STATUS WORKFLOW TRANSITIONS
INSERT INTO status_transitions (from_status, to_status, allowed_role) VALUES
('draft', 'submitted', 'applicant'),
('submitted', 'under_verification', 'verification_team'),
('submitted', 'under_verification', 'admin'),
('under_verification', 'eligible', 'verification_team'),
('under_verification', 'eligible', 'admin'),
('under_verification', 'clarification_required', 'verification_team'),
('under_verification', 'clarification_required', 'admin'),
('clarification_required', 'under_verification', 'applicant'),
('clarification_required', 'under_verification', 'verification_team'),
('clarification_required', 'under_verification', 'admin'),
('under_verification', 'rejected', 'verification_team'),
('under_verification', 'rejected', 'admin'),
('eligible', 'jury_review', 'admin'),
('eligible', 'jury_review', 'super_admin'),
('jury_review', 'shortlisted', 'admin'),
('jury_review', 'shortlisted', 'super_admin'),
('shortlisted', 'winner', 'admin'),
('shortlisted', 'winner', 'super_admin'),
('jury_review', 'rejected', 'admin'),
('shortlisted', 'rejected', 'admin'),
('submitted', 'disqualified', 'admin'),
('under_verification', 'disqualified', 'admin'),
('eligible', 'disqualified', 'admin'),
('jury_review', 'disqualified', 'admin'),
('shortlisted', 'disqualified', 'admin')
ON CONFLICT DO NOTHING;

-- 5. THE 12 APPROVED AWARD CATEGORIES (2026 Edition)
INSERT INTO categories (id, edition_id, code, name, slug, short_description, display_order, is_active) VALUES
('c2026000-0000-0000-0000-000000000001'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '01', 'Architect of the Year', 'architect-of-the-year', 'Honoring comprehensive architectural excellence, spatial innovation, and leadership in residential built design.', 1, TRUE),
('c2026000-0000-0000-0000-000000000002'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '02', 'Best Luxury Residence', 'best-luxury-residence', 'Recognizing exceptional bespoke residential architecture defined by elevated craftsmanship and refined materiality.', 2, TRUE),
('c2026000-0000-0000-0000-000000000003'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '03', 'Best Apartment Design', 'best-apartment-design', 'Celebrating intelligent spatial layouts, bespoke interior interventions, and elevated urban living environments.', 3, TRUE),
('c2026000-0000-0000-0000-000000000004'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '04', 'Best Renovation Project', 'best-renovation-project', 'Highlighting exemplary transformations that reimagine existing structures while honoring structural character.', 4, TRUE),
('c2026000-0000-0000-0000-000000000005'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '05', 'Best Sustainable Home', 'best-sustainable-home', 'Commending climate-responsive architecture, resource-efficient practices, and environmentally conscious design.', 5, TRUE),
('c2026000-0000-0000-0000-000000000006'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '06', 'Ultra-Luxury Residential Project of the Year', 'ultra-luxury-residential-project-of-the-year', 'Acknowledging landmark residential developments that embody peerless luxury, scale, and detailing.', 6, TRUE),
('c2026000-0000-0000-0000-000000000007'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '07', 'Interior Designer of the Year', 'interior-designer-of-the-year', 'Spotlighting creative mastery in interior architecture, materiality curation, bespoke fixtures, and experiential ambience.', 7, TRUE),
('c2026000-0000-0000-0000-000000000008'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '08', 'Emerging Designer', 'emerging-designer', 'Encouraging promising design practitioners demonstrating forward-thinking perspective and original creative rigor.', 8, TRUE),
('c2026000-0000-0000-0000-000000000009'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '09', 'Best Compact Home', 'best-compact-home', 'Recognizing inventive multi-functional planning and meticulous design optimization in compact residential footprints.', 9, TRUE),
('c2026000-0000-0000-0000-000000000010'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '10', 'Best Smart Home', 'best-smart-home', 'Celebrating seamless synergy between intuitive home automation, lighting technology, and architectural aesthetics.', 10, TRUE),
('c2026000-0000-0000-0000-000000000011'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '11', 'Best Themed Project of the Year', 'best-themed-project-of-the-year', 'Commending distinctive design narratives that embody cohesive thematic, cultural, or stylistic execution.', 11, TRUE),
('c2026000-0000-0000-0000-000000000012'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '12', 'Luxury Villa Project of the Year', 'luxury-villa-project-of-the-year', 'Honoring sprawling standalone villas showcasing harmonious landscape integration, architectural grandeur, and indoor-outdoor synergy.', 12, TRUE)
ON CONFLICT (edition_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    display_order = EXCLUDED.display_order;

-- 6. SCORING CRITERIA FRAMEWORK (INTENTIONALLY OMITTED FROM SEED DATA)
-- Per BRD governance, the recommended 5-criterion framework (Design Excellence 25%,
-- Creativity 20%, Functionality 20%, Sustainability 15%, Overall Impact 20%) is a
-- non-binding recommendation. To prevent unconfirmed weights from being treated as
-- official production configuration, scoring criteria records are omitted from seed data.
-- Configurable criteria and weights will be populated via the Admin Panel once
-- formally ratified by the organizing committee.

-- 7. INITIAL CMS CONTENT BLOCKS (2026 Edition)
INSERT INTO cms_content_blocks (edition_id, block_key, title, content_json, is_published) VALUES
('e2026000-0000-0000-0000-000000002026'::uuid, 'hero_announcement', 'Homepage Hero Announcement', '{"badge": "2026 Edition", "headline": "Kutchmitra Home & Decor Awards 2026", "tagline": "Recognizing excellence across architecture, interior design, residential design, craftsmanship and spatial innovation."}'::jsonb, TRUE),
('e2026000-0000-0000-0000-000000002026'::uuid, 'timeline_status', 'Timeline Schedule Notice', '{"status_notice": "All dates are currently provisional and subject to formal confirmation by the organizing committee.", "default_status": "TBD"}'::jsonb, TRUE),
('e2026000-0000-0000-0000-000000002026'::uuid, 'jury_notice', 'Jury Evaluation Governance Notice', '{"notice": "Jury profiles will be announced by the organizing committee.", "framework": "Independent evaluation conducted with strict criteria scoring and conflict-of-interest safeguards."}'::jsonb, TRUE)
ON CONFLICT (edition_id, block_key) DO UPDATE SET content_json = EXCLUDED.content_json;
