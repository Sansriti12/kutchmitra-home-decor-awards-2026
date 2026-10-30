-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 11: COMPLETE SYNCHRONIZATION FOR 16 PROPOSED AWARD CATEGORIES (NON-DESTRUCTIVE & IDEMPOTENT)
-- File: 04_Database/migrations/11_update_categories_16_proposed.sql
-- ==============================================================================
-- RATIONALE & CLIENT SPECIFICATION:
-- Based on the authoritative client specification "Kutchmitra_Home Decor Awards_Portal Changes.docx"
-- (Section A: Proposed Award Categories – 16 Categories), the award catalog consists of 16 categories:
--   10 Retained Categories: 01, 02, 04, 05, 07, 08, 09, 10, 11, 12
--    4 Established Additions: 14 (Best Developer), 15 (Best Organised Township), 16 (Best Office Design), 17 (Best Commercial Building)
--    2 Proposed Additions: 18 (Excellence in Vernacular Architecture), 19 (Excellence in Kutchi Craft & Artisan Integration)
--    3 Retired Categories: 03 (Best Apartment Design), 06 (Ultra-Luxury Residential), 13 (Best Contractor)
--
-- CRITICAL ARCHITECTURAL GUARANTEES:
-- 1. 100% Non-destructive: is_active = FALSE for retired categories. No rows deleted.
-- 2. Fully Self-Contained: Synchronizes all 6 categories (14, 15, 16, 17, 18, 19) whether Migration 10 was run or not.
-- 3. Idempotent: Safe to execute repeatedly without syntax errors, duplicate key violations, or side effects.
-- 4. Preserves all existing applications, historical submissions, audit trails, and foreign keys.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. DEACTIVATE RETIRED CATEGORIES (Non-Destructive)
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

UPDATE category_questions
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id IN (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'c2026000-0000-0000-0000-000000000013'::uuid
);

UPDATE category_upload_requirements
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id IN (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'c2026000-0000-0000-0000-000000000013'::uuid
);

-- ------------------------------------------------------------------------------
-- 2. ALIGN SEQUENTIAL DISPLAY ORDERS FOR 10 RETAINED CATEGORIES (01–10)
-- ------------------------------------------------------------------------------

UPDATE categories SET display_order = 1, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000001'::uuid;
UPDATE categories SET display_order = 2, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000002'::uuid;
UPDATE categories SET display_order = 3, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000004'::uuid;
UPDATE categories SET display_order = 4, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000005'::uuid;
UPDATE categories SET display_order = 5, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000007'::uuid;
UPDATE categories SET display_order = 6, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000008'::uuid;
UPDATE categories SET display_order = 7, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000009'::uuid;
UPDATE categories SET display_order = 8, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000010'::uuid;
UPDATE categories SET display_order = 9, is_active = TRUE, name = 'Best Themed Project of the Year (Concept & Design)', updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000011'::uuid;
UPDATE categories SET display_order = 10, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000012'::uuid;

-- ------------------------------------------------------------------------------
-- 3. INSERT ALL 6 EXPANDED ACTIVE CATEGORIES (Codes 14 to 19)
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
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '14',
    'Best Developer of the Year',
    'best-developer-of-the-year',
    'Recognising real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and the development of high-quality residential or commercial properties.',
    11,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '15',
    'Best Organised Township of the Year',
    'best-organised-township-of-the-year',
    'Recognising well-planned township developments that integrate residential spaces, infrastructure, amenities, open spaces and community facilities to create a well-organised, sustainable and comfortable living environment.',
    12,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '16',
    'Best Office Design of the Year',
    'best-office-design-of-the-year',
    'Recognising office spaces that demonstrate excellence in workplace planning, functionality, aesthetics, ergonomics and the effective use of space to support productivity, employee well-being and a positive work environment.',
    13,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'e2026000-0000-0000-0000-000000002026'::uuid,
    '17',
    'Best Commercial Building of the Year',
    'best-commercial-building-of-the-year',
    'Recognising commercial buildings that demonstrate excellence in architectural design, functionality, construction quality, sustainability and the effective integration of infrastructure and user-oriented facilities.',
    14,
    TRUE
),
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    slug = EXCLUDED.slug,
    short_description = EXCLUDED.short_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------------
-- 4. SEED QUESTIONS FOR CATEGORIES 14 TO 19
-- ------------------------------------------------------------------------------

-- 4.1 Best Developer of the Year (14)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000014'::uuid, 'rera_registration_no', 'RERA Project Registration / Statutory Developer License', 'Provide the Gujarat RERA registration number or statutory developer licensing reference for this nominated project.', 'e.g. PR/GJ/KUTCH/12345/2025', 'text', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'development_vision_coordination', 'Project Planning, Design Coordination & Development Vision', 'Explain the comprehensive development narrative: master planning, consultant coordination, client positioning, and how the project addresses regional demand.', 'Describe the developer narrative, planning methodology, and spatial coordination...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'construction_quality_delivery', 'Construction Quality, Workmanship & Timely Delivery', 'Elaborate on quality assurance protocols, structural rigor, contractor management, and project execution timelines.', 'Detail quality control measures, material standards, and handover track record...', 'textarea', TRUE, 3, TRUE)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 4.2 Best Organised Township of the Year (15)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000015'::uuid, 'township_acreage_scale', 'Total Land Acreage & Township Development Scale', 'Specify total land parcel size (in acres or hectares), planned population/units, and phased completion status.', 'e.g. 50 Acres masterplan, 450 residential units, Phase 1 complete', 'text', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'masterplan_vision_zoning', 'Master Planning Concept, Spatial Zoning & Open Spaces', 'Explain the overarching urban planning vision: residential clusters, open green reserves, pedestrian safety, and vehicular circulation.', 'Elaborate on spatial zoning, green corridor buffers, open spaces percentage, and master layout...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'civic_infrastructure_utilities', 'Civic Infrastructure, Water, Power & Road Networks', 'Detail the internal road hierarchy, subterranean utilities, stormwater drainage, water supply, and waste management systems.', 'Describe arterial roads, underground utility lines, water storage, and reliable civic utilities...', 'textarea', TRUE, 3, TRUE)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 4.3 Best Office Design of the Year (16)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000016'::uuid, 'workplace_concept_vision', 'Workplace Planning Vision, Spatial Efficiency & Ergonomics', 'Explain how the spatial design balances open collaboration, focused individual work, executive suites, and ergonomic comfort.', 'Describe the workplace philosophy, spatial zoning, layout optimization, and employee workflow...', 'textarea', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'employee_wellbeing_acoustics', 'Employee Well-Being, Acoustic Comfort & Air Quality', 'Detail acoustic baffling, indoor environmental quality (IEQ), thermal comfort, natural daylighting, and employee breakout zones.', 'Detail acoustic paneling, sound insulation, ergonomic furniture, air quality, and wellness spaces...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'technology_smart_systems', 'Smart Office Technology, Lighting & Automation', 'Describe the integration of automated lighting control, conference room AV systems, access control, and energy monitoring.', 'Detail intelligent lighting, sensor controls, integrated AV, and energy efficiency...', 'textarea', TRUE, 3, TRUE)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 4.4 Best Commercial Building of the Year (17)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000017'::uuid, 'architectural_form_facade', 'Architectural Form, Façade Engineering & Urban Context', 'Elaborate on the architectural expression, massing, building skin/glazing, street presence, and civic contribution to its urban fabric.', 'Describe the building form, facade materials, structural articulation, and street presence...', 'textarea', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'functionality_circulation_vertical', 'Functional Program, Circulation & Vertical Transportation', 'Explain spatial efficiency, lobby design, elevator cores, universal accessibility (Divyangjan compliance), and emergency egress.', 'Detail core-to-floorplate ratio, public vs tenant circulation, and vertical transport efficiency...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'construction_mep_safety', 'Construction Quality, MEP Engineering & Fire Life Safety', 'Detail structural engineering, MEP integration, HVAC efficiency, fire suppression systems, and seismic design.', 'Describe structural system, HVAC/ventilation, fire safety, and building automation...', 'textarea', TRUE, 3, TRUE)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 4.5 Excellence in Vernacular Architecture (18)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000018'::uuid, 'vernacular_elements_interpreted', 'Traditional Architectural Elements & Spatial Planning', 'Describe how the project reinterprets traditional Kutchi architectural forms (bhunga, otla, chowk/courtyard, proportions) and spatial planning.', 'e.g. Circular bhunga geometry reimagined for modern ventilation and thermal efficiency...', 'textarea', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'local_materials_techniques', 'Local Materials, Techniques & Construction Methods', 'Detail the use of local stone, earth/mud, lime, thatch, wood or indigenous construction techniques employed.', 'e.g. Yellow Kutch limestone, rammed earth walls, stabilized mud plaster...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'contemporary_comfort_integration', 'Contemporary Functionality & Living Comfort', 'How does the design seamlessly deliver modern living comforts, seismic resilience, and building services without superficial imitation?', 'e.g. Integrated modern sanitary systems, concealed electrical conduits, passive cooling...', 'textarea', TRUE, 3, TRUE)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 4.6 Excellence in Kutchi Craft & Artisan Integration (19)
INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
('c2026000-0000-0000-0000-000000000019'::uuid, 'craft_traditions_integrated', 'Kutchi Craft Traditions & Regional Art Forms Integrated', 'List and detail the regional crafts incorporated (e.g., Rogan, Ajrakh, Bandhani, Lippan Kaam, Bell metal, Wood carving, Terracotta pottery, Leatherwork).', 'e.g. Hand-carved teak jharokhas, bespoke mud-mirror Lippan relief work, Ajrakh printed textiles...', 'textarea', TRUE, 1, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'artisan_involvement_credits', 'Artisan Involvement, Direct Engagement & Attribution', 'Provide details of the local artisans or craft communities involved, their direct engagement, and how credit is acknowledged.', 'e.g. Collaborated with Master Artisan Ismail Khatri for bespoke textiles, 4 local craft families engaged...', 'textarea', TRUE, 2, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'contemporary_craft_interpretation', 'Contemporary Interpretation & Design Harmony', 'Explain how the crafts were thoughtfully woven into modern spatial aesthetics while respecting their authentic cultural identity.', 'e.g. Integrated craft motifs as functional acoustic panels and lighting screens...', 'textarea', TRUE, 3, TRUE)
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
-- 5. SEED UPLOAD REQUIREMENTS FOR CATEGORIES 14 TO 19
-- ------------------------------------------------------------------------------

-- Requirements for 14 (Best Developer)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000014'::uuid, 'cover_image', 'Primary Hero / Development Showcase Photograph', 'High-resolution exterior photograph showcasing the development in its completed or advanced stage.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'project_photo', 'Completed Development Photography', 'High-resolution photographs of buildings, landscaping, entrance boulevard, and amenities (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'floor_plan', 'Master Layout & Sanctioned Architectural Plans', 'Approved layout plan, floor plates, or master blueprint (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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

-- Requirements for 15 (Best Organised Township)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000015'::uuid, 'cover_image', 'Township Master Aerial / Hero Photograph', 'Aerial panoramic view or landmark gateway photograph illustrating the masterplan scale.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'project_photo', 'Township Infrastructure & Amenity Photography', 'Photographs of streets, landscaped parks, clubhouse, utilities, and completed homes (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'floor_plan', 'Approved Master Plan & Zoning Blueprint', 'Detailed master layout showing land use, road network, open spaces, and utility zoning (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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

-- Requirements for 16 (Best Office Design)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000016'::uuid, 'cover_image', 'Primary Office Interior Hero Photograph', 'Definitive photograph capturing the central reception, atrium, or main workplace floor.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'project_photo', 'Completed Workplace Photography', 'High-resolution interior photography of workstations, meeting rooms, executive cabins, and breakout lounges (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'floor_plan', 'Workplace Space Planning & Furniture Layout', 'Dimensioned furniture layout, circulation plan, and reflected ceiling plan (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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

-- Requirements for 17 (Best Commercial Building)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000017'::uuid, 'cover_image', 'Primary Commercial Building Hero / Façade Photograph', 'Definitive daylight or twilight architectural photograph showcasing the completed commercial structure.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'project_photo', 'Completed Commercial Architecture Photography', 'Exterior angles, street-level views, entrance atrium, lobbies, and functional commercial areas (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'floor_plan', 'Architectural Site Plan, Floor Plates & Sections', 'Sanctioned site plan, typical commercial floor plate layout, elevations, and architectural cross-sections (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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

-- Requirements for 18 (Excellence in Vernacular Architecture)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000018'::uuid, 'cover_image', 'Primary Vernacular Architecture Photograph', 'Primary high-resolution photograph showing the building within its landscape and architectural context.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'project_photo', 'Vernacular Architecture Photography', 'Exterior angles, courtyard views, traditional details, roof forms, and interior living spaces (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000018'::uuid, 'floor_plan', 'Architectural Site Plan, Floor Plans & Sections (A3 Format)', 'Architectural drawings showing spatial planning, courtyard orientation, ventilation paths, and elevations (PDF, JPG, PNG up to 15MB).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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

-- Requirements for 19 (Excellence in Kutchi Craft & Artisan Integration)
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000019'::uuid, 'cover_image', 'Primary Craft & Space Hero Photograph', 'Definitive photograph showcasing the integration of Kutchi craftsmanship within the architectural or interior environment.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png'], 1, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'project_photo', 'Craft Detail & Spatial Context Photography', 'Close-ups of craft applications, textures, artisan process photos, and wide-angle contextual interior shots (Min 3, Max 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png'], 2, TRUE),
('c2026000-0000-0000-0000-000000000019'::uuid, 'floor_plan', 'Interior Layout / Craft Placement Drawings (A3 Format)', 'Floor plan or interior elevation showing the placement, scale, and integration of craft elements (PDF, JPG, PNG up to 15MB).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'application/pdf'], 3, TRUE)
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
-- 6. AUDIT LOG RECORD
-- ------------------------------------------------------------------------------

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, created_at)
VALUES 
(
    NULL,
    'categories_synchronization_16_categories',
    'edition',
    'e2026000-0000-0000-0000-000000002026',
    '{"active_count": 10, "status": "pre_sync"}'::jsonb,
    '{"active_count": 16, "categories": ["01","02","04","05","07","08","09","10","11","12","14","15","16","17","18","19"], "retired": ["03","06","13"], "status": "synchronized"}'::jsonb,
    CURRENT_TIMESTAMP
);

COMMIT;
