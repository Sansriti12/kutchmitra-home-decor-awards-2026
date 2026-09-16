-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- PHASE 5: CLIENT CONFIGURATION INGESTION TEMPLATE
-- File: 04_Database/seed_category_configuration_template.sql
-- ==============================================================================
--
-- PURPOSE:
-- This script provides an idempotent, production-ready SQL template to ingest
-- official category questions, option sets, and upload requirements once ratified
-- and supplied by the Kutchmitra Home & Decor Awards 2026 organizing committee.
--
-- STRICT GOVERNANCE RULES:
-- 1. ZERO FABRICATION: Contains NO placeholder, fake, or unapproved client data.
-- 2. IDEMPOTENT: Uses ON CONFLICT clauses; safe to execute repeatedly without duplicates.
-- 3. VALIDATED SCHEMAS: Strictly aligns with PostgreSQL schema constraints in schema.sql:
--    - category_questions (field_type: text, textarea, number, date, select, radio, checkbox, url)
--    - question_options (value unique per question_id)
--    - category_upload_requirements (upload_type: cover_image, project_photo, interior_photo,
--      exterior_photo, floor_plan, rendering_3d, portfolio_pdf, supporting_doc)
--
-- REFERENCE CATEGORY IDENTIFIERS (2026 Inaugural Edition):
-- Edition ID: 'e2026000-0000-0000-0000-000000002026'::uuid
-- Category #01: 'c2026000-0000-0000-0000-000000000001'::uuid (Architect of the Year)
-- Category #02: 'c2026000-0000-0000-0000-000000000002'::uuid (Best Luxury Residence)
-- Category #03: 'c2026000-0000-0000-0000-000000000003'::uuid (Best Apartment Design)
-- Category #04: 'c2026000-0000-0000-0000-000000000004'::uuid (Best Renovation Project)
-- Category #05: 'c2026000-0000-0000-0000-000000000005'::uuid (Best Sustainable Home)
-- Category #06: 'c2026000-0000-0000-0000-000000000006'::uuid (Ultra-Luxury Residential Project of the Year)
-- Category #07: 'c2026000-0000-0000-0000-000000000007'::uuid (Interior Designer of the Year)
-- Category #08: 'c2026000-0000-0000-0000-000000000008'::uuid (Emerging Designer)
-- Category #09: 'c2026000-0000-0000-0000-000000000009'::uuid (Best Compact Home)
-- Category #10: 'c2026000-0000-0000-0000-000000000010'::uuid (Best Smart Home)
-- Category #11: 'c2026000-0000-0000-0000-000000000011'::uuid (Best Themed Project of the Year)
-- Category #12: 'c2026000-0000-0000-0000-000000000012'::uuid (Luxury Villa Project of the Year)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- PART A: CONFIGURATION ARCHITECTURE & SYNTAX GUIDE
-- ==============================================================================
--
-- 1. category_questions syntax:
-- ------------------------------------------------------------------------------
-- INSERT INTO category_questions (
--     category_id,
--     question_key,
--     question_text,
--     help_text,
--     placeholder,
--     field_type,
--     is_required,
--     validation_rules,
--     display_order,
--     is_active
-- ) VALUES (
--     '<CATEGORY_UUID>'::uuid,
--     '<machine_readable_key>', -- Unique per category (e.g., 'design_concept_summary')
--     '<Official Question Label / Title>',
--     '<Optional help text / instructions for entrant>',
--     '<Optional input placeholder>',
--     '<field_type>', -- One of: text, textarea, number, date, select, radio, checkbox, url
--     TRUE,           -- TRUE if mandatory, FALSE if optional
--     '{"min": 10, "max": 1000}'::jsonb, -- Optional JSONB validation constraints
--     1,              -- Display sequence order
--     TRUE
-- )
-- ON CONFLICT (category_id, question_key) DO UPDATE SET
--     question_text = EXCLUDED.question_text,
--     help_text = EXCLUDED.help_text,
--     placeholder = EXCLUDED.placeholder,
--     field_type = EXCLUDED.field_type,
--     is_required = EXCLUDED.is_required,
--     validation_rules = EXCLUDED.validation_rules,
--     display_order = EXCLUDED.display_order,
--     is_active = EXCLUDED.is_active,
--     updated_at = CURRENT_TIMESTAMP;
--
-- 2. question_options syntax (for select, radio, and checkbox questions):
-- ------------------------------------------------------------------------------
-- INSERT INTO question_options (
--     question_id,
--     label,
--     value,
--     display_order,
--     is_active
-- ) VALUES (
--     (SELECT id FROM category_questions WHERE category_id = '<CATEGORY_UUID>'::uuid AND question_key = '<machine_readable_key>'),
--     '<Human Readable Label>',
--     '<machine_value>',
--     1,
--     TRUE
-- )
-- ON CONFLICT (question_id, value) DO UPDATE SET
--     label = EXCLUDED.label,
--     display_order = EXCLUDED.display_order,
--     is_active = EXCLUDED.is_active;
--
-- 3. category_upload_requirements syntax:
-- ------------------------------------------------------------------------------
-- INSERT INTO category_upload_requirements (
--     category_id,
--     upload_type,
--     title,
--     description,
--     is_required,
--     min_count,
--     max_count,
--     max_file_size_mb,
--     allowed_mime_types,
--     display_order,
--     is_active
-- ) VALUES (
--     '<CATEGORY_UUID>'::uuid,
--     '<upload_type>', -- cover_image, project_photo, interior_photo, exterior_photo, floor_plan, rendering_3d, portfolio_pdf, supporting_doc
--     '<Requirement Title>',
--     '<Detailed instructions regarding resolution, drawing scale, aspect ratio>',
--     TRUE,            -- Mandatory or optional
--     1,               -- Minimum uploads required
--     5,               -- Maximum uploads permitted
--     15,              -- Max file size in MB (ceiling is 15MB)
--     ARRAY['image/jpeg', 'image/png', 'image/webp'], -- or ARRAY['application/pdf']
--     1,
--     TRUE
-- )
-- ON CONFLICT (category_id, upload_type) DO UPDATE SET
--     title = EXCLUDED.title,
--     description = EXCLUDED.description,
--     is_required = EXCLUDED.is_required,
--     min_count = EXCLUDED.min_count,
--     max_count = EXCLUDED.max_count,
--     max_file_size_mb = EXCLUDED.max_file_size_mb,
--     allowed_mime_types = EXCLUDED.allowed_mime_types,
--     display_order = EXCLUDED.display_order,
--     is_active = EXCLUDED.is_active,
--     updated_at = CURRENT_TIMESTAMP;

-- ==============================================================================
-- PART B: PER-CATEGORY INGESTION PLACEHOLDERS (ALL 12 CATEGORIES)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CATEGORY #01: Architect of the Year
-- ID: c2026000-0000-0000-0000-000000000001
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #01
-- CLIENT INPUT REQUIRED: Official options for select/radio/checkbox questions
-- CLIENT INPUT REQUIRED: Official drawing, photo, and portfolio upload requirements
-- Example block (uncomment upon committee ratification):
/*
INSERT INTO category_questions (category_id, question_key, question_text, help_text, field_type, is_required, display_order)
VALUES ('c2026000-0000-0000-0000-000000000001'::uuid, 'c01_design_concept', '<OFFICIAL_QUESTION_TEXT>', '<OFFICIAL_HELP_TEXT>', 'textarea', TRUE, 1)
ON CONFLICT (category_id, question_key) DO UPDATE SET question_text = EXCLUDED.question_text, updated_at = CURRENT_TIMESTAMP;

INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order)
VALUES ('c2026000-0000-0000-0000-000000000001'::uuid, 'floor_plan', '<OFFICIAL_REQUIREMENT_TITLE>', '<OFFICIAL_SPECS>', TRUE, 1, 5, 15, ARRAY['application/pdf', 'image/jpeg', 'image/png'], 1)
ON CONFLICT (category_id, upload_type) DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP;
*/

-- ------------------------------------------------------------------------------
-- CATEGORY #02: Best Luxury Residence
-- ID: c2026000-0000-0000-0000-000000000002
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #02
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #02

-- ------------------------------------------------------------------------------
-- CATEGORY #03: Best Apartment Design
-- ID: c2026000-0000-0000-0000-000000000003
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #03
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #03

-- ------------------------------------------------------------------------------
-- CATEGORY #04: Best Renovation Project
-- ID: c2026000-0000-0000-0000-000000000004
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #04 (e.g. before/after narrative)
-- CLIENT INPUT REQUIRED: Official upload quotas for Category #04 (e.g. before/after photos)

-- ------------------------------------------------------------------------------
-- CATEGORY #05: Best Sustainable Home
-- ID: c2026000-0000-0000-0000-000000000005
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #05 (e.g. energy, water, materials)
-- CLIENT INPUT REQUIRED: Official upload quotas and green certification docs for Category #05

-- ------------------------------------------------------------------------------
-- CATEGORY #06: Ultra-Luxury Residential Project of the Year
-- ID: c2026000-0000-0000-0000-000000000006
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #06
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #06

-- ------------------------------------------------------------------------------
-- CATEGORY #07: Interior Designer of the Year
-- ID: c2026000-0000-0000-0000-000000000007
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #07 (materiality, lighting, bespoke fixtures)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #07

-- ------------------------------------------------------------------------------
-- CATEGORY #08: Emerging Designer
-- ID: c2026000-0000-0000-0000-000000000008
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #08 (career milestones, design philosophy)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #08

-- ------------------------------------------------------------------------------
-- CATEGORY #09: Best Compact Home
-- ID: c2026000-0000-0000-0000-000000000009
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #09 (spatial optimization, multifunctionality)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #09

-- ------------------------------------------------------------------------------
-- CATEGORY #10: Best Smart Home
-- ID: c2026000-0000-0000-0000-000000000010
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #10 (home automation systems, IoT integration)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #10

-- ------------------------------------------------------------------------------
-- CATEGORY #11: Best Themed Project of the Year
-- ID: c2026000-0000-0000-0000-000000000011
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #11 (stylistic/cultural narrative)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #11

-- ------------------------------------------------------------------------------
-- CATEGORY #12: Luxury Villa Project of the Year
-- ID: c2026000-0000-0000-0000-000000000012
-- ------------------------------------------------------------------------------
-- CLIENT INPUT REQUIRED: Official questionnaire for Category #12 (landscape integration, villa footprint)
-- CLIENT INPUT REQUIRED: Official upload quotas and specifications for Category #12

-- ==============================================================================
-- PART C: CLIENT TIMELINE & ELIGIBILITY CONFIGURATION (PENDING)
-- ==============================================================================
--
-- UPDATE award_editions
-- SET
--     nomination_start_at    = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     nomination_end_at      = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     verification_start_at  = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     verification_end_at    = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     judging_start_at       = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     judging_end_at         = '<CLIENT_CONFIRMED_TIMESTAMP>',
--     ceremony_date          = '<CLIENT_CONFIRMED_DATE>',
--     updated_at             = CURRENT_TIMESTAMP
-- WHERE id = 'e2026000-0000-0000-0000-000000002026'::uuid;

-- ==============================================================================
-- PART D: SCORING CRITERIA RATIFICATION (PENDING)
-- ==============================================================================
--
-- INSERT INTO scoring_criteria (
--     edition_id,
--     category_id,
--     code,
--     title,
--     description,
--     weight_percentage,
--     max_score,
--     display_order,
--     is_active
-- ) VALUES (
--     'e2026000-0000-0000-0000-000000002026'::uuid,
--     NULL, -- NULL denotes edition-wide default rubric
--     '<code_e_g_design_excellence>',
--     '<Official Criterion Title>',
--     '<Detailed Evaluation Guidance for Jurors>',
--     25.00, -- Weight % (Total across active criteria must sum to 100.00)
--     10.00,
--     1,
--     TRUE
-- )
-- ON CONFLICT DO NOTHING;

COMMIT;
