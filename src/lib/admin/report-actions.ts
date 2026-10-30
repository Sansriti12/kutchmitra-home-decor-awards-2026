"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { getCategoryDisplayNumber, getActiveCategories } from "@/lib/utils";
import type { RoleId } from "@/types/database.types";

export interface ReportApplicationItem {
  id: string;
  nominationId: string;
  projectName: string;
  builtUpAreaSqft: number | null;
  projectCompletionDate: string | null;
  projectCity: string;
  projectState: string;
  isKutch: boolean;
  categoryId: string;
  categoryCode: string;
  categoryDisplayNumber: string;
  categoryName: string;
  categorySlug: string;
  isCategoryActive: boolean;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string | null;
  organization: string | null;
  status: string;
  isLocked: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  juryStatus: "unassigned" | "assigned" | "in_progress" | "completed" | "conflict";
  jurorNames: string[];
  isShortlisted: boolean;
  isShortlistLocked: boolean;
  isWinner: boolean;
  awardTitle: string | null;
  winnerType: string | null;
  winnerPublicationStatus: string | null;
  isWinnerPublished: boolean;
}

export interface ReportCategoryMetric {
  id: string;
  code: string;
  displayNumber: string;
  name: string;
  slug: string;
  totalApplications: number;
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  winnerCount: number;
}

export interface ReportJurorSummary {
  id: string;
  fullName: string;
  email: string;
  organization: string | null;
  designation: string | null;
  totalAssigned: number;
  completed: number;
  pending: number;
  conflicts: number;
}

export interface ReportJuryMetric {
  totalJurors: number;
  activeJurors: number;
  totalAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  conflictAssignments: number;
  completionPercentage: number;
  jurorSummaries: ReportJurorSummary[];
}

export interface ReportExecutiveStats {
  totalApplications: number;
  statusCounts: Record<string, number>;
  kutchCount: number;
  nonKutchCount: number;
  distinctCitiesCount: number;
  activeCategoriesCount: number;
  totalJurorsCount: number;
  totalShortlistedCount: number;
  totalWinnersCount: number;
  totalPublishedWinnersCount: number;
}

export interface ReportFilterOptions {
  categories: Array<{ id: string; name: string; code: string; displayNumber: string }>;
  statuses: Array<{ code: string; label: string }>;
  cities: string[];
}

export interface ReportWorkspaceData {
  success: boolean;
  error?: string;
  applications: ReportApplicationItem[];
  executiveStats: ReportExecutiveStats;
  categoryMetrics: ReportCategoryMetric[];
  juryMetric: ReportJuryMetric;
  filterOptions: ReportFilterOptions;
}

const KUTCH_KEYWORDS = [
  "kutch",
  "kachchh",
  "bhuj",
  "gandhidham",
  "mandvi",
  "anjar",
  "mundra",
  "nakhatrana",
  "bhachau",
  "rapar",
  "madhapar",
  "abdasa",
  "lakhpat",
];

function checkIsKutch(city?: string | null, state?: string | null): boolean {
  if (!city && !state) return false;
  const c = (city || "").toLowerCase().trim();
  const s = (state || "").toLowerCase().trim();
  return KUTCH_KEYWORDS.some((kw) => c.includes(kw) || s.includes(kw));
}

const CANONICAL_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_verification: "Under Verification",
  clarification_required: "Clarification Required",
  eligible: "Eligible",
  jury_review: "Jury Review",
  shortlisted: "Shortlisted",
  winner: "Winner",
  rejected: "Rejected",
  disqualified: "Disqualified",
};

/**
 * Server action to fetch authoritative Reports & Exports data.
 * Strictly gated to Management / Super Admin roles.
 */
export async function getReportsWorkspaceData(): Promise<ReportWorkspaceData> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return {
      success: false,
      error: "Unauthorized: Reports access is restricted to Management and Super Administrators.",
      applications: [],
      executiveStats: {
        totalApplications: 0,
        statusCounts: {},
        kutchCount: 0,
        nonKutchCount: 0,
        distinctCitiesCount: 0,
        activeCategoriesCount: 0,
        totalJurorsCount: 0,
        totalShortlistedCount: 0,
        totalWinnersCount: 0,
        totalPublishedWinnersCount: 0,
      },
      categoryMetrics: [],
      juryMetric: {
        totalJurors: 0,
        activeJurors: 0,
        totalAssignments: 0,
        pendingAssignments: 0,
        completedAssignments: 0,
        conflictAssignments: 0,
        completionPercentage: 0,
        jurorSummaries: [],
      },
      filterOptions: {
        categories: [],
        statuses: [],
        cities: [],
      },
    };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch categories (authoritative 16 active categories, ordered by display_order)
    const { data: rawCategories, error: catErr } = await adminClient
      .from("categories")
      .select("id, code, name, slug, display_order, is_active")
      .order("display_order");

    if (catErr) {
      console.error("Error fetching categories for reports:", catErr);
    }

    const allCategories = rawCategories || [];
    const activeCategories = getActiveCategories(allCategories);

    // 2. Fetch all applications with relations
    const { data: rawApps, error: appErr } = await adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        edition_id,
        category_id,
        applicant_id,
        project_name,
        project_city,
        project_state,
        project_completion_date,
        built_up_area_sqft,
        status,
        is_locked,
        submitted_at,
        created_at,
        updated_at,
        categories(id, code, name, slug, is_active),
        users:applicant_id(id, full_name, email, phone),
        application_shortlists(id, is_locked, created_at, deliberation_notes),
        winners(id, award_title, winner_type, publication_status, is_published, published_at),
        jury_assignments(
          id,
          status,
          conflict_declared,
          conflict_reason,
          jury_profile_id
        )
      `)
      .order("created_at", { ascending: false });

    if (appErr) {
      console.error("Error fetching applications for reports:", appErr);
      throw new Error(`Failed to load applications: ${appErr.message}`);
    }

    // 3. Fetch applicant profiles for organization names
    const applicantIds = Array.from(
      new Set((rawApps || []).map((a: any) => a.applicant_id).filter(Boolean))
    );
    const orgMap = new Map<string, string>();
    if (applicantIds.length > 0) {
      const { data: profiles } = await adminClient
        .from("applicant_profiles")
        .select("user_id, organization_name")
        .in("user_id", applicantIds);

      (profiles || []).forEach((p) => {
        if (p.organization_name) {
          orgMap.set(p.user_id, p.organization_name);
        }
      });
    }

    // 4. Fetch jury profiles & users for jury metrics
    const { data: rawJuryProfiles } = await adminClient
      .from("jury_profiles")
      .select(`
        id,
        user_id,
        honorific,
        organization,
        designation,
        users:user_id(id, full_name, email, is_active)
      `);

    const jurorMap = new Map<string, { name: string; org: string; des: string; email: string; active: boolean }>();
    (rawJuryProfiles || []).forEach((jp: any) => {
      const u = Array.isArray(jp.users) ? jp.users[0] : jp.users;
      jurorMap.set(jp.id, {
        name: u?.full_name || jp.honorific || "Juror",
        org: jp.organization || "",
        des: jp.designation || "",
        email: u?.email || "",
        active: u?.is_active ?? true,
      });
    });

    // 5. Fetch all jury assignments to calculate jury metrics
    const { data: allAssignments } = await adminClient
      .from("jury_assignments")
      .select("id, jury_profile_id, application_id, status, conflict_declared");

    const assignmentsList = allAssignments || [];
    const totalAssignments = assignmentsList.length;
    const completedAssignments = assignmentsList.filter((a) => a.status === "completed").length;
    const conflictAssignments = assignmentsList.filter((a) => a.conflict_declared).length;
    const pendingAssignments = assignmentsList.filter(
      (a) => a.status === "assigned" || a.status === "in_progress"
    ).length;

    // Juror individual breakdown
    const jurorStatsMap = new Map<string, { total: number; completed: number; pending: number; conflicts: number }>();
    assignmentsList.forEach((a) => {
      if (!a.jury_profile_id) return;
      const curr = jurorStatsMap.get(a.jury_profile_id) || { total: 0, completed: 0, pending: 0, conflicts: 0 };
      curr.total++;
      if (a.status === "completed") curr.completed++;
      else if (a.conflict_declared) curr.conflicts++;
      else curr.pending++;
      jurorStatsMap.set(a.jury_profile_id, curr);
    });

    const jurorSummaries: ReportJurorSummary[] = (rawJuryProfiles || []).map((jp: any) => {
      const jurorMeta = jurorMap.get(jp.id);
      const stats = jurorStatsMap.get(jp.id) || { total: 0, completed: 0, pending: 0, conflicts: 0 };
      return {
        id: jp.id,
        fullName: jurorMeta?.name || "Juror",
        email: jurorMeta?.email || "",
        organization: jurorMeta?.org || null,
        designation: jurorMeta?.des || null,
        totalAssigned: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        conflicts: stats.conflicts,
      };
    });

    // 6. Map applications into typed ReportApplicationItem records
    const statusCounts: Record<string, number> = {
      draft: 0,
      submitted: 0,
      under_verification: 0,
      clarification_required: 0,
      eligible: 0,
      jury_review: 0,
      shortlisted: 0,
      winner: 0,
      rejected: 0,
      disqualified: 0,
    };

    const citiesSet = new Set<string>();
    let kutchCount = 0;
    let nonKutchCount = 0;
    let totalShortlistedCount = 0;
    let totalWinnersCount = 0;
    let totalPublishedWinnersCount = 0;

    const items: ReportApplicationItem[] = (rawApps || []).map((row: any) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const usr = Array.isArray(row.users) ? row.users[0] : row.users;
      const short = Array.isArray(row.application_shortlists)
        ? row.application_shortlists[0]
        : row.application_shortlists;
      const win = Array.isArray(row.winners) ? row.winners[0] : row.winners;
      const assignments = row.jury_assignments || [];

      // Status count aggregation
      const s = String(row.status || "draft").toLowerCase();
      if (s in statusCounts) {
        statusCounts[s]++;
      } else {
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }

      // Kutch check
      const isKutch = checkIsKutch(row.project_city, row.project_state);
      if (isKutch) kutchCount++;
      else nonKutchCount++;

      if (row.project_city && row.project_city.trim()) {
        citiesSet.add(row.project_city.trim());
      }

      // Shortlist & Winner flags
      const isShortlisted = Boolean(short || s === "shortlisted" || s === "winner");
      if (isShortlisted) totalShortlistedCount++;

      const isWinner = Boolean(win || s === "winner");
      if (isWinner) totalWinnersCount++;
      if (win?.is_published) totalPublishedWinnersCount++;

      // Jury status resolution
      let juryStatus: ReportApplicationItem["juryStatus"] = "unassigned";
      const jurorNames: string[] = [];

      if (assignments.length > 0) {
        const hasCompleted = assignments.some((a: any) => a.status === "completed");
        const hasConflict = assignments.some((a: any) => a.conflict_declared);
        const hasInProgress = assignments.some((a: any) => a.status === "in_progress");

        if (hasCompleted) juryStatus = "completed";
        else if (hasConflict) juryStatus = "conflict";
        else if (hasInProgress) juryStatus = "in_progress";
        else juryStatus = "assigned";

        assignments.forEach((a: any) => {
          if (a.jury_profile_id && jurorMap.has(a.jury_profile_id)) {
            jurorNames.push(jurorMap.get(a.jury_profile_id)!.name);
          }
        });
      }

      const catCode = cat?.code || "00";
      const catDisplayNum = getCategoryDisplayNumber(catCode);

      return {
        id: row.id,
        nominationId: row.nomination_id || "Unassigned",
        projectName: row.project_name || "Untitled Project",
        builtUpAreaSqft: row.built_up_area_sqft ? Number(row.built_up_area_sqft) : null,
        projectCompletionDate: row.project_completion_date || null,
        projectCity: row.project_city || "Kutch",
        projectState: row.project_state || "Gujarat",
        isKutch,
        categoryId: row.category_id,
        categoryCode: catCode,
        categoryDisplayNumber: catDisplayNum,
        categoryName: cat?.name || "Unassigned Category",
        categorySlug: cat?.slug || "",
        isCategoryActive: cat?.is_active ?? true,
        applicantId: row.applicant_id,
        applicantName: usr?.full_name || "Applicant",
        applicantEmail: usr?.email || "",
        applicantPhone: usr?.phone || null,
        organization: orgMap.get(row.applicant_id) || null,
        status: s,
        isLocked: Boolean(row.is_locked),
        submittedAt: row.submitted_at || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        juryStatus,
        jurorNames,
        isShortlisted,
        isShortlistLocked: Boolean(short?.is_locked),
        isWinner,
        awardTitle: win?.award_title || (isWinner ? "Winner" : null),
        winnerType: win?.winner_type || null,
        winnerPublicationStatus: win?.publication_status || (win?.is_published ? "published" : null),
        isWinnerPublished: Boolean(win?.is_published),
      };
    });

    // 7. Calculate category-wise breakdown (14 active categories)
    const categoryMetrics: ReportCategoryMetric[] = activeCategories.map((c) => {
      const catApps = items.filter((item) => item.categoryId === c.id);
      return {
        id: c.id,
        code: c.code,
        displayNumber: getCategoryDisplayNumber(c.code),
        name: c.name,
        slug: c.slug,
        totalApplications: catApps.length,
        draftCount: catApps.filter((a) => a.status === "draft").length,
        submittedCount: catApps.filter((a) => a.status === "submitted").length,
        underReviewCount: catApps.filter((a) =>
          ["under_verification", "eligible", "jury_review"].includes(a.status)
        ).length,
        shortlistedCount: catApps.filter((a) => a.isShortlisted).length,
        winnerCount: catApps.filter((a) => a.isWinner).length,
      };
    });

    const completionPercentage =
      totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    const filterOptions: ReportFilterOptions = {
      categories: activeCategories.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        displayNumber: getCategoryDisplayNumber(c.code),
      })),
      statuses: Object.entries(CANONICAL_STATUS_LABELS).map(([code, label]) => ({
        code,
        label,
      })),
      cities: Array.from(citiesSet).sort(),
    };

    return {
      success: true,
      applications: items,
      executiveStats: {
        totalApplications: items.length,
        statusCounts,
        kutchCount,
        nonKutchCount,
        distinctCitiesCount: citiesSet.size,
        activeCategoriesCount: activeCategories.length,
        totalJurorsCount: (rawJuryProfiles || []).length,
        totalShortlistedCount,
        totalWinnersCount,
        totalPublishedWinnersCount,
      },
      categoryMetrics,
      juryMetric: {
        totalJurors: (rawJuryProfiles || []).length,
        activeJurors: (rawJuryProfiles || []).filter((jp: any) => jurorMap.get(jp.id)?.active).length,
        totalAssignments,
        pendingAssignments,
        completedAssignments,
        conflictAssignments,
        completionPercentage,
        jurorSummaries,
      },
      filterOptions,
    };
  } catch (err: any) {
    console.error("Exception in getReportsWorkspaceData:", err);
    return {
      success: false,
      error: err.message || "Failed to load reports workspace data.",
      applications: [],
      executiveStats: {
        totalApplications: 0,
        statusCounts: {},
        kutchCount: 0,
        nonKutchCount: 0,
        distinctCitiesCount: 0,
        activeCategoriesCount: 0,
        totalJurorsCount: 0,
        totalShortlistedCount: 0,
        totalWinnersCount: 0,
        totalPublishedWinnersCount: 0,
      },
      categoryMetrics: [],
      juryMetric: {
        totalJurors: 0,
        activeJurors: 0,
        totalAssignments: 0,
        pendingAssignments: 0,
        completedAssignments: 0,
        conflictAssignments: 0,
        completionPercentage: 0,
        jurorSummaries: [],
      },
      filterOptions: {
        categories: [],
        statuses: [],
        cities: [],
      },
    };
  }
}
