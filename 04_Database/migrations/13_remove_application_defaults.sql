-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 13: REMOVE APPLICATION COLUMN DEFAULTS & SAFEGUARD DRAFT NULLABILITY
-- File: 04_Database/migrations/13_remove_application_defaults.sql
-- Status: PREPARED CORRECTIVE MIGRATION (SUBJECT TO MANAGEMENT APPROVAL - DO NOT AUTO-APPLY)
-- ==============================================================================
-- RATIONALE:
-- If Migration 12 was initially executed when applicant_type, applicant_district,
-- and project_district contained DEFAULT clauses ('individual_architect' and 'Kutch'),
-- the remote PostgreSQL table metadata retains these column defaults.
--
-- This corrective migration explicitly drops all defaults on those three columns so
-- that drafts are created with explicit NULL values until the applicant makes a selection.
-- It also idempotently guarantees that chk_applications_applicant_type permits NULL.
-- ==============================================================================

BEGIN;

-- 1. Remove column defaults if present
ALTER TABLE applications 
    ALTER COLUMN applicant_type DROP DEFAULT,
    ALTER COLUMN applicant_district DROP DEFAULT,
    ALTER COLUMN project_district DROP DEFAULT;

-- 2. Ensure applicant_type check constraint permits NULL for unsubmitted drafts
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_applications_applicant_type'
    ) THEN
        ALTER TABLE applications DROP CONSTRAINT chk_applications_applicant_type;
    END IF;

    ALTER TABLE applications 
        ADD CONSTRAINT chk_applications_applicant_type 
        CHECK (applicant_type IS NULL OR applicant_type IN ('individual_architect', 'architectural_firm'));
END $$;

COMMIT;
