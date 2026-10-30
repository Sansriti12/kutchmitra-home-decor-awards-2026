/**
 * Category Display Number Utility
 * Kutchmitra Home & Decor Awards 2026
 *
 * Provides safe presentation-layer sequential numbering (01 through 16)
 * for the 16 active award categories per official client specification
 * ("Kutchmitra_Home Decor Awards_Portal Changes.docx" / Section A).
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * - Internal database category codes ('01', '02', '04', ..., '17', '18', '19') remain unchanged for database
 *   relationships, primary keys, UUIDs, foreign keys, nomination IDs (KHA26-XX-XXXX), and audit logs.
 * - This module ONLY transforms values for user-visible display in UI badges, headers, filters, and cards.
 * - Retired categories ('03', '06', '13') retain safe fallbacks for historical data integrity.
 */

export const TOTAL_ACTIVE_CATEGORIES = 16;

/**
 * The three retired categories per client instruction:
 * 1. Best Apartment Design (Code 03)
 * 2. Ultra-Luxury Residential Project of the Year (Code 06)
 * 3. Best Contractor of the Year (Code 13)
 */
export const RETIRED_CATEGORY_CODES = new Set(["03", "06", "13"]);

export const RETIRED_CATEGORY_UUIDS = new Set([
  "c2026000-0000-0000-0000-000000000003",
  "c2026000-0000-0000-0000-000000000006",
  "c2026000-0000-0000-0000-000000000013",
]);

export const RETIRED_CATEGORY_SLUGS = new Set([
  "best-apartment-design",
  "ultra-luxury-residential-project-of-the-year",
  "best-contractor-of-the-year",
]);

/**
 * Checks whether a given category identifier (code, id, slug, or object) refers to a retired category.
 */
export function isRetiredCategory(
  input?: string | number | { code?: string; id?: string; slug?: string } | null
): boolean {
  if (input === null || input === undefined || input === "") {
    return false;
  }

  if (typeof input === "object") {
    if (input.code && RETIRED_CATEGORY_CODES.has(String(input.code).padStart(2, "0"))) {
      return true;
    }
    if (input.id && RETIRED_CATEGORY_UUIDS.has(String(input.id))) {
      return true;
    }
    if (input.slug && RETIRED_CATEGORY_SLUGS.has(String(input.slug).toLowerCase())) {
      return true;
    }
    return false;
  }

  if (typeof input === "number") {
    return RETIRED_CATEGORY_CODES.has(String(input).padStart(2, "0"));
  }

  const str = String(input).trim();
  if (RETIRED_CATEGORY_CODES.has(str.padStart(2, "0"))) {
    return true;
  }
  if (RETIRED_CATEGORY_UUIDS.has(str)) {
    return true;
  }
  if (RETIRED_CATEGORY_SLUGS.has(str.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Canonical model for an active award category.
 */
export interface ActiveCategoryItem {
  id: string;
  code: string;
  displayNumber: string;
  name: string;
  slug: string;
  display_order: number;
  short_description?: string;
  eligibility_criteria?: string;
  is_active?: boolean;
}

/**
 * Canonical array of the 14 active award categories strictly ordered 01 to 14.
 */
export const ACTIVE_CATEGORIES: ActiveCategoryItem[] = [
  {
    id: "c2026000-0000-0000-0000-000000000001",
    code: "01",
    displayNumber: "01",
    name: "Architect of the Year",
    slug: "architect-of-the-year",
    display_order: 1,
    short_description: "Recognising licensed architects or architectural firms with a strong portfolio of impactful residential or commercial projects.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000002",
    code: "02",
    displayNumber: "02",
    name: "Best Luxury Residence",
    slug: "best-luxury-residence",
    display_order: 2,
    short_description: "Celebrating high-end residential projects distinguished by premium materials, bespoke design elements and exceptional craftsmanship.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000004",
    code: "04",
    displayNumber: "03",
    name: "Best Renovation Project",
    slug: "best-renovation-project",
    display_order: 3,
    short_description: "Recognising projects that showcase a substantial and creative transformation of an existing space.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000005",
    code: "05",
    displayNumber: "04",
    name: "Best Sustainable Home",
    slug: "best-sustainable-home",
    display_order: 4,
    short_description: "Recognising residential projects that incorporate environmentally responsible materials, energy-efficient systems and climate-responsive design principles.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000007",
    code: "07",
    displayNumber: "05",
    name: "Interior Designer of the Year",
    slug: "interior-designer-of-the-year",
    display_order: 5,
    short_description: "Recognising interior design professionals or studios that demonstrate excellence in spatial planning, design aesthetics and overall execution.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000008",
    code: "08",
    displayNumber: "06",
    name: "Emerging Designer",
    slug: "emerging-designer",
    display_order: 6,
    short_description: "Recognising young design professionals or newly established firms, typically with less than 5–7 years of practice, demonstrating exceptional potential and promise.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000009",
    code: "09",
    displayNumber: "07",
    name: "Best Compact Home",
    slug: "best-compact-home",
    display_order: 7,
    short_description: "Recognising residential projects that creatively maximise functionality, comfort and design appeal within a limited floor area.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000010",
    code: "10",
    displayNumber: "08",
    name: "Best Smart Home",
    slug: "best-smart-home",
    display_order: 8,
    short_description: "Recognising residences that seamlessly integrate automated technologies for lighting, climate control, security, entertainment and other aspects of home living.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000011",
    code: "11",
    displayNumber: "09",
    name: "Best Themed Project of the Year (Concept & Design)",
    slug: "best-themed-project-of-the-year",
    display_order: 9,
    short_description: "Recognising projects that create a cohesive and immersive design experience by effectively translating a distinctive creative concept or cultural theme into a physical living space.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000012",
    code: "12",
    displayNumber: "10",
    name: "Luxury Villa Project of the Year",
    slug: "luxury-villa-project-of-the-year",
    display_order: 10,
    short_description: "Recognising standalone villa projects that combine sophisticated architecture, elegant interiors, premium materials and thoughtfully designed indoor and outdoor living spaces.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000014",
    code: "14",
    displayNumber: "11",
    name: "Best Developer of the Year",
    slug: "best-developer-of-the-year",
    display_order: 11,
    short_description: "Recognising real estate developers who demonstrate excellence in project planning, design coordination, construction quality, timely delivery and the development of high-quality residential or commercial properties.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000015",
    code: "15",
    displayNumber: "12",
    name: "Best Organised Township of the Year",
    slug: "best-organised-township-of-the-year",
    display_order: 12,
    short_description: "Recognising well-planned township developments that integrate residential spaces, infrastructure, amenities, open spaces and community facilities to create a well-organised, sustainable and comfortable living environment.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000016",
    code: "16",
    displayNumber: "13",
    name: "Best Office Design of the Year",
    slug: "best-office-design-of-the-year",
    display_order: 13,
    short_description: "Recognising office spaces that demonstrate excellence in workplace planning, functionality, aesthetics, ergonomics and the effective use of space to support productivity, employee well-being and a positive work environment.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000017",
    code: "17",
    displayNumber: "14",
    name: "Best Commercial Building of the Year",
    slug: "best-commercial-building-of-the-year",
    display_order: 14,
    short_description: "Recognising commercial buildings that demonstrate excellence in architectural design, functionality, construction quality, sustainability and the effective integration of infrastructure and user-oriented facilities.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000018",
    code: "18",
    displayNumber: "15",
    name: "Excellence in Vernacular Architecture",
    slug: "excellence-in-vernacular-architecture",
    display_order: 15,
    short_description: "Recognising homes and residential projects that thoughtfully reinterpret Kutch's traditional architecture, including the bhunga, local building forms, courtyards, proportions and traditional spatial planning, while responding to contemporary living needs.",
    is_active: true,
  },
  {
    id: "c2026000-0000-0000-0000-000000000019",
    code: "19",
    displayNumber: "16",
    name: "Excellence in Kutchi Craft & Artisan Integration",
    slug: "excellence-in-kutchi-craft-and-artisan-integration",
    display_order: 16,
    short_description: "Recognising interior or residential projects that meaningfully integrate Kutchi crafts and regional artisans, including embroidery, Ajrakh, Bandhani, woodwork, pottery, metalwork, leatherwork and other local craft traditions.",
    is_active: true,
  },
];

const CODE_TO_CANONICAL = new Map(ACTIVE_CATEGORIES.map((c) => [c.code, c]));
const UUID_TO_CANONICAL = new Map(ACTIVE_CATEGORIES.map((c) => [c.id, c]));
const SLUG_TO_CANONICAL = new Map(ACTIVE_CATEGORIES.map((c) => [c.slug, c]));

/**
 * Returns the authoritative list of 16 active categories, ordered sequentially 01 through 16.
 *
 * If `dbRows` is provided:
 * - Excludes retired categories (03, 06, 13) and any row with is_active === false.
 * - Merges DB row fields (preserving dynamic DB IDs, custom descriptions, etc.) with canonical numbering.
 * - Guarantees all 16 categories are always returned in the exact approved order, even if certain
 *   database rows have not yet been seeded in the live database.
 */
export function getActiveCategories<
  T extends { code?: string; id?: string; slug?: string; name?: string; is_active?: boolean }
>(dbRows?: T[] | null): Array<T & ActiveCategoryItem> {
  if (!dbRows || !Array.isArray(dbRows) || dbRows.length === 0) {
    return ACTIVE_CATEGORIES.map((c) => ({ ...c } as unknown as T & ActiveCategoryItem));
  }

  // Filter out any retired or explicitly inactive categories
  const validDbRows = dbRows.filter(
    (r) => !isRetiredCategory(r) && r.is_active !== false
  );

  const matchedCodes = new Set<string>();
  const merged: Array<T & ActiveCategoryItem> = [];

  for (const row of validDbRows) {
    const code = row.code ? String(row.code).padStart(2, "0") : null;
    const canonical =
      (code ? CODE_TO_CANONICAL.get(code) : null) ||
      (row.id ? UUID_TO_CANONICAL.get(row.id) : null) ||
      (row.slug ? SLUG_TO_CANONICAL.get(row.slug) : null);

    if (canonical) {
      matchedCodes.add(canonical.code);
      merged.push({
        ...canonical,
        ...row,
        displayNumber: canonical.displayNumber,
      } as T & ActiveCategoryItem);
    }
  }

  // Supplement any missing active categories from canonical reference
  for (const canonical of ACTIVE_CATEGORIES) {
    if (!matchedCodes.has(canonical.code)) {
      merged.push({ ...canonical } as unknown as T & ActiveCategoryItem);
    }
  }

  // Sort strictly by displayNumber 01 through 16
  merged.sort(
    (a, b) => parseInt(a.displayNumber, 10) - parseInt(b.displayNumber, 10)
  );

  return merged;
}

/**
 * Static mapping from canonical database category code to user-visible sequential display number.
 * 16 active categories strictly ordered 01 to 16.
 * Retired categories map to "Retired" to prevent duplicate numbers (e.g. 06, 13).
 */
export const CATEGORY_CODE_TO_DISPLAY_NUMBER: Record<string, string> = {
  // 10 Retained Categories
  "01": "01", // Architect of the Year
  "02": "02", // Best Luxury Residence
  "04": "03", // Best Renovation Project (formerly 04)
  "05": "04", // Best Sustainable Home (formerly 05)
  "07": "05", // Interior Designer of the Year (formerly 07)
  "08": "06", // Emerging Designer (formerly 08)
  "09": "07", // Best Compact Home (formerly 09)
  "10": "08", // Best Smart Home (formerly 10)
  "11": "09", // Best Themed Project of the Year (formerly 11)
  "12": "10", // Luxury Villa Project of the Year (formerly 12)

  // 4 Established Categories (from 14-category structure)
  "14": "11", // Best Developer of the Year (code 14)
  "15": "12", // Best Organised Township of the Year (code 15)
  "16": "13", // Best Office Design of the Year (code 16)
  "17": "14", // Best Commercial Building of the Year (code 17)

  // 2 New Proposed Categories (16-category structure)
  "18": "15", // Excellence in Vernacular Architecture (code 18)
  "19": "16", // Excellence in Kutchi Craft & Artisan Integration (code 19)

  // Fallbacks for Retired Categories (avoid collision with active display numbers 03, 06, 13)
  "03": "Retired", // Best Apartment Design (Retired)
  "06": "Retired", // Ultra-Luxury Residential Project of the Year (Retired)
  "13": "Retired", // Best Contractor of the Year (Retired)
};

/**
 * Secondary fallback mapping by Category UUID.
 */
export const CATEGORY_UUID_TO_DISPLAY_NUMBER: Record<string, string> = {
  // 10 Retained Categories
  "c2026000-0000-0000-0000-000000000001": "01",
  "c2026000-0000-0000-0000-000000000002": "02",
  "c2026000-0000-0000-0000-000000000004": "03",
  "c2026000-0000-0000-0000-000000000005": "04",
  "c2026000-0000-0000-0000-000000000007": "05",
  "c2026000-0000-0000-0000-000000000008": "06",
  "c2026000-0000-0000-0000-000000000009": "07",
  "c2026000-0000-0000-0000-000000000010": "08",
  "c2026000-0000-0000-0000-000000000011": "09",
  "c2026000-0000-0000-0000-000000000012": "10",

  // 4 Established Categories
  "c2026000-0000-0000-0000-000000000014": "11",
  "c2026000-0000-0000-0000-000000000015": "12",
  "c2026000-0000-0000-0000-000000000016": "13",
  "c2026000-0000-0000-0000-000000000017": "14",

  // 2 New Proposed Categories
  "c2026000-0000-0000-0000-000000000018": "15",
  "c2026000-0000-0000-0000-000000000019": "16",

  // Fallbacks for Retired Categories
  "c2026000-0000-0000-0000-000000000003": "Retired",
  "c2026000-0000-0000-0000-000000000006": "Retired",
  "c2026000-0000-0000-0000-000000000013": "Retired",
};

/**
 * Secondary fallback mapping by Category Slug.
 */
export const CATEGORY_SLUG_TO_DISPLAY_NUMBER: Record<string, string> = {
  // 10 Retained Categories
  "architect-of-the-year": "01",
  "best-luxury-residence": "02",
  "best-renovation-project": "03",
  "best-sustainable-home": "04",
  "interior-designer-of-the-year": "05",
  "emerging-designer": "06",
  "best-compact-home": "07",
  "best-smart-home": "08",
  "best-themed-project-of-the-year": "09",
  "luxury-villa-project-of-the-year": "10",

  // 4 Established Categories
  "best-developer-of-the-year": "11",
  "best-organised-township-of-the-year": "12",
  "best-office-design-of-the-year": "13",
  "best-commercial-building-of-the-year": "14",

  // 2 New Proposed Categories
  "excellence-in-vernacular-architecture": "15",
  "excellence-in-kutchi-craft-and-artisan-integration": "16",
  "excellence-in-kutchi-craft-artisan-integration": "16",

  // Fallbacks for Retired Categories
  "best-apartment-design": "Retired",
  "ultra-luxury-residential-project-of-the-year": "Retired",
  "best-contractor-of-the-year": "Retired",
};

/**
 * Returns the sequential 2-digit display number ('01' - '14') for an active category.
 * Accepts a DB code string ('04'), number (4), category object, UUID, or slug.
 */
export function getCategoryDisplayNumber(
  input?: string | number | { code?: string; id?: string; slug?: string } | null
): string {
  if (input === null || input === undefined || input === "") {
    return "";
  }

  // Handle object input
  if (typeof input === "object") {
    if (input.code && CATEGORY_CODE_TO_DISPLAY_NUMBER[input.code]) {
      return CATEGORY_CODE_TO_DISPLAY_NUMBER[input.code];
    }
    if (input.id && CATEGORY_UUID_TO_DISPLAY_NUMBER[input.id]) {
      return CATEGORY_UUID_TO_DISPLAY_NUMBER[input.id];
    }
    if (input.slug && CATEGORY_SLUG_TO_DISPLAY_NUMBER[input.slug]) {
      return CATEGORY_SLUG_TO_DISPLAY_NUMBER[input.slug];
    }
    if (input.code) {
      const padded = input.code.padStart(2, "0");
      return CATEGORY_CODE_TO_DISPLAY_NUMBER[padded] || padded;
    }
    return "";
  }

  // Handle number input
  if (typeof input === "number") {
    const padded = String(input).padStart(2, "0");
    return CATEGORY_CODE_TO_DISPLAY_NUMBER[padded] || padded;
  }

  // Handle string input
  const str = String(input).trim();

  // 1. Direct code lookup ('01', '04', '14', etc.)
  if (CATEGORY_CODE_TO_DISPLAY_NUMBER[str]) {
    return CATEGORY_CODE_TO_DISPLAY_NUMBER[str];
  }

  // 2. Numeric single digit string ('4' -> '04' -> '03')
  if (/^\d+$/.test(str)) {
    const padded = str.padStart(2, "0");
    if (CATEGORY_CODE_TO_DISPLAY_NUMBER[padded]) {
      return CATEGORY_CODE_TO_DISPLAY_NUMBER[padded];
    }
    return padded;
  }

  // 3. UUID lookup
  if (CATEGORY_UUID_TO_DISPLAY_NUMBER[str]) {
    return CATEGORY_UUID_TO_DISPLAY_NUMBER[str];
  }

  // 4. Slug lookup
  if (CATEGORY_SLUG_TO_DISPLAY_NUMBER[str]) {
    return CATEGORY_SLUG_TO_DISPLAY_NUMBER[str];
  }

  return str;
}

/**
 * Formats category badge with '#' prefix using the sequential display number.
 * Example: formatCategoryBadge("04") => "#03"
 */
export function formatCategoryBadge(
  input?: string | number | { code?: string; id?: string; slug?: string } | null
): string {
  if (isRetiredCategory(input)) {
    return "[Retired]";
  }
  const num = getCategoryDisplayNumber(input);
  return num && num !== "Retired" ? `#${num}` : "";
}

/**
 * Formats category label for dropdowns and headers.
 * Example: formatCategoryLabel("04", "Best Renovation Project") => "Cat 03: Best Renovation Project"
 */
export function formatCategoryLabel(
  input?: string | number | { code?: string; id?: string; name?: string; slug?: string } | null,
  fallbackName?: string
): string {
  const name =
    typeof input === "object" && input !== null && "name" in input && input.name
      ? input.name
      : fallbackName || "";

  if (isRetiredCategory(input)) {
    return name ? `${name} (Retired)` : "Retired Category";
  }

  const num = getCategoryDisplayNumber(input);
  if (num && num !== "Retired" && name) {
    return `Cat ${num}: ${name}`;
  }
  if (num && num !== "Retired") {
    return `Cat ${num}`;
  }
  return name;
}
