-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 12: PHASE 3 – ELIGIBILITY, UPLOADS, DECLARATION & CERTIFICATES
-- File: 04_Database/migrations/12_phase_3_eligibility_uploads_declaration_certificates.sql
-- Status: PREPARED MIGRATION (SUBJECT TO MANAGEMENT APPROVAL - DO NOT AUTO-APPLY)
-- ==============================================================================
-- RATIONALE & CLIENT REQUIREMENTS:
-- Based on the authoritative client document "Kutchmitra_Home Decor Awards_Portal Changes.docx":
-- 1. Applicant Eligibility: Nominating applicant must be an architect based in Kutch
--    or an architectural firm based in Kutch.
-- 2. Project Location: Submitted project must be located within Kutch district.
-- 3. Project Information: Adds project brief (max 500 chars), site address, district.
-- 4. Upload Requirements:
--    - Project Plan (A3 Size) field instructions.
--    - Image validation: min 500x500px, max 10MB, JPG/PNG, 1000x1000 recommended.
--    - Complete removal of Before Photo from renovation category and all requirements.
-- 5. Mandatory Self-Declaration:
--    "I hereby declare that, to the best of my knowledge, all information provided about
--    myself, my firm and the project in this nomination form is true and accurate."
-- 6. Participant Certificates:
--    Certificate of Appreciation issued to every participating entrant.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. EXTEND APPLICATIONS TABLE WITH ELIGIBILITY, BRIEF & DECLARATION FIELDS
-- ------------------------------------------------------------------------------

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS applicant_type TEXT DEFAULT 'individual_architect',
ADD COLUMN IF NOT EXISTS applicant_district TEXT DEFAULT 'Kutch',
ADD COLUMN IF NOT EXISTS applicant_office_address TEXT,
ADD COLUMN IF NOT EXISTS coa_registration_number TEXT,
ADD COLUMN IF NOT EXISTS project_district TEXT DEFAULT 'Kutch',
ADD COLUMN IF NOT EXISTS project_address TEXT,
ADD COLUMN IF NOT EXISTS project_brief TEXT,
ADD COLUMN IF NOT EXISTS declaration_text TEXT;

-- Add check constraint for applicant_type if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_applications_applicant_type'
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT chk_applications_applicant_type
        CHECK (applicant_type IN ('individual_architect', 'architectural_firm'));
    END IF;
END $$;

-- Add check constraint for project_brief character limit (max 500 chars)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_applications_project_brief_len'
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT chk_applications_project_brief_len
        CHECK (project_brief IS NULL OR length(project_brief) <= 500);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. REMOVE BEFORE PHOTO REQUIREMENT FROM RENOVATION CATEGORY
-- ------------------------------------------------------------------------------
-- Replaces 'Before & After Completed Photography' with 'Completed Renovation Photography'
-- Preserves all historical records while removing the Before Photo requirement.

UPDATE category_upload_requirements
SET 
    title = 'Completed Renovation Photography',
    description = 'High-resolution photographs documenting the completed renovation transformation and spatial quality (Minimum 3 photographs).',
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid
  AND upload_type = 'project_photo';

-- ------------------------------------------------------------------------------
-- 3. UPDATE FLOOR PLAN UPLOAD REQUIREMENT TO PROJECT PLAN (A3 SIZE)
-- ------------------------------------------------------------------------------

UPDATE category_upload_requirements
SET 
    title = 'Project Plan (A3 Size)',
    description = 'Architectural project plan submitted in A3 format (PDF, PNG, or JPG format).',
    updated_at = CURRENT_TIMESTAMP
WHERE upload_type = 'floor_plan';

-- ------------------------------------------------------------------------------
-- 4. CREATE PARTICIPANT CERTIFICATES TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS participant_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    participant_name TEXT NOT NULL,
    participant_type TEXT NOT NULL DEFAULT 'individual_architect',
    project_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    award_edition TEXT NOT NULL DEFAULT '2026',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'issued' | 'revoked'
    issued_at TIMESTAMPTZ,
    issued_by UUID REFERENCES users(id),
    pdf_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_participant_cert_app UNIQUE (application_id)
);

-- Index for fast lookup by status and application
CREATE INDEX IF NOT EXISTS idx_participant_certificates_app ON participant_certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_participant_certificates_status ON participant_certificates(status);

-- Enable RLS
ALTER TABLE participant_certificates ENABLE ROW LEVEL SECURITY;

-- Applicants can view certificates for their own applications
CREATE POLICY "Applicants view own certificates"
ON participant_certificates FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = participant_certificates.application_id
          AND applications.applicant_id = auth.uid()
    )
);

-- Admins full access to certificates
CREATE POLICY "Admins manage all certificates"
ON participant_certificates FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
          AND r.name IN ('super_admin', 'committee_admin')
    )
);

COMMIT;
