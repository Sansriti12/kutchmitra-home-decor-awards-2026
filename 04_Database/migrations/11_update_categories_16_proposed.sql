-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 11: PROPOSED EXPANSION TO 16 AWARD CATEGORIES (NON-DESTRUCTIVE)
-- File: 04_Database/migrations/11_update_categories_16_proposed.sql
-- Status: PROPOSED REVISION (SUBJECT TO MANAGEMENT APPROVAL)
-- ==============================================================================
-- RATIONALE & CLIENT SPECIFICATION:
-- Based on the client specification "Kutchmitra_Home Decor Awards_Portal Changes.docx"
-- (Section A: Proposed Award Categories – 16 Categories), the 14-category structure
-- is proposed to be expanded by adding two dedicated categories:
--   15. Excellence in Vernacular Architecture
--   16. Excellence in Kutchi Craft & Artisan Integration
--
-- CRITICAL ARCHITECTURAL GUARANTEES:
-- 1. Strictly non-destructive: is_active = FALSE for previously retired categories
--    (CAT-03 Best Apartment Design, CAT-06 Ultra-Luxury Residential, CAT-13 Best Contractor).
-- 2. Internal database category codes ('01', '02', '04', ..., '17') and UUIDs for the
--    first 14 categories remain completely unchanged.
-- 3. Allocates unused database codes '18' and '19' with deterministic UUIDs:
--    - CAT-18: c2026000-0000-0000-0000-000000000018 (Display #15)
--    - CAT-19: c2026000-0000-0000-0000-000000000019 (Display #16)
-- 4. Dynamic questions & upload requirements for the 2 new categories are seeded
--    with idempotent ON CONFLICT clauses.
-- 5. Foreign keys, nominations, evaluations, and audit logs remain intact.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. VERIFY RETIRED CATEGORIES REMAIN INACTIVE (Safety Check)
-- ------------------------------------------------------------------------------

UPDATE categories
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'c2026000-0000-0000-0000-000000000003'::uuid, -- CAT-03 Best Apartment Design
    'c2026000-0000-0000-0000-000000000006'::uuid, -- CAT-06 Ultra-Luxury Residential
    'c2026000-0000-0000-0000-000000000013'::uuid  -- CAT-13 Best Contractor
)
AND edition_id = 'e2026000-0000-0000-0000-000000002026'::uuid;


-- ------------------------------------------------------------------------------
-- 2. INSERT PROPOSED 2 NEW CATEGORIES (Codes 18 and 19)
-- ------------------------------------------------------------------------------

INSERT INTO categories (
    id,
    edition_id,
    code,
    name,
    slug,
    short_description,
    display_order,
    is_active
) VALUES 
(
    'c2026000-0000-0000-0000-000000000018'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '18',
    'Excellence in Vernacular Architecture',
    'excellence-in-vernacular-architecture',
    'Recognising homes and residential projects that thoughtfully reinterpret Kutch''s traditional architecture, including the bhunga, local building forms, courtyards, proportions and traditional spatial planning, while responding to contemporary living needs.',
    15,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000019'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '19',
    'Excellence in Kutchi Craft & Artisan Integration',
    'excellence-in-kutchi-craft-and-artisan-integration',
    'Recognising interior or residential projects that meaningfully integrate Kutchi crafts and regional artisans, including embroidery, Ajrakh, Bandhani, woodwork, pottery, metalwork, leatherwork and other local craft traditions.',
    16,
    TRUE
)
ON CONFLICT (edition_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;


-- ------------------------------------------------------------------------------
-- 3. SEED BASELINE QUESTIONS FOR THE 2 NEW CATEGORIES
-- ------------------------------------------------------------------------------

-- 3.1 Excellence in Vernacular Architecture (c2026000-0000-0000-0000-000000000018)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000018'::uuid,
    'vernacular_elements_interpreted',
    'Traditional Architectural Elements & Spatial Planning',
    'Describe how the project reinterprets traditional Kutchi architectural forms (bhunga, otla, chowk/courtyard, proportions) and spatial planning.',
    'e.g. Circular bhunga geometry reimagined for modern ventilation and thermal efficiency...',
    'textarea',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000018'::uuid,
    'local_materials_techniques',
    'Local Materials, Techniques & Construction Methods',
    'Detail the use of local stone, earth/mud, lime, thatch, wood or indigenous construction techniques employed.',
    'e.g. Yellow Kutch limestone, rammed earth walls, stabilized mud plaster...',
    'textarea',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000018'::uuid,
    'contemporary_comfort_integration',
    'Contemporary Functionality & Living Comfort',
    'How does the design seamlessly deliver modern living comforts, seismic resilience, and building services without superficial imitation?',
    'e.g. Integrated modern sanitary systems, concealed electrical conduits, passive cooling...',
    'textarea',
    TRUE,
    3,
    TRUE
)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;


-- 3.2 Excellence in Kutchi Craft & Artisan Integration (c2026000-0000-0000-0000-000000000019)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000019'::uuid,
    'craft_traditions_integrated',
    'Kutchi Craft Traditions & Regional Art Forms Integrated',
    'List and detail the regional crafts incorporated (e.g., Rogan, Ajrakh, Bandhani, Lippan Kaam, Bell metal, Wood carving, Terracotta pottery, Leatherwork).',
    'e.g. Hand-carved teak jharokhas, bespoke mud-mirror Lippan relief work, Ajrakh printed textiles...',
    'textarea',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000019'::uuid,
    'artisan_involvement_credits',
    'Artisan Involvement, Direct Engagement & Attribution',
    'Provide details of the local artisans or craft communities involved, their direct engagement, and how credit is acknowledged.',
    'e.g. Collaborated with Master Artisan Ismail Khatri for bespoke textiles, 4 local craft families engaged...',
    'textarea',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000019'::uuid,
    'contemporary_craft_interpretation',
    'Contemporary Interpretation & Design Harmony',
    'Explain how the crafts were thoughtfully woven into modern spatial aesthetics while respecting their authentic cultural identity.',
    'e.g. Integrated craft motifs as functional acoustic panels and lighting screens...',
    'textarea',
    TRUE,
    3,
    TRUE
)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;


-- ------------------------------------------------------------------------------
-- 4. SEED UPLOAD REQUIREMENTS FOR THE 2 NEW CATEGORIES
-- ------------------------------------------------------------------------------

-- Upload Requirements for Excellence in Vernacular Architecture
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000018'::uuid, 'cover_image', 'Primary Vernacular Architecture Photograph', 'Primary high-resolution photograph showing the building within its landscape and architectural context.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'project_photo', 'Vernacular Architecture Photography', 'Exterior angles, courtyard views, traditional details, roof forms, and interior living spaces (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'floor_plan', 'Architectural Site Plan, Floor Plans & Sections', 'Architectural drawings showing spatial planning, courtyard orientation, ventilation paths, and elevations (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'portfolio_pdf', 'Vernacular Design & Material Dossier (PDF)', 'Detailed narrative outlining traditional construction methods, material sourcing, thermal performance, and contemporary adaptations (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
ON CONFLICT (category_id, upload_type) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_required = EXCLUDED.is_required,
    min_count = EXCLUDED.min_count,
    max_count = EXCLUDED.max_count,
    max_file_size_mb = EXCLUDED.max_file_size_mb,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Upload Requirements for Excellence in Kutchi Craft & Artisan Integration
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000019'::uuid, 'cover_image', 'Primary Craft & Space Hero Photograph', 'Definitive photograph showcasing the integration of Kutchi craftsmanship within the architectural or interior environment.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'project_photo', 'Craft Detail & Spatial Context Photography', 'Close-ups of craft applications, textures, artisan process photos, and wide-angle contextual interior shots (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'floor_plan', 'Interior Layout / Craft Placement Drawings', 'Floor plan or interior elevation showing the placement, scale, and integration of craft elements (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'portfolio_pdf', 'Artisan Collaboration & Craft Dossier (PDF)', 'Comprehensive documentation of artisan credits, collaboration process, material provenance, and design concepts (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
ON CONFLICT (category_id, upload_type) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_required = EXCLUDED.is_required,
    min_count = EXCLUDED.min_count,
    max_count = EXCLUDED.max_count,
    max_file_size_mb = EXCLUDED.max_file_size_mb,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;


-- ------------------------------------------------------------------------------
-- 5. AUDIT LOG RECORD FOR PROPOSED 16-CATEGORY EXPANSION
-- ------------------------------------------------------------------------------

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, created_at)
VALUES 
(
    NULL,
    'categories_expansion_proposed_16',
    'edition',
    'e2026000-0000-0000-0000-000000002026',
    '{"active_count": 14, "categories": ["01","02","04","05","07","08","09","10","11","12","14","15","16","17"]}'::jsonb,
    '{"active_count": 16, "proposed_additions": ["18", "19"], "status": "proposed_pending_management_approval", "specification": "Kutchmitra_Home Decor Awards_Portal Changes.docx Section A"}'::jsonb,
    CURRENT_TIMESTAMP
);

COMMIT;
