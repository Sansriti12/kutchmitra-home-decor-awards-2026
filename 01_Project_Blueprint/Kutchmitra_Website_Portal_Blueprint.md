# Kutchmitra Home & Decor Awards 2026
## Website, Nomination Portal, Admin & Jury — Structure and Implementation Blueprint

**Purpose:** Client-facing structure and implementation understanding  
**Reference:** Kutchmitra Home & Decor Awards 2026 BRD + Admin Functional Requirements  
**Important:** This is a functional/UX blueprint, not a final technical specification.

---

## 1. Project Purpose

The Kutchmitra Home & Decor Awards 2026 platform will be a premium public-facing awards website combined with a complete digital nomination and award-management system.

It will bring together:

- Public award information
- Award categories and eligibility
- Applicant registration and login
- Multi-step nomination submission
- Secure image/document uploads
- Applicant dashboard
- Admin verification and application management
- Jury assignment and confidential scoring
- Shortlisting and winner management
- Public winner profiles
- Reports, notifications, CMS and audit logs

The system should be built as a reusable award-management platform so future award editions can be configured without rebuilding the core application.

---

## 2. Confirmed Project Direction

### Platform
Responsive web platform for desktop, tablet and mobile.

### Primary users
- Public Visitor
- Applicant / Nominee
- Verification Team
- Admin
- Super Admin
- Jury Member

### Design direction
Premium, editorial, architectural and aspirational.

Suggested visual language:
- Navy / deep blue
- Gold accents
- White / warm neutral backgrounds
- Modern sans-serif typography
- Architecture, interiors, homes and design imagery
- Strong “Nominate Now” calls to action
- Clean mobile-first forms

The visual identity must be original to Kutchmitra and must not copy the reference site's branding or content.

---

## 3. Platform Structure

The project will be treated as one web application with role-based sections:

PUBLIC WEBSITE
→ Award discovery, categories, jury, dates, FAQs, winners and contact

APPLICANT PORTAL
→ Registration, profile, nominations, drafts, uploads, submission and status

ADMIN PANEL
→ Dashboard, applications, verification, categories, jury, scoring, shortlist, winners, CMS, reports, users and audit log

JURY PORTAL
→ Assigned entries, entry details, scoring criteria, comments and final evaluation

---

## 4. Final Sitemap

### Public
- Home
- About the Awards
- Award Categories
- Category Detail
- Eligibility & How to Nominate
- Jury
- Important Dates
- FAQs
- Winners
- Contact
- Register
- Login

### Applicant
- Dashboard
- My Profile
- My Nominations
- Create Nomination
- Continue Draft
- View Submission
- Notifications

### Admin
- Dashboard
- Applications
- Verification
- Status Management
- Categories
- Questions
- Upload Rules
- Scoring Criteria
- Jury Management
- Shortlisting
- Winners
- CMS
- Reports
- Users & Roles
- Audit Log

### Jury
- Jury Dashboard
- Assigned Entries
- Entry Details
- Evaluation
- Submitted Evaluations

---

## 5. Homepage — Complete Structure

### 5.1 Hero
- Kutchmitra Home & Decor Awards 2026 identity
- Short award positioning statement
- Strong architectural/interior visual
- Primary CTA: Nominate Now
- Secondary CTA: Explore Categories
- Important dates where approved
- Premium editorial treatment

### 5.2 Award Introduction
Short explanation of the awards and what they celebrate.

### 5.3 Categories Preview
Show selected/highlighted categories with:
- Category name
- Short description
- View Details
- Nominate Now

### 5.4 Why Nominate
Potential approved benefits:
- Recognition
- Credibility
- Visibility
- Industry exposure
- Networking
- Winner recognition

Final wording must be approved.

### 5.5 How It Works
Simple visual journey:
Discover → Register → Nominate → Verification → Jury Evaluation → Shortlist → Winner

### 5.6 Important Dates
- Nominations open
- Nominations close
- Verification period
- Jury evaluation
- Shortlisting
- Awards / winner announcement

Dates must remain CMS-configurable.

### 5.7 Jury Preview
Selected jury profiles with link to full Jury page.

### 5.8 Winners Preview
Shown after winners are officially published.

### 5.9 Final CTA
Strong “Nominate Now” section.

### 5.10 Footer
- Navigation
- Contact
- Terms
- Privacy
- Social links if approved
- Copyright

---

## 6. Award Categories

Initial categories from the BRD:

1. Architect of the Year
2. Best Luxury Residence
3. Best Apartment Design
4. Best Renovation Project
5. Best Sustainable Home
6. Ultra-Luxury Residential Project of the Year
7. Interior Designer of the Year
8. Emerging Designer
9. Best Compact Home
10. Best Smart Home
11. Best Themed Project of the Year
12. Luxury Villa Project of the Year

Categories must NOT be hard-coded.

Admin must be able to:
- Add category
- Edit category
- Activate/deactivate
- Reorder
- Add description
- Configure eligibility
- Configure questions
- Configure upload requirements
- Configure scoring criteria

---

## 7. Applicant Journey

PUBLIC WEBSITE
→ Nominate Now
→ Register / Login
→ Applicant Dashboard
→ Select Category
→ Start Nomination

### Seven-step nomination wizard

1. Applicant Profile
2. Select Category
3. Project / Professional Details
4. Design / Project Questionnaire
5. Upload
6. Preview
7. Declaration & Submit

Required behaviour:
- Progress indicator
- Field validation
- Save as draft
- Continue later
- Upload progress
- Preview before submission
- Final declaration
- Unique nomination ID
- Confirmation / acknowledgement

After submission, the application becomes read-only unless an authorized admin reopens it.

---

## 8. Applicant Dashboard

The applicant should be able to see:

- Profile
- My Nominations
- Draft nominations
- Submitted nominations
- Nomination ID
- Current status
- Continue draft
- View submission
- Notifications

Example status flow:

Draft
→ Submitted
→ Under Verification
→ Eligible
→ Jury Review
→ Shortlisted
→ Winner

Other possible states:
- Clarification Required
- Rejected / Disqualified

---

## 9. Secure Upload System

Applicants may upload:

- Cover image
- Project photos
- Interior/exterior photos
- Floor plans/drawings
- 3D views/renderings
- Portfolio/brochure
- Supporting documents

The system should support:
- File type validation
- Size/count limits configured by category
- Upload progress
- Thumbnail/preview
- Remove/replace before submission
- Secure storage
- Server-side MIME validation
- Private access for restricted documents

Database stores file metadata; actual files are stored in object/file storage.

---

## 10. Admin Panel

### Dashboard
KPIs:
- Total registrations
- Total nominations
- Drafts
- Submitted
- Pending verification
- Eligible
- Jury review pending
- Shortlisted
- Winners
- Category-wise counts
- City/state-wise counts

### Applications
- Search
- Filter
- Sort
- View
- Manage
- Status changes
- Notes
- Clarification requests

### Verification
- Eligible
- Ineligible/rejected
- Clarification required
- Internal notes
- Status history

### Category Management
Admin controls the award configuration without code.

### Jury Management
- Create jury members
- Manage jury profiles
- Assign entries/categories
- Track evaluation status

### Scoring
- Criteria
- Weights
- Numeric scale
- Evaluation status

Initial scoring structure in the requirements is configurable and must be approved before final implementation.

### Shortlisting
- Review evaluations
- Shortlist
- Lock/unlock decisions

### Winners
- Select winners
- Create winner profiles
- Publish/unpublish

### CMS
Admin-managed:
- Homepage content
- Banners
- Award information
- Categories
- Important dates
- Jury profiles
- FAQs
- Contact details
- Winner profiles
- Alerts / announcements
- Terms and privacy content

---

## 11. Jury Portal

Jury members use a separate protected role-based experience.

Flow:

Login
→ Jury Dashboard
→ Assigned Entries
→ Open Entry
→ Review Project
→ Score Criteria
→ Add Confidential Comments
→ Save Progress
→ Final Submit

Rules:
- Jury member sees assigned entries only
- Jury member cannot see other jurors' scores/comments
- Evaluation can be saved before final submission
- Final submission locks evaluation
- Optional conflict-of-interest declaration can be included

---

## 12. Shortlisting & Winner Flow

Admin / authorized decision makers:

Jury Evaluation
→ Review Scores
→ Shortlist
→ Lock Shortlist
→ Select Winner
→ Create Winner Profile
→ Publish Winner

Public website only shows winners after they are officially published.

---

## 13. Notifications

Email notifications should support key events such as:

- Registration
- Email verification where enabled
- Nomination submitted
- Nomination ID acknowledgement
- Clarification requested
- Status updated
- Eligible
- Jury assignment where appropriate
- Shortlisted
- Winner notification

SMS/OTP and WhatsApp are optional integrations and should only be added if approved.

---

## 14. Reports

Admin reports should support:

- All nominations
- Category-wise nominations
- City/state-wise nominations
- Pending verification
- Shortlisted entries
- Jury scores — restricted access
- Winners

Exports:
- CSV
- Excel
- Optional PDF

---

## 15. Security & Access

The platform should implement:

- HTTPS
- Secure password authentication
- Role-based access control
- Database row-level security where applicable
- Secure file access
- Rate limiting / CAPTCHA where needed
- SQL injection protection
- XSS protection
- CSRF protection
- Brute-force protection
- IDOR protection
- Audit logs
- Privacy/consent handling
- Backups / recovery process

Confidential jury data must never be exposed to applicants or unauthorized jury members.

---

## 16. Future Award Editions

The platform should be reusable.

Instead of creating a separate application for every year:

Award Edition 2026
→ Categories
→ Questions
→ Scoring
→ Jury
→ Applications
→ Winners

Later:

Award Edition 2027
→ New configuration using the same system

The core application should not need to be rebuilt for a new edition.

---

## 17. Responsive Experience

The system should work on:

- Desktop
- Laptop
- Tablet
- Mobile

Special attention:
- Nomination wizard on mobile
- File uploads on mobile
- Admin tables on smaller screens
- Jury scoring on tablet/mobile
- Large touch-friendly buttons
- Readable forms
- Accessible contrast and labels

---

## 18. Final End-to-End Flow

PUBLIC VISITOR
→ Home
→ Categories
→ Eligibility
→ Register / Login
→ Applicant Dashboard
→ Nomination Wizard
→ Uploads
→ Preview
→ Declaration
→ Submit
→ Nomination ID

ADMIN
→ Application Received
→ Verification
→ Clarification / Eligible / Rejected
→ Jury Assignment
→ Jury Evaluation
→ Shortlist
→ Winner Selection
→ Publish Winner

PUBLIC
→ Published Winners
→ Winner Profiles

---

## 19. Visual Design Direction

The website should feel:

- Premium
- Editorial
- Architectural
- Modern
- Aspirational
- Trustworthy

Use:
- Deep navy / blue
- Gold accents
- White and warm neutrals
- Large project imagery
- Strong typography
- Editorial grids
- Clean cards
- Subtle motion
- Spacious layouts

Do not copy the Times of India Home & Decor Awards visual identity, wording or proprietary content. Use the reference only to understand the kind of user journey and awards-site structure required.

---

## 20. Content Requiring Client Confirmation

Before final production, confirm:

- Final award description
- Final category names
- Eligibility rules
- Important dates
- Final nomination instructions
- Final scoring criteria and weights
- Jury members and profiles
- Nomination fee, if any
- Payment requirement, if any
- Terms and conditions
- Privacy policy
- Contact details
- Winner publication rules
- Email/SMS/WhatsApp notification wording
- Final branding, logos, colors and photography

---

## 21. Recommended Implementation Principle

Build in this order:

1. Project foundation
2. Database/schema
3. Authentication & roles
4. Admin foundation
5. Category/question configuration
6. Applicant dashboard
7. Nomination wizard
8. File uploads
9. Verification workflow
10. Jury portal
11. Shortlisting & winners
12. Public website
13. Notifications
14. Reports
15. Security, testing and deployment

Do not ask the AI coding agent to build the whole project in one prompt.

Build one module, test it, approve it, then continue.
