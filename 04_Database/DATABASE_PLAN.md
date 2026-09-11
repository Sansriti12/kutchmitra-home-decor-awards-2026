# Database Architecture & Schema Design
## Kutchmitra Home & Decor Awards 2026

**Document Version:** 1.0  
**Target Engine:** PostgreSQL 14+ / Supabase PostgreSQL Compatible  
**Reference Document:** Kutchmitra Home & Decor Awards 2026 BRD + Admin Functional Requirements  
**Scope:** Data modeling, entity relationships, integrity constraints, indexing, workflow state machines, and RLS security preparation. *(No authentication, application code, or backend migrations are executed in this step).*

---

## 1. Database Objectives

The Kutchmitra Home & Decor Awards database is architected as a **normalized, multi-edition, highly configurable award management relational system**.

### Key Architectural Pillars:
1. **Multi-Edition Reusability:** The 2026 edition is the first configuration. The system supports future editions (2027, 2028, etc.) within the same database schema without structural refactoring.
2. **Configurable Everything:** Categories, questionnaire form fields, upload constraints, and scoring criteria are modeled as dynamic configuration data rather than hard-coded tables or enum columns.
3. **Vendor Independence:** Standard PostgreSQL DDL and relational design principles are prioritized. While fully compatible with Supabase services (Auth, RLS, Storage), business logic and schemas remain portable to standard self-hosted PostgreSQL or cloud providers (AWS RDS, GCP Cloud SQL, Azure Database for PostgreSQL).
4. **Strict Confidentiality & Integrity:** Separation between applicant profile data, internal verification audit logs, and confidential jury scores/comments.
5. **Zero Invented Assumptions:** Dates for the 2026 edition are stored as nullable (`NULL` / `TBD`) until officially ratified by the organizing committee.

---

## 2. PostgreSQL Architecture

- **Primary Identifiers:** Universally Unique Identifiers (`UUIDv4` generated via `gen_random_uuid()`) are used across all primary entities to avoid sequential enumeration vulnerabilities and support seamless distributed synchronization.
- **Data Types:**
  - `TIMESTAMPTZ` for all temporal timestamps to ensure timezone safety across Indian Standard Time (IST) and international accesses.
  - `VARCHAR` with length limits and explicit `CHECK` constraints for enumerated states instead of rigid PostgreSQL `ENUM` types, ensuring non-destructive additions to workflow states.
  - `JSONB` reserved strictly for semi-structured validation rules and CMS payloads where schema flexibility is advantageous, while relational integrity is maintained for all core relationships.
  - `NUMERIC(p, s)` for areas, weights, and scoring calculations to eliminate floating-point rounding errors.

---

## 3. Complete Entity & Table Directory

The database comprises **21 normalized tables** organized into 8 functional domains:

| # | Domain | Table Name | Purpose |
| :--- | :--- | :--- | :--- |
| 1 | **Core** | `award_editions` | Annual award cycles (e.g. 2026) and timeline dates. |
| 2 | **Identity & Access** | `roles` | System roles (Applicant, Verification, Jury, Admin, Super Admin). |
| 3 | **Identity & Access** | `users` | Central user directory mapped to Auth IDs. |
| 4 | **Identity & Access** | `user_roles` | Many-to-many role assignments with optional edition scope. |
| 5 | **Profiles** | `applicant_profiles` | Organization, contact, city, state, and consent acceptance. |
| 6 | **Profiles** | `jury_profiles` | Juror credentials, bio, photo, and committee visibility flag. |
| 7 | **Configuration** | `categories` | Configurable award categories per edition (12 approved for 2026). |
| 8 | **Configuration** | `category_questions` | Dynamic custom form questions per category. |
| 9 | **Configuration** | `question_options` | Select/radio/checkbox options for dynamic questions. |
| 10 | **Configuration** | `category_upload_requirements` | Media & PDF specifications (MIME, max count, file size) per category. |
| 11 | **Workflow** | `application_statuses` | Configurable nomination statuses. |
| 12 | **Workflow** | `status_transitions` | Role-enforced state machine transition matrix. |
| 13 | **Nominations** | `applications` | Core nomination records with unique human-readable nomination IDs. |
| 14 | **Nominations** | `application_status_history` | Chronological audit trail of all nomination state changes. |
| 15 | **Nominations** | `application_answers` | Relational answers to dynamic questions (text, numeric, JSONB). |
| 16 | **Media** | `application_files` | Metadata for photos, plans, 3D renderings, and PDFs. |
| 17 | **Verification** | `verification_records` | Verification determinations with confidential internal notes. |
| 18 | **Verification** | `clarification_requests` | Formal clarification cycles between verification team and applicant. |
| 19 | **Jury & Scoring** | `jury_category_assignments` | Juror category-level review assignments. |
| 20 | **Jury & Scoring** | `jury_assignments` | Juror entry-level assignments with conflict-of-interest tracking. |
| 21 | **Jury & Scoring** | `scoring_criteria` | Configurable scoring criteria and weights per edition/category. |
| 22 | **Jury & Scoring** | `jury_evaluations` | Juror evaluation submission header (draft/locked). |
| 23 | **Jury & Scoring** | `jury_scores` | Granular numeric score and confidential comment per criterion. |
| 24 | **Shortlists & Honorees** | `application_shortlists` | Shortlisting decisions and administrative notes. |
| 25 | **Shortlists & Honorees** | `winners` | Official winners showcase with publication gating. |
| 26 | **Audit & Alerts** | `notifications` | Dispatch log for email, SMS, and in-app communications. |
| 27 | **Audit & Alerts** | `audit_logs` | Immutable audit log of administrative and sensitive actions. |
| 28 | **CMS** | `cms_content_blocks` | Structured JSONB content for editable website copy & notices. |

---

## 4. Table-by-Table Architectural Specification

### 4.1. Core Editions & Identity
- **`award_editions`**: Root container for all operational data. Includes nullable milestone dates (`nomination_start_at`, `nomination_end_at`, `ceremony_date`) so provisional 2026 TBD status does not break schema integrity.
- **`roles`**: Fixed master reference of 5 security roles: `applicant`, `verification_team`, `jury_member`, `admin`, `super_admin`.
- **`users`**: Central account directory. Avoids duplicating password hashes by mapping `id` to the authenticated subject ID (e.g. Supabase Auth `auth.users.id`).
- **`user_roles`**: Links users to roles. Allows a user to hold different roles across different editions or simultaneous administrative roles.
- **`applicant_profiles`**: Captures firm details, address, city, state, portfolio links, and timestamps for terms/privacy acceptance.
- **`jury_profiles`**: Captures professional honorifics, titles, biographies, and headshot URLs. Includes `is_public` boolean to prevent unratified juror exposure on the public website.

### 4.2. Configurable Categories & Dynamic Questionnaire
- **`categories`**: Stores award disciplines per edition. Enforces `UNIQUE(edition_id, slug)` and `UNIQUE(edition_id, code)`. Admin can reorder, activate, deactivate, or add categories dynamically.
- **`category_questions`**: Questions required for a nomination in a given category. Defines input types (`text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`, `url`), required flags, placeholders, and validation parameters.
- **`question_options`**: Pre-defined choices for selection questions, ordered by `display_order`.
- **`category_upload_requirements`**: Defines upload rules per category (e.g. minimum 5 project photos, maximum 15MB, allowed MIME types `image/jpeg`, `application/pdf`).

### 4.3. Nominations & Flexible Storage
- **`applications`**: The central entry entity. Foreign keyed to `applicant_id`, `edition_id`, and `category_id`. Generates a globally unique human-readable `nomination_id` (e.g. `KHA26-01-0001`). Holds core metadata (project name, city, state, area, completion date, current step, locked flag).
- **`application_answers`**: Solves the schema-evolution problem for dynamic forms without adding columns to `applications`. Stores values as:
  - `answer_text` (general values, descriptions)
  - `answer_number` (indexed numeric values for ranges)
  - `answer_json` (multi-select checkbox arrays)
- **`application_files`**: Stores metadata for all uploaded assets. Binary files reside in S3-compatible or Supabase object storage; this table indexes file size, storage bucket path, MIME type, cover image flags, and verification check status.

### 4.4. Verification & State Machine
- **`application_statuses`**: Master list of approved workflow states.
- **`status_transitions`**: Governs allowable moves (e.g., only `verification_team` or `admin` can transition an entry from `under_verification` to `eligible`).
- **`verification_records`**: Captures eligibility decisions and confidential internal notes.
- **`clarification_requests`**: Structured communication channel when a submission requires missing details. Separates public applicant guidance from internal verification notes.

### 4.5. Jury Evaluation & Confidential Scoring
- **`jury_assignments`**: Assigns specific entries to specific jurors. Guarantees that jurors only see entries explicitly delegated to them. Includes conflict-of-interest declarations (`conflict_declared`).
- **`scoring_criteria`**: Configurable weighted evaluation matrix (e.g. Design Excellence 25%, Creativity 20%, etc.). Weights and criteria can be global to an edition or customized per category.
- **`jury_evaluations`**: Evaluation header recording overall status (`draft` vs `submitted`), total weighted score, and confidential remarks. Final submission flips `is_locked = TRUE`.
- **`jury_scores`**: Records criterion-by-criterion scores (`score >= 0` and `<= max_score`) and confidential notes.

### 4.6. Shortlists, Winners & Public Showcases
- **`application_shortlists`**: Explicit shortlisting stage decided by committee administrators after reviewing jury scoring aggregates.
- **`winners`**: Distinct showcase table for official winners and commended entries. Protected by `is_published = FALSE` by default to prevent accidental public disclosure before the official ceremony.

### 4.7. Operational Infrastructure
- **`notifications`**: Dispatch queue and audit log tracking transactional notifications (registration, submission acknowledgement, clarification requests).
- **`audit_logs`**: Append-only tamper-evident ledger recording all state transitions, role modifications, score submissions, and publication actions with actor IDs and change diffs (`old_values`, `new_values`).
- **`cms_content_blocks`**: Lightweight key-value JSONB storage for editable announcements, timeline notices, and FAQ copy.

---

## 5. Entity Relationships (ER Architecture)

```
[award_editions]
       │
       ├──< [categories] ───────────┬──< [category_questions] ──< [question_options]
       │         │                  └──< [category_upload_requirements]
       │         │
       │         ├──< [applications] ──┬──< [application_answers]
       │         │          │         ├──< [application_files]
       │         │          │         ├──< [application_status_history]
       │         │          │         ├──< [verification_records]
       │         │          │         ├──< [clarification_requests]
       │         │          │         ├──< [jury_assignments] ──< [jury_evaluations] ──< [jury_scores]
       │         │          │         ├──< [application_shortlists]
       │         │          │         └──< [winners]
       │         │
       │         ├──< [scoring_criteria]
       │         ├──< [jury_profiles]
       │         └──< [cms_content_blocks]
       │
[users] ───────┬──< [user_roles]
               ├──< [applicant_profiles]
               ├──< [jury_profiles]
               ├──< [applications] (as applicant)
               └──< [audit_logs] (as actor)
```

---

## 6. Key Constraints & Data Integrity

1. **Edition Isolation & Composite Foreign Keys:**
   - Slugs and category codes are unique within an edition:
     - `UNIQUE(edition_id, slug)`
     - `UNIQUE(edition_id, code)`
   - Cross-edition reference prevention via composite foreign keys:
     - `categories`: `UNIQUE(id, edition_id)`
     - `applications`: `FOREIGN KEY (category_id, edition_id) REFERENCES categories(id, edition_id) ON DELETE RESTRICT`
     - `applications`: `UNIQUE(id, edition_id)` and `UNIQUE(id, edition_id, category_id)`
     - `jury_profiles`: `UNIQUE(id, edition_id)`
     - `jury_assignments`: `FOREIGN KEY (jury_profile_id, edition_id) REFERENCES jury_profiles(id, edition_id) ON DELETE CASCADE`
     - `jury_assignments`: `FOREIGN KEY (application_id, edition_id) REFERENCES applications(id, edition_id) ON DELETE CASCADE`
     - `scoring_criteria`: `FOREIGN KEY (category_id, edition_id) REFERENCES categories(id, edition_id) ON DELETE CASCADE`
     - `application_shortlists`: `FOREIGN KEY (application_id, edition_id, category_id) REFERENCES applications(id, edition_id, category_id) ON DELETE CASCADE`
     - `winners`: `FOREIGN KEY (application_id, edition_id, category_id) REFERENCES applications(id, edition_id, category_id) ON DELETE RESTRICT`
2. **Duplicate Application Protection:**
   - `nomination_id` on `applications` is globally unique across the entire database.
   - Accidental duplicate project submission in the same category is prevented:
     - `UNIQUE(applicant_id, edition_id, category_id, project_name)`
3. **Draft & Submission Immutability:**
   - Once submitted (`status != 'draft'` and `is_locked = TRUE`), applicant-level writes are blocked. Admin must explicitly record a reopen reason to unlock an application.
4. **Confidential Evaluation Integrity:**
   - A juror can evaluate an assigned application exactly once per assignment: `UNIQUE(jury_assignment_id)`.
   - A criterion can be scored only once per evaluation: `UNIQUE(evaluation_id, criterion_id)`.
   - Score values are constrained between 0 and `max_score`: `CHECK (score >= 0)`.
5. **Partial Unique Indexes for Scoped Uniqueness:**
   - `user_roles`: Surrogate PK `id UUID`. Uniqueness enforced via partial unique indexes:
     - `uq_user_roles_edition`: `UNIQUE(user_id, role_id, edition_id) WHERE edition_id IS NOT NULL` (edition-specific role)
     - `uq_user_roles_global`: `UNIQUE(user_id, role_id) WHERE edition_id IS NULL` (global role)
   - `scoring_criteria`: Surrogate PK `id UUID`. Uniqueness enforced via partial unique indexes:
     - `uq_scoring_criteria_category`: `UNIQUE(edition_id, category_id, code) WHERE category_id IS NOT NULL`
     - `uq_scoring_criteria_edition_default`: `UNIQUE(edition_id, code) WHERE category_id IS NULL`
6. **Winner Gating & Non-Duplication:**
   - An application can be awarded at most one title in an edition: `UNIQUE(application_id)`.
   - Category primary winner uniqueness enforced via partial index:
     - `CREATE UNIQUE INDEX uq_category_primary_winner ON winners(category_id) WHERE award_title = 'Winner';`
     - Allows multiple "Special Commendation" honorees while guaranteeing only one primary "Winner" per category.
   - Public queries strictly enforce `is_published = TRUE`.

---

## 7. Indexing Strategy

Targeted B-Tree and partial indexes are designed for primary operational queries:

- **Nomination Lookups:**
  - `idx_applications_applicant` on `(applicant_id)`: Instant retrieval of applicant dashboard items.
  - `idx_applications_edition_category` on `(edition_id, category_id)`: Filter nominations by category.
  - `idx_applications_status` on `(status)`: Pipeline queue processing (e.g. pending verification).
  - `idx_applications_city_state` on `(project_city, project_state)`: Geographic distribution reporting.
  - `idx_applications_submitted_at` on `(submitted_at)` WHERE `submitted_at IS NOT NULL`: Chronological submission sorting.
- **Dynamic Form Execution:**
  - `idx_answers_application` on `(application_id)`: Hydrates full nomination form answers in a single indexed scan.
  - `idx_files_application` on `(application_id)`: Fetches project dossier files.
- **Jury & Verification Workflows:**
  - `idx_jury_assignments_juror` on `(jury_profile_id, status)`: Juror dashboard view.
  - `idx_clarifications_app_status` on `(application_id, status)`: Fast detection of pending clarification requests.
- **Audit & Security:**
  - `idx_audit_created` on `(created_at DESC)`: Chronological administrative audit logs.

---

## 8. Row Level Security (RLS) Policy Specifications

When RLS is enabled in the production database, the following policy boundaries will be enforced:

1. **Applicant Role:**
   - `SELECT`, `UPDATE` on `applicant_profiles` WHERE `user_id = auth.uid()`.
   - `SELECT`, `INSERT`, `UPDATE` on `applications` WHERE `applicant_id = auth.uid()` AND (`is_locked = FALSE` OR operation is `SELECT`).
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `application_answers` and `application_files` WHERE application belongs to `auth.uid()` and is unlocked.
   - `SELECT` on `clarification_requests` WHERE application belongs to `auth.uid()`; `UPDATE` allowed on `response_text` and `responded_at`.
2. **Verification Team Role:**
   - `SELECT` on all submitted applications, answers, and files.
   - `INSERT`, `UPDATE` on `verification_records` and `clarification_requests`.
   - `UPDATE` on `applications.status` governed by `status_transitions`.
3. **Jury Member Role:**
   - `SELECT` on `applications`, `application_answers`, and `application_files` strictly WHERE application ID exists in `jury_assignments` WHERE `jury_profile_id = auth.juror_id()` AND `conflict_declared = FALSE`.
   - `SELECT`, `INSERT`, `UPDATE` on `jury_evaluations` and `jury_scores` strictly WHERE assignment belongs to `auth.juror_id()`.
   - **Zero Cross-Juror Visibility:** Jurors cannot select or view other jurors' evaluation records or scores.
4. **Admin / Super Admin Roles:**
   - Full operational read/write access across applications, categories, jury assignments, shortlisting, and CMS blocks.
5. **Public Visitor (Anon):**
   - `SELECT` on `categories` WHERE `is_active = TRUE`.
   - `SELECT` on `jury_profiles` WHERE `is_public = TRUE`.
   - `SELECT` on `winners` WHERE `is_published = TRUE`.
   - `SELECT` on `cms_content_blocks` WHERE `is_published = TRUE`.
   - All other tables deny public access.

---

## 9. Future Editions Lifecycle (2027+)

To spin up the 2027 edition:
1. Insert a new record into `award_editions` (`year = 2027`, `slug = '2027'`).
2. An administrative cloning function duplicates category definitions, question templates, upload requirements, and scoring criteria from 2026 into 2027 with new foreign keys.
3. Existing 2026 applications, answers, jury evaluations, and winners remain completely unchanged and queryable for historical records.
4. No database schema alterations or application downtime is required.

---

## 10. Reporting Architecture

The schema enables efficient relational reporting across key administrative KPIs:
- **Total Registrations:** `SELECT COUNT(*) FROM applicant_profiles;`
- **Total Nominations by Status:** `SELECT status, COUNT(*) FROM applications WHERE edition_id = $1 GROUP BY status;`
- **Category Breakdown:** `SELECT c.name, COUNT(a.id) FROM categories c LEFT JOIN applications a ON c.id = a.category_id GROUP BY c.name;`
- **Geographic Breakdown:** `SELECT project_state, project_city, COUNT(*) FROM applications GROUP BY project_state, project_city;`
- **Jury Scoring Progress:** `SELECT j.full_name, COUNT(ja.id) as assigned, COUNT(je.id) FILTER (WHERE je.status = 'submitted') as completed FROM jury_profiles jp JOIN users j ON jp.user_id = j.id JOIN jury_assignments ja ON ja.jury_profile_id = jp.id LEFT JOIN jury_evaluations je ON je.jury_assignment_id = ja.id GROUP BY j.full_name;`

---

## 11. Open Questions / Client Confirmation Required

The following operational and policy decisions cannot be finalized until confirmed by the organizing committee:

1. **Nomination ID Format:** What specific prefix and numbering sequence is preferred? (e.g. `KHA26-CAT-XXXX` vs `KHD2026-XXXX`).
2. **Multiple Nominations Policy:** Can a single applicant or firm submit multiple projects in the same award category, or is each firm restricted to one entry per category?
3. **Nomination Fees:** Will any category require a fee or deposit? (The schema currently models standard zero-fee submission; fee/payment gateway tables can be attached if a paid tier is ratified).
4. **Final Scoring Criteria & Weights:** Will the organizing committee ratify the recommended 5-criterion framework (Design Excellence 25%, Creativity 20%, Functionality 20%, Sustainability 15%, Overall Impact 20%), or will different disciplines require specialized criteria?
5. **Exact File Size & Count Limits:** What are the maximum file sizes (e.g. 15MB vs 25MB) and photo counts per category?
6. **Clarification Window:** What is the allowed response timeframe for an applicant once a clarification request is issued (e.g. 3 business days vs 5 business days)?
7. **Jury Public Announcement:** At what date will the organizing committee approve public disclosure of jury member profiles on the public website?

---

## 12. Step 7A Schema Review & Corrections

During the Step 7A technical review, all SQL definitions in `04_Database/schema.sql` and `04_Database/seed_reference_data.sql` were inspected against strict relational integrity, cross-edition consistency, and business constraints.

### 12.1. Issues Identified & Corrections Implemented

1. **Cross-Edition Inconsistency Vulnerability (Resolved via Composite Foreign Keys):**
   - *Issue:* With only single-column foreign keys (`applications.category_id REFERENCES categories(id)` and `applications.edition_id REFERENCES award_editions(id)`), the database engine could theoretically permit an application belonging to the 2027 edition to reference a category belonging to the 2026 edition.
   - *Correction:*
     - Added `UNIQUE(id, edition_id)` on `categories`.
     - Replaced single foreign key in `applications` with composite constraint:
       `FOREIGN KEY (category_id, edition_id) REFERENCES categories(id, edition_id) ON DELETE RESTRICT`.
     - Applied the same composite pattern across `jury_assignments`:
       `FOREIGN KEY (jury_profile_id, edition_id) REFERENCES jury_profiles(id, edition_id) ON DELETE CASCADE`
       `FOREIGN KEY (application_id, edition_id) REFERENCES applications(id, edition_id) ON DELETE CASCADE`.
     - Added composite foreign keys on `scoring_criteria`, `application_shortlists`, and `winners`, ensuring mathematical impossibility of mismatched edition/category references.

2. **Scoring Reference Seed Data Removal (Resolved):**
   - *Issue:* Initial seed script populated the 5 recommended criteria (Design Excellence 25%, etc.). These were non-binding recommendations from the BRD, not client-ratified production configurations.
   - *Correction:* Completely removed criteria insertion from `04_Database/seed_reference_data.sql`. The configurable schema remains in place; records will be populated through the Admin Panel once officially approved.

3. **Accidental Duplicate Project Submissions (Resolved):**
   - *Issue:* An applicant clicking submit repeatedly or initiating multiple duplicate entries for the exact same project name in the same category could pollute the database.
   - *Correction:* Added `CONSTRAINT uq_applicant_project_category UNIQUE(applicant_id, edition_id, category_id, project_name)` on `applications`.

4. **Winner Duplication & Commendation Flexibility (Resolved):**
   - *Issue:* An entry could theoretically have been inserted into `winners` multiple times. Furthermore, a strict `UNIQUE(category_id, award_title)` would forbid having two "Special Commendation" honorees in the same category.
   - *Correction:*
     - Added `CONSTRAINT uq_winner_application UNIQUE(application_id)` to ensure one entry cannot be duplicated.
     - Added partial unique index `CREATE UNIQUE INDEX uq_category_primary_winner ON winners(category_id) WHERE award_title = 'Winner';` ensuring exactly one primary Winner while allowing multiple commendations.

5. **Historical Immutability & Archiving Explicit Clarification:**
   - *Important Principle:* The database schema utilizes `ON DELETE RESTRICT` on editions, categories, and submitted applications to prevent cascading deletions.
   - *Explicit Declaration:* **Historical immutability will be enforced through application authorization/RLS/admin controls in the implementation phase.** The database schema establishes the structural foundation, audit trails, and locked flags (`is_locked`), while immutable lifecycle guarantees are enforced via service-layer security rules.

---

## 13. Step 7B Workflow Architecture Verification

A final consistency audit of the workflow engine was conducted across `schema.sql`, `seed_reference_data.sql`, and this plan:

1. **Configurable Status Model:**
   - The `applications` table does **NOT** use a rigid PostgreSQL `ENUM` (e.g. `CREATE TYPE application_status_enum`).
   - Instead, `applications.status` uses `VARCHAR(30) NOT NULL DEFAULT 'draft' REFERENCES application_statuses(code)`.
   - The architecture implements the preferred dynamic chain:
     ```
     application_statuses (master status definitions & terminal flags)
             ↓
     status_transitions (role-permitted transition matrix)
             ↓
     applications (foreign-keyed current status + status history audit)
     ```
2. **Supported Statuses:**
   All 10 core status concepts are seeded and fully active in `04_Database/seed_reference_data.sql`:
   - `draft` (Draft)
   - `submitted` (Submitted)
   - `under_verification` (Under Verification / Under Review)
   - `clarification_required` (Clarification Required)
   - `eligible` (Eligible)
   - `jury_review` (Jury Review)
   - `shortlisted` (Shortlisted)
   - `winner` (Winner)
   - `rejected` (Rejected)
   - `disqualified` (Disqualified)
3. **Multi-Edition Workflow Reusability:**
   New statuses or edition-specific workflow transitions can be added dynamically via SQL `INSERT` or the Super Admin console without altering column types or locking production tables.


