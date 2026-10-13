-- ==============================================================================
-- MIGRATION 08: REMOVE CATEGORY 3 — BEST APARTMENT DESIGN (NON-DESTRUCTIVE)
-- Kutchmitra Home & Decor Awards 2026
-- ==============================================================================
-- Rationale:
-- The organizing committee has officially retired Category 03 ("Best Apartment Design")
-- from the active 2026 award program. To preserve data integrity and foreign key
-- relationships with historical/test applications, nominations, and jury evaluations,
-- this migration safely deactivates Category 3 and its associated configuration
-- without destructive row deletion.
-- ==============================================================================

-- 1. Deactivate Category 03 for the 2026 Edition
UPDATE categories
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c2026000-0000-0000-0000-000000000003'
  AND edition_id = 'e2026000-0000-0000-0000-000000002026';

-- 2. Deactivate Category 03 Dynamic Questions
UPDATE category_questions
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000003';

-- 3. Deactivate Category 03 Upload Requirements
UPDATE category_upload_requirements
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000003';

-- 4. Deactivate any category-scoped scoring criteria for Category 03
UPDATE scoring_criteria
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000003';

-- 5. Audit Log Record
INSERT INTO audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    created_at
) VALUES (
    NULL,
    'category_deactivated',
    'category',
    'c2026000-0000-0000-0000-000000000003',
    '{"code": "03", "name": "Best Apartment Design", "is_active": true}'::jsonb,
    '{"code": "03", "name": "Best Apartment Design", "is_active": false, "reason": "Committee retirement of Category 03 for 2026 edition"}'::jsonb,
    CURRENT_TIMESTAMP
);
