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
