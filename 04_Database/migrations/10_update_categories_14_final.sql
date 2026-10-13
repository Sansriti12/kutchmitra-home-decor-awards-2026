-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 10: UPDATE CATEGORIES TO 14 FINAL ACTIVE CATEGORIES (NON-DESTRUCTIVE)
-- File: 04_Database/migrations/10_update_categories_14_final.sql
-- ==============================================================================
-- RATIONALE & CLIENT SPECIFICATION:
-- Based on the client-provided document "Kutchmitra_Home Decor Awards 2026_Categories.pdf",
-- the official active award catalog for the 2026 edition is finalized at 14 categories:
--   - 10 Retained Categories
--   - 4 New Categories (Best Developer, Best Organised Township, Best Office Design, Best Commercial Building)
--   - 3 Retired Categories (Best Apartment Design [CAT-03], Ultra-Luxury Residential [CAT-06], Best Contractor [CAT-13])
--
-- CRITICAL ARCHITECTURAL GUARANTEES:
-- 1. Strictly non-destructive: is_active = FALSE for retired categories. No rows deleted.
-- 2. Foreign keys, nominations, evaluations, and audit logs remain intact.
-- 3. Dynamic questions & upload requirements for the 4 new categories are seeded with idempotent ON CONFLICT clauses.
-- 4. Audit entries recorded for all modifications.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. DEACTIVATE RETIRED CATEGORIES (Non-Destructive)
-- ------------------------------------------------------------------------------

-- 1.1 Category 06: Ultra-Luxury Residential Project of the Year
UPDATE categories
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c2026000-0000-0000-0000-000000000006'::uuid
  AND edition_id = 'e2026000-0000-0000-0000-000000002026'::uuid;

UPDATE category_questions
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid;

UPDATE category_upload_requirements
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid;

UPDATE scoring_criteria
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid;

-- 1.2 Category 13: Best Contractor of the Year
UPDATE categories
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c2026000-0000-0000-0000-000000000013'::uuid
  AND edition_id = 'e2026000-0000-0000-0000-000000002026'::uuid;

UPDATE category_questions
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid;

UPDATE category_upload_requirements
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid;

UPDATE scoring_criteria
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid;

-- 1.3 Ensure Category 03: Best Apartment Design remains inactive
UPDATE categories
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c2026000-0000-0000-0000-000000000003'::uuid
  AND edition_id = 'e2026000-0000-0000-0000-000000002026'::uuid;


-- ------------------------------------------------------------------------------
-- 2. UPDATE RETRAINED CATEGORIES WITH EXACT PDF WORDING & SEQUENTIAL DISPLAY ORDER
-- ------------------------------------------------------------------------------

-- Update Category 11 to official title in PDF: "Best Themed Project of the Year (Concept & Design)"
UPDATE categories
SET 
    name = 'Best Themed Project of the Year (Concept & Design)',
    short_description = 'Recognising projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.',
    display_order = 9,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'c2026000-0000-0000-0000-000000000011'::uuid;

-- Align sequential display orders for the 10 retained categories:
UPDATE categories SET display_order = 1, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000001'::uuid;
UPDATE categories SET display_order = 2, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000002'::uuid;
UPDATE categories SET display_order = 3, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000004'::uuid;
UPDATE categories SET display_order = 4, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000005'::uuid;
UPDATE categories SET display_order = 5, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000007'::uuid;
UPDATE categories SET display_order = 6, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000008'::uuid;
UPDATE categories SET display_order = 7, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000009'::uuid;
UPDATE categories SET display_order = 8, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000010'::uuid;
UPDATE categories SET display_order = 10, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 'c2026000-0000-0000-0000-000000000012'::uuid;


-- ------------------------------------------------------------------------------
-- 3. INSERT THE 4 NEW APPROVED CATEGORIES (2026 Edition)
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
)
ON CONFLICT (edition_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;


-- ------------------------------------------------------------------------------
-- 4. SEED PROPOSED BASELINE QUESTIONS & UPLOAD REQUIREMENTS FOR 4 NEW CATEGORIES
-- (Initial baseline for application submission; subject to Kutchmitra committee review)
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 4.1 BEST DEVELOPER OF THE YEAR (c2026000-0000-0000-0000-000000000014)
-- ==============================================================================

INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'rera_registration_no',
    'RERA Project Registration / Statutory Developer License',
    'Provide the Gujarat RERA registration number or statutory developer licensing reference for this nominated project.',
    'e.g. PR/GJ/KUTCH/12345/2025',
    'text',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'development_vision_coordination',
    'Project Planning, Design Coordination & Development Vision',
    'Explain the comprehensive development narrative: master planning, consultant coordination, client positioning, and how the project addresses regional demand.',
    'Describe the developer narrative, planning methodology, and spatial coordination...',
    'textarea',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'construction_quality_delivery',
    'Construction Quality, Workmanship & Timely Delivery',
    'Elaborate on quality assurance protocols, structural rigor, contractor management, and project execution timelines.',
    'Detail quality control measures, material standards, and handover track record...',
    'textarea',
    TRUE,
    3,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'development_typology',
    'Primary Real Estate Typology',
    'Select the primary development classification for the nominated property.',
    NULL,
    'select',
    TRUE,
    4,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'infrastructure_amenities',
    'Integrated Infrastructure, Sustainability & Resident Amenities',
    'Detail community amenities, parking, security, green spaces, energy management, and civic infrastructure.',
    'Detail clubhouse, sports amenities, water management, security, and open green buffers...',
    'textarea',
    TRUE,
    5,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000014'::uuid,
    'video_walkthrough_url',
    'Project Video Walkthrough / Drone Documentation Link',
    'Optional external URL to video tour, drone footage, or site walkthrough (YouTube, Vimeo, Google Drive).',
    'https://...',
    'url',
    FALSE,
    6,
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

-- Options for development_typology
INSERT INTO question_options (question_id, label, value, display_order, is_active)
VALUES 
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000014'::uuid AND question_key = 'development_typology' LIMIT 1), 'Residential Plotted Development / Gated Layout', 'plotted_layout', 1, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000014'::uuid AND question_key = 'development_typology' LIMIT 1), 'High-Rise / Multi-Storey Residential Towers', 'residential_towers', 2, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000014'::uuid AND question_key = 'development_typology' LIMIT 1), 'Commercial & Retail Complex', 'commercial_complex', 3, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000014'::uuid AND question_key = 'development_typology' LIMIT 1), 'Mixed-Use Residential & Commercial Development', 'mixed_use', 4, TRUE)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Upload Requirements for Best Developer
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000014'::uuid, 'cover_image', 'Primary Hero / Development Showcase Photograph', 'High-resolution exterior photograph showcasing the development in its completed or advanced stage.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'project_photo', 'Completed Development Photography', 'High-resolution photographs of buildings, landscaping, entrance boulevard, and amenities (Minimum 3, maximum 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'floor_plan', 'Master Layout & Sanctioned Architectural Plans', 'Approved layout plan, floor plates, or master blueprint (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000014'::uuid, 'portfolio_pdf', 'Developer Project Brochure / Dossier (PDF)', 'Comprehensive brochure detailing project specifications, amenities, and developer portfolio (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
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


-- ==============================================================================
-- 4.2 BEST ORGANISED TOWNSHIP OF THE YEAR (c2026000-0000-0000-0000-000000000015)
-- ==============================================================================

INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'township_acreage_scale',
    'Total Land Acreage & Township Development Scale',
    'Specify total land parcel size (in acres or hectares), planned population/units, and phased completion status.',
    'e.g. 50 Acres masterplan, 450 residential units, Phase 1 complete',
    'text',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'masterplan_vision_zoning',
    'Master Planning Concept, Spatial Zoning & Open Spaces',
    'Explain the overarching urban planning vision: residential clusters, open green reserves, pedestrian safety, and vehicular circulation.',
    'Elaborate on spatial zoning, green corridor buffers, open spaces percentage, and master layout...',
    'textarea',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'civic_infrastructure_utilities',
    'Civic Infrastructure, Water, Power & Road Networks',
    'Detail the internal road hierarchy, subterranean utilities, stormwater drainage, water supply, and waste management systems.',
    'Describe arterial roads, underground utility lines, water storage, and reliable civic utilities...',
    'textarea',
    TRUE,
    3,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'community_social_facilities',
    'Community Facilities, Amenities & Social Infrastructure',
    'Detail community amenities provided: clubhouse, retail/convenience, recreational zones, sports facilities, security, and healthcare/education access.',
    'Describe central community hub, sports grounds, parks, security gates, and social amenities...',
    'textarea',
    TRUE,
    4,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'environmental_sustainability',
    'Environmental Sustainability & Climate-Responsive Features',
    'Highlight rainwater harvesting, wastewater treatment/reuse (STP), renewable solar integration, and indigenous afforestation.',
    'Describe environmental preservation, tree canopy, solar street lighting, and water conservation...',
    'textarea',
    TRUE,
    5,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000015'::uuid,
    'video_walkthrough_url',
    'Township Masterplan Drone Video / Virtual Tour Link',
    'Optional link to an aerial drone survey, walkthrough video, or interactive masterplan presentation.',
    'https://...',
    'url',
    FALSE,
    6,
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

-- Upload Requirements for Best Organised Township
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000015'::uuid, 'cover_image', 'Township Master Aerial / Hero Photograph', 'Aerial panoramic view or landmark gateway photograph illustrating the masterplan scale.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'project_photo', 'Township Infrastructure & Amenity Photography', 'Photographs of streets, landscaped parks, clubhouse, utilities, and completed homes (Minimum 3, maximum 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'floor_plan', 'Approved Master Plan & Zoning Blueprint', 'Detailed master layout showing land use, road network, open spaces, and utility zoning (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000015'::uuid, 'portfolio_pdf', 'Township Masterplan Brochure & Profile (PDF)', 'Full presentation document detailing township infrastructure, amenities, and community governance (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
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


-- ==============================================================================
-- 4.3 BEST OFFICE DESIGN OF THE YEAR (c2026000-0000-0000-0000-000000000016)
-- ==============================================================================

INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'workplace_concept_vision',
    'Workplace Planning Vision, Spatial Efficiency & Ergonomics',
    'Explain how the spatial design balances open collaboration, focused individual work, executive suites, and ergonomic comfort.',
    'Describe the workplace philosophy, spatial zoning, layout optimization, and employee workflow...',
    'textarea',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'office_typology',
    'Office Workplace Typology',
    'Select the operational category of the nominated office environment.',
    NULL,
    'select',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'employee_wellbeing_acoustics',
    'Employee Well-Being, Acoustic Comfort & Air Quality',
    'Detail acoustic baffling, indoor environmental quality (IEQ), thermal comfort, natural daylighting, and employee breakout zones.',
    'Detail acoustic paneling, sound insulation, ergonomic furniture, air quality, and wellness spaces...',
    'textarea',
    TRUE,
    3,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'technology_smart_systems',
    'Smart Office Technology, Lighting & Automation',
    'Describe the integration of automated lighting control, conference room AV systems, access control, and energy monitoring.',
    'Detail intelligent lighting, sensor controls, integrated AV, and energy efficiency...',
    'textarea',
    TRUE,
    4,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'materiality_branding_craft',
    'Interior Materiality, Brand Identity & Bespoke Craftsmanship',
    'Explain how color palettes, surface textures, architectural joinery, and branding elements represent corporate culture and spatial excellence.',
    'Describe wall finishes, custom cabinetry, bespoke fixtures, and brand reflection...',
    'textarea',
    TRUE,
    5,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000016'::uuid,
    'video_walkthrough_url',
    'Workplace Video Walkthrough / Virtual Tour Link',
    'Optional link to a walkthrough video showcasing office interiors, collaboration zones, and work areas.',
    'https://...',
    'url',
    FALSE,
    6,
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

-- Options for office_typology
INSERT INTO question_options (question_id, label, value, display_order, is_active)
VALUES 
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000016'::uuid AND question_key = 'office_typology' LIMIT 1), 'Corporate Headquarters / Enterprise Facility', 'corporate_hq', 1, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000016'::uuid AND question_key = 'office_typology' LIMIT 1), 'Creative Studio / Architecture / Design Atelier', 'creative_studio', 2, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000016'::uuid AND question_key = 'office_typology' LIMIT 1), 'Co-working / Flexible Shared Workplace', 'coworking_space', 3, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000016'::uuid AND question_key = 'office_typology' LIMIT 1), 'Professional Practice Suite (Law, Finance, Medical)', 'professional_suite', 4, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000016'::uuid AND question_key = 'office_typology' LIMIT 1), 'IT / Tech Centre / Development Studio', 'tech_center', 5, TRUE)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Upload Requirements for Best Office Design
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000016'::uuid, 'cover_image', 'Primary Office Interior Hero Photograph', 'Definitive photograph capturing the central reception, atrium, or main workplace floor.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'project_photo', 'Completed Workplace Photography', 'High-resolution interior photography of workstations, meeting rooms, executive cabins, and breakout lounges (Minimum 3, maximum 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'floor_plan', 'Workplace Space Planning & Furniture Layout', 'Dimensioned furniture layout, circulation plan, and reflected ceiling plan (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000016'::uuid, 'portfolio_pdf', 'Office Design Presentation Dossier (PDF)', 'Comprehensive design booklet detailing material selections, lighting concepts, and corporate identity (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
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


-- ==============================================================================
-- 4.4 BEST COMMERCIAL BUILDING OF THE YEAR (c2026000-0000-0000-0000-000000000017)
-- ==============================================================================

INSERT INTO category_questions (category_id, question_key, question_text, help_text, placeholder, field_type, is_required, display_order, is_active)
VALUES 
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'architectural_form_facade',
    'Architectural Form, Façade Engineering & Urban Context',
    'Elaborate on the architectural expression, massing, building skin/glazing, street presence, and civic contribution to its urban fabric.',
    'Describe the building form, facade materials, structural articulation, and street presence...',
    'textarea',
    TRUE,
    1,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'building_typology',
    'Commercial Building Typology',
    'Select the primary classification of the nominated commercial development.',
    NULL,
    'select',
    TRUE,
    2,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'functionality_circulation_vertical',
    'Functional Program, Circulation & Vertical Transportation',
    'Explain spatial efficiency, lobby design, elevator cores, universal accessibility (Divyangjan compliance), and emergency egress.',
    'Detail core-to-floorplate ratio, public vs tenant circulation, and vertical transport efficiency...',
    'textarea',
    TRUE,
    3,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'construction_mep_safety',
    'Construction Quality, MEP Engineering & Fire Life Safety',
    'Detail structural engineering, MEP integration, HVAC efficiency, fire suppression systems, and seismic design.',
    'Describe structural system, HVAC/ventilation, fire safety, and building automation...',
    'textarea',
    TRUE,
    4,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'sustainability_energy_performance',
    'Environmental Sustainability, Shading & Energy Efficiency',
    'Highlight solar heat gain mitigation, high-performance glazing, rainwater harvesting, solar PV, and environmental rating (IGBC/GRIHA/LEED if applicable).',
    'Describe solar orientation, energy-efficient building envelope, and sustainable building systems...',
    'textarea',
    TRUE,
    5,
    TRUE
),
(
    'c2026000-0000-0000-0000-000000000017'::uuid,
    'video_walkthrough_url',
    'Commercial Building Video Presentation / Drone Footage Link',
    'Optional external URL to drone architectural cinematography, building tour, or virtual presentation.',
    'https://...',
    'url',
    FALSE,
    6,
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

-- Options for building_typology
INSERT INTO question_options (question_id, label, value, display_order, is_active)
VALUES 
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000017'::uuid AND question_key = 'building_typology' LIMIT 1), 'Commercial Office Tower / Corporate Landmark', 'office_tower', 1, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000017'::uuid AND question_key = 'building_typology' LIMIT 1), 'Retail Mall / Commercial Shopping Centre', 'retail_mall', 2, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000017'::uuid AND question_key = 'building_typology' LIMIT 1), 'Mixed-Use Commercial & Business Hub', 'mixed_use_commercial', 3, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000017'::uuid AND question_key = 'building_typology' LIMIT 1), 'Hospitality / Hotel / Exhibition Complex', 'hospitality_commercial', 4, TRUE),
((SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000017'::uuid AND question_key = 'building_typology' LIMIT 1), 'Institutional / Healthcare / Educational Landmark', 'institutional_commercial', 5, TRUE)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Upload Requirements for Best Commercial Building
INSERT INTO category_upload_requirements (category_id, upload_type, title, description, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order, is_active)
VALUES
('c2026000-0000-0000-0000-000000000017'::uuid, 'cover_image', 'Primary Commercial Building Hero / Façade Photograph', 'Definitive daylight or twilight architectural photograph showcasing the completed commercial structure.', TRUE, 1, 1, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'project_photo', 'Completed Commercial Architecture Photography', 'Exterior angles, street-level views, entrance atrium, lobbies, and functional commercial areas (Minimum 3, maximum 10).', TRUE, 3, 10, 15, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'floor_plan', 'Architectural Site Plan, Floor Plates & Sections', 'Sanctioned site plan, typical commercial floor plate layout, elevations, and architectural cross-sections (PDF or Image).', TRUE, 1, 5, 15, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 3, TRUE),
('c2026000-0000-0000-0000-000000000017'::uuid, 'portfolio_pdf', 'Commercial Architecture Presentation Dossier (PDF)', 'Comprehensive architectural dossier detailing structural, MEP, façade engineering, and design concepts (Max 15MB).', FALSE, 0, 1, 15, ARRAY['application/pdf'], 4, TRUE)
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
-- 5. AUDIT LOG RECORDS FOR 2026 CATEGORY RECONFIGURATION
-- ------------------------------------------------------------------------------

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, created_at)
VALUES 
(
    NULL,
    'category_deactivated',
    'category',
    'c2026000-0000-0000-0000-000000000006',
    '{"code": "06", "name": "Ultra-Luxury Residential Project of the Year", "is_active": true}'::jsonb,
    '{"code": "06", "name": "Ultra-Luxury Residential Project of the Year", "is_active": false, "reason": "Committee retirement per official PDF specification"}'::jsonb,
    CURRENT_TIMESTAMP
),
(
    NULL,
    'category_deactivated',
    'category',
    'c2026000-0000-0000-0000-000000000013',
    '{"code": "13", "name": "Best Contractor of the Year", "is_active": true}'::jsonb,
    '{"code": "13", "name": "Best Contractor of the Year", "is_active": false, "reason": "Committee retirement per official PDF specification"}'::jsonb,
    CURRENT_TIMESTAMP
),
(
    NULL,
    'categories_finalized_14',
    'edition',
    'e2026000-0000-0000-0000-000000002026',
    '{"active_count": 12, "deactivated": ["03"]}'::jsonb,
    '{"active_count": 14, "deactivated": ["03", "06", "13"], "added": ["14", "15", "16", "17"]}'::jsonb,
    CURRENT_TIMESTAMP
);

COMMIT;
