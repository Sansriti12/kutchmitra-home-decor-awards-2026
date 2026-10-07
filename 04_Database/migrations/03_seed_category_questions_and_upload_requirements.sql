-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 03: SEED DYNAMIC CATEGORY QUESTIONS & UPLOAD REQUIREMENTS
-- File: 04_Database/migrations/03_seed_category_questions_and_upload_requirements.sql
-- ==============================================================================
--
-- IMPORTANT CLIENT & AUDIT NOTICE:
-- These category questions and upload requirements are an initial proposed baseline
-- created using publicly available industry references, including the TOI Home & Decor
-- Awards structure, and are subject to Kutchmitra client review and approval.
--
-- This script is strictly idempotent and safe to run multiple times without duplicating data.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- CATEGORY #01: Architect of the Year (c2026000-0000-0000-0000-000000000001)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'coa_registration_no',
    'Council of Architecture (COA) / Professional Registration Number',
    'Provide your valid Council of Architecture registration or recognized statutory professional body registration number.',
    'e.g. CA/2015/12345',
    'text',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'architectural_concept_statement',
    'Core Architectural Vision & Design Concept',
    'Elaborate on the conceptual design narrative, spatial vision, form generation, and how the architectural solution addresses the client brief.',
    'Describe the overarching architectural narrative, inspiration, and design philosophy...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'spatial_planning_circulation',
    'Spatial Planning, Zoning & Functional Efficiency',
    'Detail how spatial zoning, circulation flow, day-lighting, natural ventilation, and ergonomic utility are optimized in the layout.',
    'Detail spatial zoning, transition between public and private zones, and circulation...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'structural_system',
    'Primary Structural & Construction System',
    'Select the primary structural methodology utilized in this project.',
    NULL,
    'select',
    TRUE,
    4,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'structural_system' LIMIT 1),
    'Reinforced Cement Concrete (RCC) Frame',
    'rcc_frame',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'structural_system' LIMIT 1),
    'Load-Bearing Masonry & Arches',
    'load_bearing_masonry',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'structural_system' LIMIT 1),
    'Composite Steel & Concrete Structure',
    'composite_steel_concrete',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'structural_system' LIMIT 1),
    'Hybrid Traditional Timber & Stone Masonry',
    'hybrid_traditional',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'structural_system' LIMIT 1),
    'Prefabricated / Modular Construction',
    'modular_prefab',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'regional_climate_response',
    'Regional Climate Adaptation & Seismic Sensitivity',
    'Explain how the architectural design specifically addresses Kutch''s arid climate, thermal comfort, solar path, and Seismic Zone V structural requirements.',
    'Describe passive cooling, shading elements, thermal mass, and seismic considerations...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'indigenous_materials_craft',
    'Indigenous Materials & Traditional Crafts Employed',
    'Select all regional materials and artisan craft disciplines integrated into the architecture.',
    NULL,
    'checkbox',
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Local Kutch Yellow Sandstone / Dhrangadhra Stone',
    'kutch_stone',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Traditional Lime Plaster & Mortar Finish',
    'lime_plaster',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Reclaimed Timber & Local Wood Joinery',
    'reclaimed_wood',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Clay Roof Tiles (Kavalu)',
    'clay_tiles',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Mud & Mirror Art (Lippan Kaam) Elements',
    'lippan_art',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000001'::uuid AND question_key = 'indigenous_materials_craft' LIMIT 1),
    'Handcrafted Metal / Jali Craft',
    'metal_jali',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'video_walkthrough_url',
    'Video Walkthrough / Architectural Presentation Link',
    'Optional URL to an external video walkthrough, drone documentation, or detailed presentation (YouTube, Vimeo, Google Drive).',
    'https://...',
    'url',
    FALSE,
    7,
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'cover_image',
    'Primary Hero / Cover Photograph',
    'One high-resolution landscape photograph showcasing the definitive architectural view of the project for the jury catalogue.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'project_photo',
    'Completed Architectural Photography',
    'High-resolution exterior and architectural photographs illustrating volumetric form, craftsmanship, and spatial quality (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'floor_plan',
    'Architectural Drawings & Layout Plans',
    'Dimensioned floor plans, site plans, key elevations, and cross-sections illustrating spatial zoning and circulation (PDF or High-Res Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'portfolio_pdf',
    'Architectural Concept Dossier (PDF)',
    'Comprehensive multi-page presentation covering design philosophy, structural diagrams, and project evolution (Optional, Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #02: Best Luxury Residence (c2026000-0000-0000-0000-000000000002)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'residence_typology',
    'Residence Typology & Architectural Setting',
    'Specify the physical configuration and estate context of the luxury residence.',
    NULL,
    'select',
    TRUE,
    1,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'residence_typology' LIMIT 1),
    'Standalone Independent Bungalow',
    'independent_bungalow',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'residence_typology' LIMIT 1),
    'Private Gated Estate Home',
    'gated_estate',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'residence_typology' LIMIT 1),
    'Farmhouse / Country Retreat',
    'farmhouse_retreat',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'residence_typology' LIMIT 1),
    'Luxury Penthouse / Sky Duplex',
    'luxury_penthouse',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'luxury_design_narrative',
    'Luxury Design Concept & Spatial Grandeur',
    'Describe how the residence embodies luxury through architectural volume, scale, high ceilings, custom detailing, and spatial sequencing.',
    'Describe how luxury is manifested in scale, proportion, light, and materiality...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'indoor_outdoor_integration',
    'Indoor-Outdoor Transition & Landscape Integration',
    'Detail how private courtyards, verandahs (otlas), pergolas, water features, and landscaped outdoor spaces merge with indoor living.',
    'Explain the relationship between the interior rooms and outdoor spaces...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'material_palette_curation',
    'Curated Material Palette & Custom Detailing',
    'Describe the fine materials, imported/indigenous stones, bespoke wood joinery, and specialized finishes that elevate the interior/exterior experience.',
    'Detail the stones, woods, metals, and artisanal finishes specified...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'number_of_bedrooms',
    'Total Number of Bedrooms / Suites',
    'Enter the total count of private bedroom suites in the residence.',
    'e.g. 5',
    'number',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'bespoke_amenities',
    'Bespoke Luxury Amenities & Lifestyle Features',
    'Select all dedicated luxury amenities integrated into the residence.',
    NULL,
    'checkbox',
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Private Swimming Pool / Plunge Pool',
    'private_pool',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Home Cinema / Dolby Atmos Media Lounge',
    'home_cinema',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Private Gymnasium / Wellness Spa Room',
    'wellness_gym',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Central Landscaped Courtyard with Water Body',
    'central_courtyard',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Multi-Car Shaded / Subterranean Garage',
    'multi_car_garage',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000002'::uuid AND question_key = 'bespoke_amenities' LIMIT 1),
    'Staff Quarters & Separate Service Corridors',
    'service_quarters',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'video_walkthrough_url',
    'Video Walkthrough / Tour Link',
    'Optional link to a video walkthrough or virtual tour of the luxury residence.',
    'https://...',
    'url',
    FALSE,
    7,
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'cover_image',
    'Primary Hero / Cover Photograph',
    'One high-resolution photograph capturing the signature architectural or interior luxury perspective.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'project_photo',
    'Residence Interior & Exterior Photography',
    'Comprehensive photography showing living spaces, master suites, façade, and landscaping (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'floor_plan',
    'Floor Plans & Spatial Layout',
    'Dimensioned floor plans showing room dimensions, circulation, and zoning across all levels (PDF or High-Res Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000002'::uuid,
    'portfolio_pdf',
    'Luxury Residence Dossier (PDF)',
    'Optional PDF presentation detailing material selections, lighting details, and design intent (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #03: Best Apartment Design (c2026000-0000-0000-0000-000000000003)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'apartment_configuration',
    'Apartment Layout Configuration',
    'Select the unit typology of the nominated apartment.',
    NULL,
    'select',
    TRUE,
    1,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000003'::uuid AND question_key = 'apartment_configuration' LIMIT 1),
    '2 BHK Apartment',
    '2bhk',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000003'::uuid AND question_key = 'apartment_configuration' LIMIT 1),
    '3 BHK Apartment',
    '3bhk',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000003'::uuid AND question_key = 'apartment_configuration' LIMIT 1),
    '4 BHK+ Luxury Apartment',
    '4bhk_plus',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000003'::uuid AND question_key = 'apartment_configuration' LIMIT 1),
    'Duplex / Penthouse Apartment',
    'penthouse_duplex',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'carpet_area_sqft',
    'Net Carpet Area (Sq. Ft.)',
    'Enter the exact usable carpet area of the apartment in square feet.',
    'e.g. 1850',
    'number',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'space_optimization_concept',
    'Space Optimization & Layout Planning Concept',
    'Explain how the layout maximizes usable space, circulation, visual expansiveness, and natural illumination within the apartment footprint.',
    'Describe spatial planning, visual continuity, and open-plan concepts...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'custom_joinery_storage',
    'Custom Joinery & Seamless Storage Solutions',
    'Detail how built-in cabinetry, multifunctional furniture, and concealed storage preserve a clean, uncluttered aesthetic.',
    'Describe custom millwork, concealed utility units, and storage integration...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'lighting_and_material_palette',
    'Lighting Architecture & Material Palette',
    'Detail the artificial lighting design (ambient, task, accent) and the selection of materials, textiles, and surface finishes.',
    'Explain the lighting scheme, ceiling design, and material palette...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'balcony_outdoor_integration',
    'Balcony & Outdoor Extension Design',
    'Describe how the balcony or terrace is designed as a tranquil extension of the living or private quarters.',
    'Describe green walls, seating, flooring, and views...',
    'textarea',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'cover_image',
    'Signature Apartment Hero Photograph',
    'One hero photograph capturing the primary living or dining area showcasing the overall design aesthetic.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'project_photo',
    'Completed Apartment Interior Photographs',
    'High-quality photography of living areas, bedrooms, kitchen, and custom joinery details (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'floor_plan',
    'Apartment Furniture Layout & Layout Plan',
    'Dimensioned furniture layout and architectural plan showing space allocation and circulation (PDF or High-Res Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000003'::uuid,
    'portfolio_pdf',
    'Apartment Design Presentation (PDF)',
    'Optional design deck with material boards, lighting plans, and before/after views if applicable (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #04: Best Renovation Project (c2026000-0000-0000-0000-000000000004)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'original_structure_age_years',
    'Approximate Age of Structure Prior to Renovation (Years)',
    'Estimated age of the existing building or space before renovation commenced.',
    'e.g. 25',
    'number',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'renovation_scope_strategy',
    'Primary Renovation & Intervention Scope',
    'Select the primary classification of the renovation work.',
    NULL,
    'select',
    TRUE,
    2,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'renovation_scope_strategy' LIMIT 1),
    'Comprehensive Adaptive Reuse / Structural Overhaul',
    'adaptive_reuse',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'renovation_scope_strategy' LIMIT 1),
    'Complete Interior Transformation & Spatial Re-planning',
    'interior_transformation',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'renovation_scope_strategy' LIMIT 1),
    'Façade Modernization & Exterior Remodeling',
    'facade_remodel',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'renovation_scope_strategy' LIMIT 1),
    'Heritage Restoration with Modern Infrastructure',
    'heritage_restoration',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'pre_renovation_challenges',
    'Pre-Existing Deficiencies & Project Brief',
    'Describe the structural, spatial, daylighting, or aesthetic limitations of the property prior to the intervention.',
    'Detail structural dampness, poor circulation, low ceiling heights, or outdated services...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'conservation_vs_modernization',
    'Conservation of Existing Elements vs. Modern Additions',
    'Explain which original architectural or structural components were conserved, repaired, or repurposed versus what was newly introduced.',
    'Detail retained masonry, restored woodwork, or newly added structural elements...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'transformation_impact_narrative',
    'Transformation Narrative & User Impact',
    'How has the renovation enhanced liveability, energy efficiency, modern functionality, and longevity for the occupants?',
    'Detail the before-and-after transformation in lifestyle and functionality...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'structural_retrofitting',
    'Structural & Services Retrofitting Upgrades',
    'Select all structural and technical upgrades implemented during the renovation.',
    NULL,
    'checkbox',
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'structural_retrofitting' LIMIT 1),
    'Seismic Strengthening / Beam Column Retrofitting',
    'seismic_retrofit',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'structural_retrofitting' LIMIT 1),
    'Comprehensive Waterproofing & Damp Proofing Overhaul',
    'waterproofing',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'structural_retrofitting' LIMIT 1),
    'Complete Electrical & Smart Rewiring Replacement',
    'electrical_rewiring',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'structural_retrofitting' LIMIT 1),
    'Plumbing & Drainage Re-engineering',
    'plumbing_replacement',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000004'::uuid AND question_key = 'structural_retrofitting' LIMIT 1),
    'Thermal Insulation & Energy-Efficient Glazing Upgrade',
    'thermal_glazing',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'cover_image',
    'Transformed Project Hero Photograph',
    'One hero photograph capturing the renovated space or façade in its completed, transformed state.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'project_photo',
    'Before & After Completed Photography',
    'Comparative photographs demonstrating the pre-renovation condition alongside the finished spaces (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'floor_plan',
    'Demolition & Proposed Layout Drawings',
    'Architectural drawings showing the original layout, walls demolished/altered, and the final proposed floor plan (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000004'::uuid,
    'portfolio_pdf',
    'Renovation Case Study Dossier (PDF)',
    'Optional project dossier documenting on-site challenges, structural solutions, and transformation chronology (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #05: Best Sustainable Home (c2026000-0000-0000-0000-000000000005)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'passive_solar_strategies',
    'Passive Solar & Bioclimatic Architecture Strategies',
    'Select all passive climatic strategies implemented in the residential design.',
    NULL,
    'checkbox',
    TRUE,
    1,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Solar Orientation & Optimized Glazing Placement',
    'solar_orientation',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Thermal Mass Construction (Rammed Earth, Stone, Cavity Walls)',
    'thermal_mass',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Natural Cross-Ventilation & Induced Stack Effect',
    'cross_ventilation',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Courtyard Microclimate & Evaporative Cooling Features',
    'courtyard_cooling',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Deep Shading Overhangs, Jali Screens & Louvers',
    'shading_jali',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'passive_solar_strategies' LIMIT 1),
    'Green Roof / High-Albedo Reflective Roof Coating',
    'cool_roof',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'building_envelope_materials',
    'Eco-Friendly Materials & Embodied Carbon Reduction',
    'Detail the sustainable, non-toxic, locally sourced, and low-embodied-energy materials specified in the home.',
    'Detail mud bricks, fly ash concrete, lime, locally quarried stone, reclaimed timber...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'renewable_energy_system',
    'Renewable Energy Generation & Infrastructure',
    'Select the renewable power configuration operational at the home.',
    NULL,
    'select',
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'renewable_energy_system' LIMIT 1),
    'Grid-Connected Rooftop Solar Photovoltaic (PV) System',
    'solar_grid_tied',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'renewable_energy_system' LIMIT 1),
    'Hybrid Solar PV System with Battery Storage Backup',
    'solar_hybrid_battery',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'renewable_energy_system' LIMIT 1),
    'Solar Water Heating System with Efficient Heat Pump',
    'solar_water_heating',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'renewable_energy_system' LIMIT 1),
    'Off-Grid Completely Autonomous Renewable Power',
    'off_grid_solar',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000005'::uuid AND question_key = 'renewable_energy_system' LIMIT 1),
    'Passive Solar Ready (Pre-wired & Infrastructure Enabled)',
    'solar_ready',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'water_conservation_harvesting',
    'Rainwater Harvesting & Water Management',
    'Detail rainwater storage capacity (tankas), groundwater recharge borewells, greywater recycling, and low-flow plumbing fixtures.',
    'Describe storage capacity in liters, recharge methodology, and water-saving fixtures...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'energy_reduction_percentage',
    'Estimated Grid Energy Reduction (% vs. Conventional Home)',
    'Estimated reduction in monthly electrical consumption achieved through passive design and on-site generation.',
    'e.g. 45',
    'number',
    FALSE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'sustainability_certifications',
    'Green Certifications or Third-Party Ratings (If Any)',
    'Mention any IGBC, GRIHA, GEM, or self-monitored energy audit credentials if applicable.',
    'e.g. IGBC Green Homes Platinum or Uncertified Self-Audit',
    'text',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'cover_image',
    'Sustainable Home Hero Photograph',
    'One high-resolution photograph capturing the home''s bioclimatic form and environmental harmony.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'project_photo',
    'Sustainable Features & Built Photographs',
    'Photographs highlighting passive cooling courtyards, solar arrays, thermal walls, and rainwater systems (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'floor_plan',
    'Bioclimatic Sun-Path & Floor Plans',
    'Architectural floor plans with sun-path diagrams, prevailing wind arrows, and ventilation sections (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000005'::uuid,
    'portfolio_pdf',
    'Sustainability Audit / Presentation (PDF)',
    'Optional technical report outlining energy calculations, water balance sheets, and material sourcing audits (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #06: Ultra-Luxury Residential Project of the Year (c2026000-0000-0000-0000-000000000006)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'estate_plot_area_sqyd',
    'Total Estate Plot / Land Area (Sq. Yards)',
    'Enter the total land parcel size occupied by the ultra-luxury residential estate.',
    'e.g. 2500',
    'number',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'grand_architectural_narrative',
    'Architectural Grandeur & Landmark Identity',
    'Articulate the architectural vision that defines this estate as a benchmark of ultra-luxury, volumetric scale, and timeless aesthetics.',
    'Detail the grand entrance, monumental scale, structural cantilevers, and dramatic volumes...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'craftsmanship_exotic_materials',
    'Master Craftsmanship & Ultra-Premium Materiality',
    'Detail the custom artisanal interventions, book-matched exotic marbles, architectural bronze, specialty woodwork, and high-precision finishes.',
    'Describe rare stones, custom millwork, artisanal ceilings, and luxury materials...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'private_wellness_hospitality',
    'Private Wellness, Hospitality & Entertainment Facilities',
    'Describe the private resort-caliber amenities such as heated infinity pools, spa suites, cigar lounges, private theaters, and chef demonstration kitchens.',
    'Detail dedicated entertainment, spa, and hospitality zones...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'security_automation_infrastructure',
    'High-Level Automation, Security & Privacy Systems',
    'Select the high-end technology and privacy systems integrated across the estate.',
    NULL,
    'checkbox',
    TRUE,
    5,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Centralized Crestron / KNX Master Automation Protocol',
    'crestron_knx',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Multi-Tier Perimeter Security, CCTV & Biometric Entry',
    'biometric_security',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Segregated Service Corridors for Complete Family Privacy',
    'service_corridors',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Acoustically Isolated Cinema with Professional Dolby Atmos',
    'dolby_cinema',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Climate-Controlled Outdoor Living Pavilions',
    'climate_lounges',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000006'::uuid AND question_key = 'security_automation_infrastructure' LIMIT 1),
    'Centralized Variable Refrigerant Flow (VRF) Air Conditioning',
    'vrf_ac',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'video_walkthrough_url',
    'Cinematic Video Tour / Drone Footage URL',
    'Optional URL to a high-definition cinematic video walkthrough or drone documentation of the estate.',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'cover_image',
    'Ultra-Luxury Hero Exterior / Interior View',
    'One signature high-resolution photograph capturing the landmark grandeur of the estate.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'project_photo',
    'Estate Exterior, Interior & Amenity Photography',
    'Comprehensive high-resolution photographs illustrating grand living spaces, wellness amenities, suites, and night illumination (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'floor_plan',
    'Master Site Plan & Architectural Floor Plans',
    'Dimensioned master plan, landscape layout, and detailed floor plans of all levels and service zones (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000006'::uuid,
    'portfolio_pdf',
    'Ultra-Luxury Project Presentation Dossier (PDF)',
    'Optional complete presentation deck detailing architectural intent, specifications, and custom artisanal works (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #07: Interior Designer of the Year (c2026000-0000-0000-0000-000000000007)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'interior_design_philosophy',
    'Interior Concept, Aesthetic Vocabulary & Narrative',
    'Describe the overarching design philosophy, conceptual narrative, mood board, and color palette uniting the interior spaces.',
    'Describe the interior aesthetic, atmospheric qualities, and spatial philosophy...',
    'textarea',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'primary_interior_style',
    'Primary Interior Design Language',
    'Select the predominant stylistic vocabulary characterizing the project.',
    NULL,
    'select',
    TRUE,
    2,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Contemporary Minimalist with Warm Materiality',
    'contemporary_minimalist',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Modern Indian / Regional Artisanal Fusion',
    'modern_indian_fusion',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Classic Elegance & Neo-Classical Detailing',
    'neo_classical',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Transitional Chic with Bespoke Millwork',
    'transitional_chic',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Raw Industrial & Brutalist Textures',
    'industrial_raw',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000007'::uuid AND question_key = 'primary_interior_style' LIMIT 1),
    'Biophilic & Earthy Organic Vernacular',
    'biophilic_organic',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'custom_furniture_curation',
    'Bespoke Furniture Design & Material Execution',
    'Detail the custom furniture pieces designed specifically for this project, including upholstery, timber selection, joinery details, and hardware.',
    'Detail customized seating, tables, cabinetry, and bespoke millwork...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'lighting_design_concept',
    'Layered Architectural & Decorative Lighting Concept',
    'Explain how architectural lighting (recessed, coves, linear accents) interacts with signature decorative fixtures to sculpt interior space and mood.',
    'Detail the lighting scenes, color temperatures, and fixture selection...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'textiles_and_art_integration',
    'Textiles, Soft Furnishings & Fine Art Curation',
    'Describe the selection of fabrics, rugs, window dressings, wall art, sculptures, and accessories that complete the interior atmosphere.',
    'Explain fabric choices, art curation, and decorative styling...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'video_walkthrough_url',
    'Interior Walkthrough Video Link',
    'Optional link to a video tour demonstrating spatial sequencing and lighting dynamics.',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'cover_image',
    'Signature Interior Hero Photograph',
    'One high-resolution photograph capturing the quintessential interior viewpoint and design essence.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'project_photo',
    'Completed Interior Photography',
    'High-resolution images of living areas, bedrooms, kitchen, bespoke joinery, and material textures (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'floor_plan',
    'Interior Furniture Layout & Reflected Ceiling Plan',
    'Detailed furniture layouts, spatial dimensions, and reflected ceiling / electrical lighting plans (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000007'::uuid,
    'portfolio_pdf',
    'Interior Design Lookbook & Concept Deck (PDF)',
    'Optional presentation including mood boards, material palettes, 3D visualizations, and custom furniture drawings (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #08: Emerging Designer (c2026000-0000-0000-0000-000000000008)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'years_of_professional_practice',
    'Years in Independent Professional Practice',
    'State the total number of years your independent studio has been practicing (must be 7 years or fewer for this category).',
    'e.g. 3',
    'number',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'foundational_design_ethos',
    'Studio Manifesto & Emerging Design Ethos',
    'What design philosophy, fresh perspective, or distinctive methodologies define your practice as an emerging voice in design?',
    'Describe your design vision, creative drive, and studio methodology...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'breakthrough_project_narrative',
    'Nominated Project Innovation & Creative Breakthrough',
    'Explain what makes this nominated project unique, bold, or experimentally distinctive compared to conventional industry approaches.',
    'Describe the key creative risk taken and the breakthrough result...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'resourcefulness_budget_innovation',
    'Resourcefulness, Material Exploration & Constraints Handled',
    'How did you navigate budget constraints, tight timelines, or technical challenges through creative design and material ingenuity?',
    'Explain clever material repurposing, custom detailing on a budget, or inventive solutions...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'design_disciplines_handled',
    'Design Disciplines Handled In-House for this Project',
    'Select all design phases managed directly by your studio.',
    NULL,
    'checkbox',
    TRUE,
    5,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'Architectural Concept & Form Design',
    'architecture',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'Interior Space Planning & Decoration',
    'interior_design',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'Bespoke Furniture & Product Prototyping',
    'furniture_design',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'Lighting Design & Fixture Customization',
    'lighting_design',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'Landscape & Courtyard Concept',
    'landscape_design',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000008'::uuid AND question_key = 'design_disciplines_handled' LIMIT 1),
    'On-Site Execution Supervision & Styling',
    'execution_styling',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'future_vision_statement',
    'Aspiration for Regional Design in Kutch & Gujarat',
    'What future contribution or architectural impact do you aspire to make in Kutch and Western India over the next decade?',
    'Share your vision for the future of regional design...',
    'textarea',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'cover_image',
    'Breakthrough Project Hero Photograph',
    'One standout photograph showcasing the design innovation of the nominated project.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'project_photo',
    'Project Photography & Detail Shots',
    'High-resolution images of completed spaces, innovative details, craftsmanship, and styling (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'floor_plan',
    'Design Drawings & Concept Sketches',
    'Floor plans, conceptual sketches, or section diagrams illustrating the spatial idea (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000008'::uuid,
    'portfolio_pdf',
    'Studio Portfolio & Project Profile (PDF)',
    'Optional profile showcasing your studio background, creative journey, and nominated project documentation (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #09: Best Compact Home (c2026000-0000-0000-0000-000000000009)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'total_carpet_area_sqft',
    'Exact Carpet Area of Compact Residence (Sq. Ft.)',
    'Enter the net usable carpet area (typically under 1,200 sq. ft. for compact home evaluation).',
    'e.g. 780',
    'number',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'compact_planning_concept',
    'Micro-Planning & Multi-Functional Space Concept',
    'Explain how every square foot was engineered for optimal efficiency, fluid circulation, and high liveability without feeling cramped.',
    'Detail the open-plan layout, elimination of dead corridors, and dual-purpose zones...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'transformable_furniture_storage',
    'Transformable Furniture & Clever Storage Strategies',
    'Describe multifunctional, fold-away, or custom concealed joinery used to preserve openness and provide generous storage.',
    'Describe fold-down tables, hidden wardrobes, under-bed storage, or modular dividers...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'visual_expansion_techniques',
    'Spatial Illusion & Visual Expansiveness Techniques',
    'Select all visual strategies employed to make the compact home feel significantly larger.',
    NULL,
    'checkbox',
    TRUE,
    4,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Continuous Seamless Flooring Across Entire Unit',
    'seamless_flooring',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Strategic Mirror Placement & Reflective Surfaces',
    'reflective_mirrors',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Sliding Pocket Doors & Flush Concealed Doors',
    'pocket_doors',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Monochromatic Light Color Palette with Textured Accents',
    'light_palette',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Floor-to-Ceiling Vertical Storage Accentuating Height',
    'vertical_storage',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000009'::uuid AND question_key = 'visual_expansion_techniques' LIMIT 1),
    'Unobstructed Sightlines from Entrance to Windows',
    'clear_sightlines',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'natural_light_ventilation',
    'Natural Daylighting & Airflow Optimization',
    'Describe how natural daylight penetration and cross-ventilation are maximized within the compact footprint.',
    'Explain window placement, sheer curtains, transom glass, or light wells...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'cost_efficiency_solutions',
    'Cost Efficiency & Durable Material Selections',
    'How were premium design aesthetics balanced with budget mindfulness and high-durability surfaces?',
    'Describe low-maintenance materials, laminates, engineered stones, and budget optimization...',
    'textarea',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'cover_image',
    'Compact Home Hero Photograph',
    'One high-resolution photograph capturing the primary living space demonstrating open spatial flow.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'project_photo',
    'Completed Compact Interior Photographs',
    'High-resolution images showing smart furniture, storage solutions, kitchen, bedroom, and multifunctional areas (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'floor_plan',
    'Detailed Dimensioned Furniture Layout',
    'Clear dimensioned layout plan showing furniture placement, storage depths, and circulation clearances (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000009'::uuid,
    'portfolio_pdf',
    'Compact Design Presentation (PDF)',
    'Optional design presentation illustrating custom storage details, axonometric diagrams, and material specs (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #10: Best Smart Home (c2026000-0000-0000-0000-000000000010)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'smart_ecosystem_protocol',
    'Primary Automation Protocol & System Architecture',
    'Select the primary automation backbone used in the residence.',
    NULL,
    'select',
    TRUE,
    1,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'smart_ecosystem_protocol' LIMIT 1),
    'KNX / DALI (Hardwired Professional International Standard)',
    'knx_dali',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'smart_ecosystem_protocol' LIMIT 1),
    'Control4 / Crestron System Ecosystem',
    'control4_crestron',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'smart_ecosystem_protocol' LIMIT 1),
    'Zigbee 3.0 / Z-Wave Professional Wireless Mesh',
    'zigbee_zwave',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'smart_ecosystem_protocol' LIMIT 1),
    'Matter / Apple HomeKit Unified IP Ecosystem',
    'matter_homekit',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'smart_ecosystem_protocol' LIMIT 1),
    'Hybrid Hardwired Bus & Secure Wireless Network',
    'hybrid_system',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'integrated_subsystems',
    'Integrated Smart Subsystems & Controls',
    'Select all home systems centrally coordinated through the smart platform.',
    NULL,
    'checkbox',
    TRUE,
    2,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Architectural Lighting Automation & Dimming (DALI / Phase Cut)',
    'lighting_control',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Climate & HVAC Automation with Zone Sensors',
    'hvac_control',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Motorized Curtains, Blinds & Architectural Louvers',
    'motorized_shading',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Multi-Room Audio & Distributed High-Res Video',
    'multiroom_av',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Integrated Smart Security, CCTV & Video Door Intercom',
    'security_surveillance',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Smart Water Tank Sensors & Automated Irrigation',
    'irrigation_water',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000010'::uuid AND question_key = 'integrated_subsystems' LIMIT 1),
    'Energy Monitoring, Solar Management & Load Balancing',
    'energy_monitoring',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'user_experience_interface',
    'User Interface, Controls & Multi-Generational Ease of Use',
    'Explain how the home is controlled (physical smart keypads, mobile app, touchscreens, voice) and how easily elderly residents or guests can operate it.',
    'Detail the balance between physical intuitive switches and digital apps...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'scene_automations_logic',
    'Custom Lifestyle Scenes & Predictive Automations',
    'Detail key programmed scenes (e.g., Morning Wakeup, Welcome Home, Movie Night, All-Off Night, Energy-Saving Away) and sensor-driven logic.',
    'Describe customized automations and scheduled routines...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'system_resilience_failsafe',
    'Network Security, Offline Resilience & Failsafes',
    'How does the system ensure local operation during internet outages, network security against intrusion, and physical manual overrides?',
    'Explain local hub processing, firewall protection, and manual switch overrides...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'video_walkthrough_url',
    'Smart Home Automation Video Demo Link',
    'Optional URL showcasing lighting scenes, app control, or motorized automation in live operation.',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'cover_image',
    'Smart Home Hero View',
    'One hero photograph capturing an integrated smart living space showing lighting scenes and wall keypad controls.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'project_photo',
    'Smart Features & Hardware Photographs',
    'Photographs of custom wall keypads, rack equipment, motorized curtains, lighting atmospheres, and user touchscreens (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'floor_plan',
    'Smart Automation Wiring & Device Placement Plan',
    'Schematic drawings showing device layouts, sensor placements, keypad locations, and distribution board positions (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000010'::uuid,
    'portfolio_pdf',
    'Smart Home Automation Dossier (PDF)',
    'Optional presentation detailing system architecture, scene specifications, user app screenshots, and hardware bills of quantities (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #11: Best Themed Project of the Year (c2026000-0000-0000-0000-000000000011)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'thematic_concept_title',
    'Central Theme Title & Conceptual Identity',
    'Provide a concise thematic title defining the design concept (e.g., "Kutchi Vernacular Courtyard Revival", "Jawai Earth Retreat", "Zen Wabi-Sabi Sanctuary").',
    'e.g. Kutchi Vernacular Courtyard Revival',
    'text',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'thematic_narrative_inspiration',
    'Thematic Narrative, Historical & Cultural Research',
    'Explain the cultural, historical, geographical, or artistic inspiration behind this themed project.',
    'Describe the cultural backstory, research, and design inspiration...',
    'textarea',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'thematic_craftsmanship_motifs',
    'Materialization of Theme through Artisanal Craftsmanship',
    'Detail how the chosen theme is articulated through customized architectural details, carvings, hand-painted murals, specialty plasters, and fabrics.',
    'Describe hand-carved stone, authentic woodwork, jali work, or painted finishes...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'authenticity_vs_modern_utility',
    'Balancing Thematic Authenticity with Modern Comfort',
    'How did you achieve genuine thematic immersion while ensuring contemporary ergonomic comfort, durability, and modern services?',
    'Explain how modern air conditioning, lighting, and plumbing are concealed without breaking character...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'custom_artisanal_collaborations',
    'Artisan Collaborations & Specialized Regional Crafts',
    'Select all traditional craftsmanship disciplines engaged for this thematic project.',
    NULL,
    'checkbox',
    FALSE,
    5,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Traditional Lippan Kaam (Mud & Mirror Relief Art)',
    'lippan_kaam',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Rogan Art / Ajrakh Block-Printed Soft Furnishings',
    'rogan_ajrakh',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Hand-Carved Local Yellow Sandstone Jalis & Columns',
    'hand_carved_stone',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Traditional Wood Carving & Hand-Turned Lacquered Pillars',
    'traditional_woodcarving',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Authentic Terracotta Potteries & Hand-Molded Tiles',
    'terracotta_craft',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000011'::uuid AND question_key = 'custom_artisanal_collaborations' LIMIT 1),
    'Hand-Beaten Wrought Iron & Brass Hardware Detailing',
    'metal_hardware',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'video_walkthrough_url',
    'Themed Project Walkthrough Link',
    'Optional video walkthrough showcasing the immersive atmosphere and artisanal details.',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'cover_image',
    'Themed Project Hero Photograph',
    'One high-resolution photograph capturing the quintessential thematic atmosphere and craftsmanship.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'project_photo',
    'Thematic Spaces & Craftsmanship Photography',
    'High-resolution images of themed rooms, artisanal details, custom motifs, and overall spatial composition (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'floor_plan',
    'Architectural Plans & Thematic Detail Drawings',
    'Dimensioned floor plans, elevation drawings, or artisan detail sheets illustrating theme execution (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000011'::uuid,
    'portfolio_pdf',
    'Theme Narrative & Moodbook (PDF)',
    'Optional concept booklet showcasing inspirational references, artisan workshop photos, and material samples (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #12: Luxury Villa Project of the Year (c2026000-0000-0000-0000-000000000012)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'villa_form_and_levels',
    'Villa Massing & Number of Levels',
    'Specify the volumetric form and vertical zoning of the villa.',
    NULL,
    'select',
    TRUE,
    1,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000012'::uuid AND question_key = 'villa_form_and_levels' LIMIT 1),
    'Single-Level Sprawling Pavilion Villa',
    'single_level_pavilion',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000012'::uuid AND question_key = 'villa_form_and_levels' LIMIT 1),
    'G+1 Two-Storey Contemporary Villa',
    'g_plus_1',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000012'::uuid AND question_key = 'villa_form_and_levels' LIMIT 1),
    'G+2 Multi-Level Villa with Private Elevator',
    'g_plus_2_elevator',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000012'::uuid AND question_key = 'villa_form_and_levels' LIMIT 1),
    'Split-Level Contoured Landscape Villa',
    'split_level',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'villa_built_up_area_sqft',
    'Total Built-up Area of Villa (Sq. Ft.)',
    'Enter the total constructed built-up area in square feet.',
    'e.g. 6500',
    'number',
    TRUE,
    2,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'architectural_form_envelope',
    'Architectural Expression, Façade & Volumetric Presence',
    'Detail the villa''s exterior architectural presence, cantilevered canopies, roofline articulation, and façade materiality.',
    'Describe the volumetric composition, geometry, deep verandahs, and materials...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'landscape_pool_living',
    'Landscape Architecture, Verandahs & Swimming Pool Integration',
    'Describe how the villa embraces outdoor living with landscaped gardens, otla verandahs, swimming pool deck, and shaded courtyards.',
    'Detail pool design, outdoor entertainment cabanas, pergolas, and landscape harmony...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'master_suite_sanctuary',
    'Master Suite Sanctuary & Private Living Quarters',
    'Detail the master wing planning, walk-in dressing suites, luxury ensuite spa bathrooms, and private open-to-sky courts or verandas.',
    'Describe the master bedroom wing, private lounge, and ensuite detailing...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'video_walkthrough_url',
    'Villa Video Tour / Drone Footage URL',
    'Optional URL to a high-definition video walkthrough or drone overview of the villa.',
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'cover_image',
    'Luxury Villa Signature Hero Photograph',
    'One high-resolution landscape photograph showcasing the definitive architectural view of the villa.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'project_photo',
    'Completed Villa Exterior & Interior Photography',
    'Comprehensive high-resolution images of villa façades, living spaces, master suites, pool pavilion, and gardens (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'floor_plan',
    'Villa Master Site Plan & Floor Plans',
    'Dimensioned floor plans, site plan, elevations, and sections showing landscape boundary and spatial flow (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000012'::uuid,
    'portfolio_pdf',
    'Villa Architectural Dossier (PDF)',
    'Optional complete presentation document including architectural concept, material specifications, and design drawings (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    4,
    TRUE
)
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
-- CATEGORY #13: Best Contractor of the Year (c2026000-0000-0000-0000-000000000013)
-- ------------------------------------------------------------------------------

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'contractor_business_profile',
    'Contracting Firm Profile & Operating Background in Kutch',
    'Overview of your contracting enterprise, years of operation in Kutch/Gujarat, core staff size, and key commercial/residential capabilities.',
    'Summarize your contracting firm background, team capabilities, and regional footprint...',
    'textarea',
    TRUE,
    1,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'turnkey_scope_of_work',
    'Execution Scopes Executed for Nominated Project',
    'Select all technical and construction packages executed by your firm for this nominated project.',
    NULL,
    'checkbox',
    TRUE,
    2,
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

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'Civil & Structural RCC / Masonry Framework',
    'civil_structural',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'Full Turnkey Execution (Civil + Finishing + MEP)',
    'full_turnkey',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'High-Precision Interior Fitout, Carpentry & Millwork',
    'interior_fitout',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'Advanced Structural Waterproofing & Protective Treatments',
    'waterproofing',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'MEP Infrastructure (Plumbing, Electrical, HVAC, Fire Safety)',
    'mep_infrastructure',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = 'c2026000-0000-0000-0000-000000000013'::uuid AND question_key = 'turnkey_scope_of_work' LIMIT 1),
    'Specialized Stone Masonry, Cladding & Exterior Paving',
    'stone_cladding',
    1,
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'quality_control_workmanship',
    'Quality Control Standards, Material Testing & Workmanship',
    'Detail your on-site quality assurance processes (concrete cube testing, compaction, line & level checking, raw material verification, mock-ups).',
    'Describe your testing protocols, tolerance standards, and how workmanship precision was verified...',
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'coordination_with_architects',
    'Coordination with Architects, Structural Engineers & Clients',
    'Explain how your team translated architectural drawings into physical reality, coordinated structural consultants, managed RFI processes, and resolved detail clashes.',
    'Describe coordination meetings, drawing reviews, and alignment with the design vision...',
    'textarea',
    TRUE,
    4,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'project_delivery_schedule_management',
    'Schedule Management, Milestone Tracking & Material Logistics',
    'Detail how you managed project schedules, labor deployment, supply chain logistics across Kutch, and timely handover.',
    'Explain project scheduling tools, procurement planning, and milestone adherence...',
    'textarea',
    TRUE,
    5,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'site_challenges_problem_solving',
    'Difficult Site Conditions & Technical Problem Solving',
    'Describe a significant technical, geotechnical, weather, or structural challenge encountered on this project and the exact engineering solution executed.',
    'Detail a specific challenge (e.g. soil condition, seismic detailing, material scarcity) and your solution...',
    'textarea',
    TRUE,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'safety_sustainability_practices',
    'Site Safety Protocols, Labor Welfare & Waste Management',
    'Detail your on-site safety standards, PPE compliance, worker welfare, and responsible construction debris recycling/disposal.',
    'Describe safety measures, labor amenities, zero-accident record, and debris handling...',
    'textarea',
    TRUE,
    7,
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

INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'total_project_construction_value',
    'Approximate Contract / Construction Value (Lakhs INR)',
    'Optional: State the approximate construction contract value handled in Lakhs INR.',
    'e.g. 150',
    'number',
    FALSE,
    8,
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'cover_image',
    'Contractor Nominated Project Hero View',
    'One signature high-resolution photograph showcasing the completed project demonstrating construction excellence.',
    TRUE,
    1,
    1,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    1,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'project_photo',
    'Execution Quality & Completed Site Photography',
    'High-resolution photographs illustrating structural precision, finish quality, masonry, joinery, and completed project handover (Minimum 3 photographs).',
    TRUE,
    3,
    10,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    2,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'floor_plan',
    'As-Built Drawings / Key Structural Plans',
    'Key architectural or structural drawings illustrating project scale and complexity of execution (PDF or Image).',
    TRUE,
    1,
    5,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    3,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'supporting_doc',
    'Completion Certificate / Architect Recommendation / Work Order',
    'Official proof of project completion such as an architect handover sign-off, client commendation letter, or formal completion certificate (PDF or Image).',
    TRUE,
    1,
    3,
    15,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    4,
    TRUE
)
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

INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    'c2026000-0000-0000-0000-000000000013'::uuid,
    'portfolio_pdf',
    'Contractor Company Profile & Project Dossier (PDF)',
    'Optional company brochure detailing past completed projects, plant & machinery capabilities, and client references (Max 15MB).',
    FALSE,
    0,
    1,
    15,
    ARRAY['application/pdf'],
    5,
    TRUE
)
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

COMMIT;
