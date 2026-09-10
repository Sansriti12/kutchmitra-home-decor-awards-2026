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
    id UUID PRIMARY KEY,
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
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    edition_id UUID NULL REFERENCES award_editions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id, COALESCE(edition_id, '00000000-0000-0000-0000-000000000000'::uuid))
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
        REFERENCES categories(id, edition_id) ON DELETE CASCADE,
    CONSTRAINT uq_criteria_scope UNIQUE(edition_id, COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid), code)
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
