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

-- 5. THE 14 APPROVED AWARD CATEGORIES (2026 Edition)
-- Note: Categories 03, 06, and 13 are permanently retired (is_active = FALSE).
INSERT INTO categories (id, edition_id, code, name, slug, short_description, display_order, is_active) VALUES
-- 10 Retained Active Categories
('c2026000-0000-0000-0000-000000000001'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '01', 'Architect of the Year', 'architect-of-the-year', 'Recognising licensed architects or architectural firms with a strong portfolio of impactful residential or commercial projects.', 1, TRUE),
('c2026000-0000-0000-0000-000000000002'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '02', 'Best Luxury Residence', 'best-luxury-residence', 'Celebrating high-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.', 2, TRUE),
('c2026000-0000-0000-0000-000000000004'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '04', 'Best Renovation Project', 'best-renovation-project', 'Recognising projects that showcase a substantial and creative transformation of an existing space.', 3, TRUE),
('c2026000-0000-0000-0000-000000000005'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '05', 'Best Sustainable Home', 'best-sustainable-home', 'Recognising residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.', 4, TRUE),
('c2026000-0000-0000-0000-000000000007'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '07', 'Interior Designer of the Year', 'interior-designer-of-the-year', 'Recognising interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.', 5, TRUE),
('c2026000-0000-0000-0000-000000000008'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '08', 'Emerging Designer', 'emerging-designer', 'Recognising young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.', 6, TRUE),
('c2026000-0000-0000-0000-000000000009'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '09', 'Best Compact Home', 'best-compact-home', 'Recognising residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.', 7, TRUE),
('c2026000-0000-0000-0000-000000000010'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '10', 'Best Smart Home', 'best-smart-home', 'Recognising residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.', 8, TRUE),
('c2026000-0000-0000-0000-000000000011'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '11', 'Best Themed Project of the Year (Concept & Design)', 'best-themed-project-of-the-year', 'Recognising projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.', 9, TRUE),
('c2026000-0000-0000-0000-000000000012'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '12', 'Luxury Villa Project of the Year', 'luxury-villa-project-of-the-year', 'Recognising standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.', 10, TRUE),

-- 4 New Active Categories
('c2026000-0000-0000-0000-000000000014'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '14', 'Best Developer of the Year', 'best-developer-of-the-year', 'Recognising real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and the development of high-quality residential or commercial properties.', 11, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '15', 'Best Organised Township of the Year', 'best-organised-township-of-the-year', 'Recognising well-planned township developments that integrate residential spaces, infrastructure, amenities, open spaces and community facilities to create a well-organised, sustainable and comfortable living environment.', 12, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '16', 'Best Office Design of the Year', 'best-office-design-of-the-year', 'Recognising office spaces that demonstrate excellence in workplace planning, functionality, aesthetics, ergonomics and the effective use of space to support productivity, employee well-being and a positive work environment.', 13, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '17', 'Best Commercial Building of the Year', 'best-commercial-building-of-the-year', 'Recognising commercial buildings that demonstrate excellence in architectural design, functionality, construction quality, sustainability and the effective integration of infrastructure and user-oriented facilities.', 14, TRUE),

-- 3 Retired Categories (Preserved with is_active = FALSE)
('c2026000-0000-0000-0000-000000000003'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '03', 'Best Apartment Design', 'best-apartment-design', 'Celebrating intelligent spatial layouts, bespoke interior interventions, and elevated urban living environments.', 99, FALSE),
('c2026000-0000-0000-0000-000000000006'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '06', 'Ultra-Luxury Residential Project of the Year', 'ultra-luxury-residential-project-of-the-year', 'Acknowledging landmark residential developments that embody peerless luxury, scale, and detailing.', 99, FALSE),
('c2026000-0000-0000-0000-000000000013'::uuid, 'e2026000-0000-0000-0000-000000002026'::uuid, '13', 'Best Contractor of the Year', 'best-contractor-of-the-year', 'Recognising contractors who demonstrate excellence in executing residential, commercial or interior projects on a contract basis, with a strong focus on quality, workmanship, timely execution and effective project delivery.', 99, FALSE)
ON CONFLICT (edition_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

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
