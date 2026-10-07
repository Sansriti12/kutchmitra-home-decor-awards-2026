"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { sendNotification } from "@/lib/notifications/notification-service";
import type {
  ShortlistWorkspaceItem,
  ShortlistStats,
  FinalDeliberationDossier,
  JurorEvaluationSummary,
  JuryCompletenessSummary,
  WinnerType,
  WinnerRecord,
  PublicationStatus,
} from "@/types/shortlist-winner.types";

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

/**
 * Fetches all nominations in jury review, shortlisted, or winner status
 * along with jury evaluation completeness and qualitative recommendations.
 */
export async function getShortlistingWorkspaceData(params?: {
  categoryId?: string;
  status?: string;
  evaluationStatus?: string;
  search?: string;
}): Promise<{
  success: boolean;
  error?: string;
  items: ShortlistWorkspaceItem[];
  stats: ShortlistStats;
  categories: Array<{ id: string; name: string; code: string }>;
}> {
  const session = await getAdminSession();
  if (!session || (!session.isAdmin && !session.isVerificationTeam)) {
    return {
      success: false,
      error: "Unauthorized: Administrator access required.",
      items: [],
      stats: {
        totalJuryReview: 0,
        totalFullyEvaluated: 0,
        totalShortlisted: 0,
        isShortlistLocked: false,
        totalCategories: 0,
      },
      categories: [],
    };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch categories
    const { data: categoriesData } = await adminClient
      .from("categories")
      .select("id, name, code, display_order")
      .eq("is_active", true)
      .order("display_order");

    const categories = (categoriesData || []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));

    // 2. Fetch shortlist lock state for current edition
    const { data: lockCheck } = await adminClient
      .from("application_shortlists")
      .select("is_locked, locked_at, locked_by")
      .eq("edition_id", CURRENT_EDITION_ID)
      .eq("is_locked", true)
      .limit(1)
      .maybeSingle();

    let lockedByName: string | undefined;
    if (lockCheck?.locked_by) {
      const { data: lockUser } = await adminClient
        .from("users")
        .select("full_name")
        .eq("id", lockCheck.locked_by)
        .maybeSingle();
      lockedByName = lockUser?.full_name || undefined;
    }

    // 3. Query applications in jury_review, shortlisted, or winner states
    let appQuery = adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        project_name,
        category_id,
        applicant_id,
        project_city,
        project_state,
        project_completion_date,
        status,
        created_at,
        users:applicant_id(id, full_name, email, phone),
        categories(id, name, code)
      `)
      .eq("edition_id", CURRENT_EDITION_ID)
      .in("status", ["jury_review", "shortlisted", "winner"])
      .order("created_at", { ascending: false });

    if (params?.categoryId && params.categoryId !== "all") {
      appQuery = appQuery.eq("category_id", params.categoryId);
    }
    if (params?.status && params.status !== "all") {
      appQuery = appQuery.eq("status", params.status);
    }

    const { data: rawApps, error: appErr } = await appQuery;
    if (appErr) {
      console.error("Error fetching applications for shortlisting:", appErr);
      return {
        success: false,
        error: `Database error: ${appErr.message}`,
        items: [],
        stats: {
          totalJuryReview: 0,
          totalFullyEvaluated: 0,
          totalShortlisted: 0,
          isShortlistLocked: false,
          totalCategories: categories.length,
        },
        categories,
      };
    }

    const appIds = (rawApps || []).map((a) => a.id);

    // Batch query applicant organizations from applicant_profiles
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

    // 4. Batch query existing shortlists
    const { data: shortlistsData } = await adminClient
      .from("application_shortlists")
      .select(`
        id,
        application_id,
        is_locked,
        locked_at,
        created_at,
        decision_notes,
        deliberation_notes,
        users:shortlisted_by(id, full_name)
      `)
      .in("application_id", appIds.length > 0 ? appIds : ["00000000-0000-0000-0000-000000000000"]);

    const shortlistMap = new Map<string, any>();
    (shortlistsData || []).forEach((s) => shortlistMap.set(s.application_id, s));

    // 5. Batch query jury assignments & evaluations
    const { data: assignmentsData } = await adminClient
      .from("jury_assignments")
      .select(`
        id,
        application_id,
        jury_profile_id,
        status,
        conflict_declared,
        conflict_reason,
        jury_profiles(
          id,
          designation,
          organization,
          users(full_name)
        ),
        jury_evaluations(
          id,
          status,
          is_locked,
          recommendation,
          submitted_at,
          strengths,
          areas_of_concern,
          general_comment,
          jury_scores(
            criterion_id,
            qualitative_rating,
            confidential_comment,
            scoring_criteria(title)
          )
        )
      `)
      .in("application_id", appIds.length > 0 ? appIds : ["00000000-0000-0000-0000-000000000000"]);

    const assignmentsByApp = new Map<string, any[]>();
    (assignmentsData || []).forEach((asgn) => {
      const list = assignmentsByApp.get(asgn.application_id) || [];
      list.push(asgn);
      assignmentsByApp.set(asgn.application_id, list);
    });

    // 6. Assemble workspace items & calculate statistics
    let fullyEvaluatedCount = 0;
    let totalShortlistedCount = 0;

    const items: ShortlistWorkspaceItem[] = (rawApps || []).map((app: any) => {
      const sl = shortlistMap.get(app.id);
      const isShortlisted = app.status === "shortlisted" || !!sl;
      if (isShortlisted) totalShortlistedCount++;

      const rawAsgns = assignmentsByApp.get(app.id) || [];
      const totalAssigned = rawAsgns.length;

      let completedCount = 0;
      let pendingCount = 0;
      let conflictCount = 0;
      const recommendationCounts: Record<string, number> = {};

      const jurors: JurorEvaluationSummary[] = rawAsgns.map((asgn: any) => {
        const jurorProfile = asgn.jury_profiles;
        const evals = asgn.jury_evaluations;
        const evaluation = Array.isArray(evals) ? evals[0] : evals;

        const isConflict = asgn.conflict_declared;
        if (isConflict) conflictCount++;

        const isCompleted = !isConflict && (evaluation?.is_locked || asgn.status === "completed");
        if (isCompleted) {
          completedCount++;
          if (evaluation?.recommendation) {
            recommendationCounts[evaluation.recommendation] =
              (recommendationCounts[evaluation.recommendation] || 0) + 1;
          }
        } else if (!isConflict) {
          pendingCount++;
        }

        const scores = (evaluation?.jury_scores || []).map((sc: any) => ({
          criterionId: sc.criterion_id,
          criterionTitle: sc.scoring_criteria?.title || "Criterion",
          qualitativeRating: sc.qualitative_rating || "Unrated",
          confidentialComment: sc.confidential_comment || undefined,
        }));

        const jpUser = Array.isArray(jurorProfile?.users) ? jurorProfile.users[0] : jurorProfile?.users;
        const jurorName = jpUser?.full_name || jurorProfile?.full_name || "Assigned Juror";

        return {
          assignmentId: asgn.id,
          jurorId: jurorProfile?.id || asgn.jury_profile_id,
          jurorName,
          jurorDesignation: jurorProfile?.designation || undefined,
          jurorOrganization: jurorProfile?.organization || undefined,
          status: asgn.status,
          conflictDeclared: isConflict,
          conflictReason: asgn.conflict_reason || undefined,
          recommendation: evaluation?.recommendation || undefined,
          submittedAt: evaluation?.submitted_at || undefined,
          strengths: evaluation?.strengths || undefined,
          areasOfConcern: evaluation?.areas_of_concern || undefined,
          generalComment: evaluation?.general_comment || undefined,
          scores,
        };
      });

      // Fully evaluated definition: has at least 1 non-conflict juror assigned and all non-conflict evaluations are submitted
      const activeNonConflictAssigned = totalAssigned - conflictCount;
      const isFullyEvaluated = activeNonConflictAssigned > 0 && completedCount === activeNonConflictAssigned;
      if (isFullyEvaluated) fullyEvaluatedCount++;

      const completeness: JuryCompletenessSummary = {
        totalAssigned,
        completedCount,
        pendingCount,
        conflictCount,
        isFullyEvaluated,
        recommendations: recommendationCounts,
        jurors,
      };

      const categoryObj = Array.isArray(app.categories) ? app.categories[0] : app.categories;
      const userObj = Array.isArray(app.users) ? app.users[0] : app.users;
      const slUser = Array.isArray(sl?.users) ? sl.users[0] : sl?.users;

      return {
        id: app.id,
        nominationId: app.nomination_id,
        projectName: app.project_name,
        categoryId: app.category_id,
        categoryName: categoryObj?.name || "Unassigned Category",
        categoryCode: categoryObj?.code || "00",
        applicantName: userObj?.full_name || "Applicant",
        applicantOrganization: orgMap.get(app.applicant_id) || "",
        projectCity: app.project_city || "",
        projectState: app.project_state || "",
        completionDate: app.project_completion_date,
        status: app.status,
        isShortlisted,
        shortlistId: sl?.id,
        shortlistedAt: sl?.created_at,
        shortlistedByName: slUser?.full_name,
        deliberationNotes: sl?.deliberation_notes || sl?.decision_notes,
        isLocked: sl?.is_locked || false,
        lockedAt: sl?.locked_at,
        juryCompleteness: completeness,
      };
    });

    // 7. Apply optional in-memory filters
    let filteredItems = items;
    if (params?.evaluationStatus === "completed") {
      filteredItems = filteredItems.filter((i) => i.juryCompleteness.isFullyEvaluated);
    } else if (params?.evaluationStatus === "pending") {
      filteredItems = filteredItems.filter((i) => !i.juryCompleteness.isFullyEvaluated);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (i) =>
          i.nominationId.toLowerCase().includes(q) ||
          i.projectName.toLowerCase().includes(q) ||
          i.applicantName.toLowerCase().includes(q) ||
          i.applicantOrganization.toLowerCase().includes(q) ||
          i.categoryName.toLowerCase().includes(q)
      );
    }

    const isGlobalShortlistLocked = (shortlistsData || []).some((s) => s.is_locked);

    return {
      success: true,
      items: filteredItems,
      stats: {
        totalJuryReview: items.length,
        totalFullyEvaluated: fullyEvaluatedCount,
        totalShortlisted: totalShortlistedCount,
        isShortlistLocked: isGlobalShortlistLocked,
        lockedAt: lockCheck?.locked_at || undefined,
        lockedByName,
        totalCategories: categories.length,
      },
      categories,
    };
  } catch (err: any) {
    console.error("Exception in getShortlistingWorkspaceData:", err);
    return {
      success: false,
      error: err.message || "Failed to load shortlisting workspace.",
      items: [],
      stats: {
        totalJuryReview: 0,
        totalFullyEvaluated: 0,
        totalShortlisted: 0,
        isShortlistLocked: false,
        totalCategories: 0,
      },
      categories: [],
    };
  }
}

/**
 * Designates an evaluated application for the official shortlist.
 * Transitions application status to 'shortlisted', inserts record into application_shortlists,
 * and records an entry in the audit trail.
 */
export async function addToShortlist(
  applicationId: string,
  deliberationNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required to shortlist." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Check if the shortlist is globally locked
    const { data: lockCheck } = await adminClient
      .from("application_shortlists")
      .select("id, is_locked")
      .eq("edition_id", CURRENT_EDITION_ID)
      .eq("is_locked", true)
      .limit(1)
      .maybeSingle();

    if (lockCheck?.is_locked) {
      return {
        success: false,
        error: "Action Blocked: The 2026 Shortlist is officially LOCKED. Further additions require authorization to reopen.",
      };
    }

    // 2. Verify application exists and is in a valid state
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select("id, nomination_id, status, edition_id, category_id, project_name, applicant_id, categories(name)")
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    if (app.status === "rejected" || app.status === "disqualified") {
      return {
        success: false,
        error: `Cannot shortlist an application that is currently ${app.status.toUpperCase()}.`,
      };
    }

    if (app.status !== "jury_review" && app.status !== "shortlisted") {
      return {
        success: false,
        error: `Application must be in 'jury_review' status to enter the shortlist (current status: ${app.status}).`,
      };
    }

    const now = new Date().toISOString();

    // 3. Upsert into application_shortlists
    const { error: slErr } = await adminClient.from("application_shortlists").upsert(
      {
        application_id: app.id,
        edition_id: app.edition_id,
        category_id: app.category_id,
        shortlisted_by: session.user.id,
        decision_notes: deliberationNotes?.trim() || null,
        deliberation_notes: deliberationNotes?.trim() || null,
        is_locked: false,
        updated_at: now,
      },
      { onConflict: "application_id" }
    );

    if (slErr) {
      console.error("Error inserting into application_shortlists:", slErr);
      return { success: false, error: `Failed to save shortlist record: ${slErr.message}` };
    }

    // 4. Update application status to 'shortlisted' if not already
    if (app.status !== "shortlisted") {
      await adminClient
        .from("applications")
        .update({ status: "shortlisted", updated_at: now })
        .eq("id", app.id);

      // Record in application_status_history
      await adminClient.from("application_status_history").insert({
        application_id: app.id,
        from_status: app.status,
        to_status: "shortlisted",
        changed_by: session.user.id,
        comments: deliberationNotes || "Selected for official award shortlist by committee.",
        created_at: now,
      });
    }

    // 5. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "shortlist_entry_added",
      entity_type: "application",
      entity_id: app.id,
      new_values: {
        nominationId: app.nomination_id,
        projectName: app.project_name,
        deliberationNotes,
      },
      created_at: now,
    });

    // Phase F: Shortlist Announcement Notification (Email + In-App, idempotent)
    if (app.applicant_id) {
      sendNotification({
        eventType: "nomination_shortlisted",
        recipientUserId: app.applicant_id,
        applicationId: app.id,
        nominationId: app.nomination_id,
        data: {
          projectName: app.project_name,
          categoryName: (app.categories as any)?.name,
        },
        idempotencyKey: `nomination_shortlisted:${app.id}`,
        channels: ["email", "in_app"],
      }).catch((err) => console.error("Shortlist notification notice:", err));
    }

    revalidatePath("/admin/shortlisting");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in addToShortlist:", err);
    return { success: false, error: err.message || "Failed to shortlist application." };
  }
}

/**
 * Removes an application from the shortlist before lock.
 * Transitions application status back to 'jury_review', removes from application_shortlists,
 * and records in the audit trail.
 */
export async function removeFromShortlist(
  applicationId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Check if shortlist is locked
    const { data: sl } = await adminClient
      .from("application_shortlists")
      .select("id, is_locked")
      .eq("application_id", applicationId)
      .maybeSingle();

    if (sl?.is_locked) {
      return {
        success: false,
        error: "Action Blocked: Shortlist is officially locked. Cannot remove candidates from a locked shortlist.",
      };
    }

    const { data: app } = await adminClient
      .from("applications")
      .select("id, nomination_id, status, project_name")
      .eq("id", applicationId)
      .single();

    if (!app) {
      return { success: false, error: "Application not found." };
    }

    const now = new Date().toISOString();

    // 2. Delete shortlist record
    await adminClient.from("application_shortlists").delete().eq("application_id", applicationId);

    // 3. Revert application status back to 'jury_review'
    if (app.status === "shortlisted") {
      await adminClient
        .from("applications")
        .update({ status: "jury_review", updated_at: now })
        .eq("id", app.id);

      await adminClient.from("application_status_history").insert({
        application_id: app.id,
        from_status: "shortlisted",
        to_status: "jury_review",
        changed_by: session.user.id,
        comments: reason || "Removed from shortlist; returned to jury review.",
        created_at: now,
      });
    }

    // 4. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "shortlist_entry_removed",
      entity_type: "application",
      entity_id: app.id,
      new_values: {
        nominationId: app.nomination_id,
        reason: reason || "Removed from shortlist",
      },
      created_at: now,
    });

    revalidatePath("/admin/shortlisting");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in removeFromShortlist:", err);
    return { success: false, error: err.message || "Failed to remove application from shortlist." };
  }
}

/**
 * Permanently locks the shortlist for the edition.
 * Enforces that no further casual modifications can occur without formal reopening.
 */
export async function lockShortlist(
  editionId: string = CURRENT_EDITION_ID,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required to lock shortlist." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Verify there are entries in the shortlist
    const { count, error: countErr } = await adminClient
      .from("application_shortlists")
      .select("id", { count: "exact", head: true })
      .eq("edition_id", editionId);

    if (countErr || !count || count === 0) {
      return {
        success: false,
        error: "Cannot lock an empty shortlist. Please select qualifying entries before locking.",
      };
    }

    const now = new Date().toISOString();

    // 2. Lock all shortlist records
    const { error: lockErr } = await adminClient
      .from("application_shortlists")
      .update({
        is_locked: true,
        locked_at: now,
        locked_by: session.user.id,
        updated_at: now,
      })
      .eq("edition_id", editionId);

    if (lockErr) {
      return { success: false, error: `Failed to lock shortlist: ${lockErr.message}` };
    }

    // 3. Record in audit trail
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "shortlist_locked",
      entity_type: "award_edition",
      entity_id: editionId,
      new_values: {
        shortlistedCount: count,
        lockedBy: session.user.fullName,
        notes: notes || "Shortlist locked officially by Awards Committee.",
      },
      created_at: now,
    });

    revalidatePath("/admin/shortlisting");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in lockShortlist:", err);
    return { success: false, error: err.message || "Failed to lock shortlist." };
  }
}

/**
 * Reopens a locked shortlist (Super Admin exclusive override).
 */
export async function unlockShortlist(
  editionId: string = CURRENT_EDITION_ID,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isSuperAdmin) {
    return {
      success: false,
      error: "Permission Denied: Only a Super Administrator may reopen a locked shortlist.",
    };
  }

  if (!reason?.trim()) {
    return { success: false, error: "An explanatory reason is mandatory to reopen the shortlist." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    await adminClient
      .from("application_shortlists")
      .update({
        is_locked: false,
        locked_at: null,
        locked_by: null,
        updated_at: now,
      })
      .eq("edition_id", editionId);

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "shortlist_unlocked",
      entity_type: "award_edition",
      entity_id: editionId,
      new_values: { reason, unlockedBy: session.user.fullName },
      created_at: now,
    });

    revalidatePath("/admin/shortlisting");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in unlockShortlist:", err);
    return { success: false, error: err.message || "Failed to reopen shortlist." };
  }
}

/**
 * Fetches the complete Final Deliberation Dossier for an application.
 * Includes project metadata, category questionnaire, media documents (with signed URLs),
 * confidential jury evaluations across all 5 criteria, and qualitative recommendation synthesis.
 */
export async function getFinalDeliberationDossier(
  applicationId: string
): Promise<{ success: boolean; error?: string; dossier?: FinalDeliberationDossier }> {
  const session = await getAdminSession();
  if (!session || (!session.isAdmin && !session.isVerificationTeam)) {
    return { success: false, error: "Unauthorized: Administrator credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch application, user & category
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        project_name,
        category_id,
        applicant_id,
        project_city,
        project_state,
        built_up_area_sqft,
        project_completion_date,
        status,
        users:applicant_id(
          id,
          full_name,
          email,
          phone
        ),
        categories(
          id,
          name,
          code,
          slug
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return { success: false, error: "Application dossier not found." };
    }

    // Fetch applicant profile for organization
    const { data: applicantProfile } = await adminClient
      .from("applicant_profiles")
      .select("organization_name")
      .eq("user_id", app.applicant_id)
      .maybeSingle();

    // 2. Fetch shortlist info
    const { data: slInfo } = await adminClient
      .from("application_shortlists")
      .select(`
        id,
        is_locked,
        locked_at,
        decision_notes,
        deliberation_notes,
        users:shortlisted_by(id, full_name)
      `)
      .eq("application_id", applicationId)
      .maybeSingle();

    // 3. Fetch dynamic questionnaire questions and answers
    const [qRes, aRes] = await Promise.all([
      adminClient
        .from("category_questions")
        .select("id, question_key, question_text, help_text, display_order")
        .eq("category_id", app.category_id)
        .eq("is_active", true)
        .order("display_order"),
      adminClient
        .from("application_answers")
        .select("question_id, answer_text, answer_number, answer_json")
        .eq("application_id", applicationId),
    ]);

    const answersMap = new Map<string, any>();
    ((aRes.data || []) as any[]).forEach((a) => {
      const val = a.answer_text ?? a.answer_number ?? a.answer_json ?? "";
      answersMap.set(a.question_id, val);
    });

    const dynamicQuestions = (qRes.data || []).map((q) => ({
      id: q.id,
      questionKey: q.question_key,
      questionText: q.question_text,
      helpText: q.help_text || undefined,
      answer: answersMap.has(q.id)
        ? typeof answersMap.get(q.id) === "object"
          ? JSON.stringify(answersMap.get(q.id))
          : String(answersMap.get(q.id))
        : "Not answered",
    }));

    // 4. Fetch uploaded media files and generate signed URLs
    const { data: rawFiles } = await adminClient
      .from("application_files")
      .select("id, upload_type, caption, original_filename, storage_path, mime_type, file_size_bytes")
      .eq("application_id", applicationId);

    const files = await Promise.all(
      (rawFiles || []).map(async (f) => {
        let signedUrl: string | undefined;
        if (f.storage_path) {
          const { data: signed } = await adminClient.storage
            .from("nomination-files")
            .createSignedUrl(f.storage_path, 3600);
          signedUrl = signed?.signedUrl;
        }

        return {
          id: f.id,
          uploadType: f.upload_type,
          title: f.caption || f.original_filename || f.upload_type,
          description: f.caption || undefined,
          signedUrl,
          mimeType: f.mime_type || "application/octet-stream",
          fileSizeBytes: f.file_size_bytes || undefined,
        };
      })
    );

    // 5. Fetch all jury assignments, evaluations and qualitative scores
    const { data: assignments } = await adminClient
      .from("jury_assignments")
      .select(`
        id,
        status,
        conflict_declared,
        conflict_reason,
        jury_profiles(
          id,
          designation,
          organization,
          users(full_name)
        ),
        jury_evaluations(
          id,
          status,
          is_locked,
          recommendation,
          submitted_at,
          strengths,
          areas_of_concern,
          general_comment,
          jury_scores(
            criterion_id,
            qualitative_rating,
            confidential_comment,
            scoring_criteria(title)
          )
        )
      `)
      .eq("application_id", applicationId);

    const recommendationCounts: Record<string, number> = {};
    const criteriaRatings: Record<string, Record<string, number>> = {};
    const consolidatedStrengths: string[] = [];
    const consolidatedConcerns: string[] = [];

    const evaluations: JurorEvaluationSummary[] = (assignments || []).map((asgn: any) => {
      const jp = asgn.jury_profiles;
      const jpUser = Array.isArray(jp?.users) ? jp.users[0] : jp?.users;
      const jurorName = jpUser?.full_name || jp?.full_name || "Jury Panelist";
      const evals = asgn.jury_evaluations;
      const evaluation = Array.isArray(evals) ? evals[0] : evals;

      if (evaluation?.recommendation) {
        recommendationCounts[evaluation.recommendation] =
          (recommendationCounts[evaluation.recommendation] || 0) + 1;
      }

      if (evaluation?.strengths?.trim()) {
        consolidatedStrengths.push(evaluation.strengths.trim());
      }
      if (evaluation?.areas_of_concern?.trim()) {
        consolidatedConcerns.push(evaluation.areas_of_concern.trim());
      }

      const scores = (evaluation?.jury_scores || []).map((sc: any) => {
        const critTitle = sc.scoring_criteria?.title || "Criterion";
        const rating = sc.qualitative_rating || "Unrated";

        if (!criteriaRatings[critTitle]) criteriaRatings[critTitle] = {};
        criteriaRatings[critTitle][rating] = (criteriaRatings[critTitle][rating] || 0) + 1;

        return {
          criterionId: sc.criterion_id,
          criterionTitle: critTitle,
          qualitativeRating: rating,
          confidentialComment: sc.confidential_comment || undefined,
        };
      });

      return {
        assignmentId: asgn.id,
        jurorId: jp?.id || asgn.id,
        jurorName,
        jurorDesignation: jp?.designation || undefined,
        jurorOrganization: jp?.organization || undefined,
        status: asgn.status,
        conflictDeclared: asgn.conflict_declared,
        conflictReason: asgn.conflict_reason || undefined,
        recommendation: evaluation?.recommendation || undefined,
        submittedAt: evaluation?.submitted_at || undefined,
        strengths: evaluation?.strengths || undefined,
        areasOfConcern: evaluation?.areas_of_concern || undefined,
        generalComment: evaluation?.general_comment || undefined,
        scores,
      };
    });

    // 6. Fetch winner record if exists
    const { data: rawWinner } = await adminClient
      .from("winners")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();

    let winnerRecord = null;
    if (rawWinner) {
      const catObj = Array.isArray(app.categories) ? app.categories[0] : app.categories;
      winnerRecord = {
        id: rawWinner.id,
        applicationId: rawWinner.application_id,
        editionId: rawWinner.edition_id,
        categoryId: rawWinner.category_id,
        categoryCode: catObj?.code || "",
        categoryName: catObj?.name || "",
        awardTitle: rawWinner.award_title,
        winnerType: (rawWinner.winner_type as WinnerType) || "winner",
        winnerTitle: rawWinner.winner_title || rawWinner.award_title,
        projectName: rawWinner.project_name || app.project_name,
        entrantName: rawWinner.entrant_name || "",
        organizationName: rawWinner.organization_name || "",
        projectLocation: rawWinner.project_location || `${app.project_city}, ${app.project_state}`,
        summaryDescription: rawWinner.summary_description || "",
        citation: rawWinner.citation || "",
        projectStory: rawWinner.project_story || "",
        heroImageUrl: rawWinner.hero_image_url || "",
        galleryUrls: rawWinner.gallery_urls || [],
        publicationStatus: (rawWinner.publication_status as PublicationStatus) || "draft",
        isPublished: rawWinner.is_published,
        publishedAt: rawWinner.published_at,
        isFeatured: rawWinner.is_featured || false,
        displayOrder: rawWinner.display_order || 1,
        nominationId: app.nomination_id,
        createdAt: rawWinner.created_at,
        updatedAt: rawWinner.updated_at,
      };
    }

    const catObj = Array.isArray(app.categories) ? app.categories[0] : app.categories;
    const userObj = Array.isArray(app.users) ? app.users[0] : app.users;

    return {
      success: true,
      dossier: {
        application: {
          id: app.id,
          nominationId: app.nomination_id,
          projectName: app.project_name,
          category: {
            id: catObj?.id || app.category_id,
            name: catObj?.name || "",
            code: catObj?.code || "",
            slug: catObj?.slug || "",
          },
          applicant: {
            name: userObj?.full_name || "Applicant",
            organization: applicantProfile?.organization_name || "",
            email: userObj?.email || "",
            phone: userObj?.phone || "",
          },
          projectCity: app.project_city,
          projectState: app.project_state,
          builtUpAreaSqft: app.built_up_area_sqft,
          projectCompletionDate: app.project_completion_date,
          status: app.status,
        },
        shortlistInfo: slInfo
          ? {
              id: slInfo.id,
              isLocked: slInfo.is_locked,
              lockedAt: slInfo.locked_at || undefined,
              shortlistedBy: ((slInfo as any)?.users?.full_name as string) || undefined,
              deliberationNotes: slInfo.deliberation_notes || slInfo.decision_notes || undefined,
            }
          : undefined,
        dynamicQuestions,
        files,
        evaluations,
        synthesis: {
          totalEvaluations: evaluations.filter((e) => e.submittedAt).length,
          recommendationCounts,
          criteriaRatings,
          consolidatedStrengths,
          consolidatedConcerns,
        },
        winnerRecord,
      },
    };
  } catch (err: any) {
    console.error("Exception in getFinalDeliberationDossier:", err);
    return { success: false, error: err.message || "Failed to load deliberation dossier." };
  }
}

/**
 * Saves or updates deliberation notes for an entry.
 */
export async function updateDeliberationNotes(
  applicationId: string,
  deliberationNotes: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("application_shortlists")
      .update({
        deliberation_notes: deliberationNotes.trim(),
        decision_notes: deliberationNotes.trim(),
        updated_at: now,
      })
      .eq("application_id", applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "deliberation_notes_updated",
      entity_type: "application_shortlist",
      entity_id: applicationId,
      new_values: { deliberationNotes: deliberationNotes.trim() },
      created_at: now,
    });

    revalidatePath(`/admin/shortlisting/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateDeliberationNotes:", err);
    return { success: false, error: err.message || "Failed to update deliberation notes." };
  }
}
