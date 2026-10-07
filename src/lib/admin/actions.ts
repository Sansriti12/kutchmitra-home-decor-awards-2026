"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import type { RoleId } from "@/types/database.types";
import { sendNotification } from "@/lib/notifications/notification-service";

export interface GetAdminApplicationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?:
    | "created_at"
    | "submitted_at"
    | "nomination_id"
    | "project_name"
    | "status"
    | "project_city";
  sortOrder?: "asc" | "desc";
}

export interface AdminApplicationSummaryItem {
  id: string;
  nomination_id: string;
  edition_id: string;
  category_id: string;
  applicant_id: string;
  project_name: string;
  project_city: string;
  project_state: string;
  project_completion_date: string | null;
  built_up_area_sqft: number | null;
  status: string;
  is_locked: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    code: string;
    name: string;
    slug: string;
  } | null;
  applicant: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    organization_name?: string | null;
  } | null;
}

export interface StatusCounts {
  total: number;
  draft: number;
  submitted: number;
  under_verification: number;
  clarification_required: number;
  eligible: number;
  jury_review: number;
  shortlisted: number;
  winner: number;
  rejected: number;
  disqualified: number;
}

export interface AdminApplicationsResult {
  success: boolean;
  error?: string;
  applications: AdminApplicationSummaryItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  statusCounts: StatusCounts;
}

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  created_at: "created_at",
  submitted_at: "submitted_at",
  nomination_id: "nomination_id",
  project_name: "project_name",
  status: "status",
  project_city: "project_city",
};

/**
 * Server action to fetch paginated, filtered, searched, and sorted applications for the Admin panel.
 * Protected by getAdminSession().
 */
export async function getAdminApplications(
  params: GetAdminApplicationsParams = {}
): Promise<AdminApplicationsResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      success: false,
      error: "Unauthorized: Admin privileges required.",
      applications: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
      statusCounts: {
        total: 0,
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
      },
    };
  }

  const adminClient = createAdminClient();
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
  const sortBy = ALLOWED_SORT_COLUMNS[params.sortBy || ""] || "created_at";
  const sortAscending = params.sortOrder === "asc";

  try {
    // 1. Fetch total status counts across entire dataset for KPI cards
    const { data: allStatuses, error: statusErr } = await adminClient
      .from("applications")
      .select("status");

    const counts: StatusCounts = {
      total: 0,
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

    if (!statusErr && allStatuses) {
      counts.total = allStatuses.length;
      allStatuses.forEach((r) => {
        const s = r.status as keyof Omit<StatusCounts, "total">;
        if (s in counts) {
          counts[s]++;
        }
      });
    }

    // 2. Build the main query with joins
    let query = adminClient
      .from("applications")
      .select(
        `
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
        categories(id, code, name, slug),
        users:applicant_id(id, full_name, email, phone)
      `,
        { count: "exact" }
      );

    // Filter by Category
    if (params.category && params.category !== "all") {
      query = query.eq("category_id", params.category);
    }

    // Filter by Status
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    // Search query: filters across nomination_id, project_name, or project_city
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query = query.or(
        `nomination_id.ilike.%${term}%,project_name.ilike.%${term}%,project_city.ilike.%${term}%`
      );
    }

    // Order and paginate
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    query = query.order(sortBy, { ascending: sortAscending }).range(fromIndex, toIndex);

    const { data: rows, count: totalCount, error } = await query;

    if (error) {
      console.error("Admin applications query error:", error);
      return {
        success: false,
        error: error.message,
        applications: [],
        pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize },
        statusCounts: counts,
      };
    }

    // Also fetch applicant profile organizations if available
    const applicantIds = Array.from(
      new Set((rows || []).map((r: any) => r.applicant_id).filter(Boolean))
    );

    let orgMap = new Map<string, string>();
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

    const applications: AdminApplicationSummaryItem[] = (rows || []).map((r: any) => {
      const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;
      const usr = Array.isArray(r.users) ? r.users[0] : r.users;
      return {
        id: r.id,
        nomination_id: r.nomination_id,
        edition_id: r.edition_id,
        category_id: r.category_id,
        applicant_id: r.applicant_id,
        project_name: r.project_name,
        project_city: r.project_city,
        project_state: r.project_state,
        project_completion_date: r.project_completion_date,
        built_up_area_sqft: r.built_up_area_sqft ? Number(r.built_up_area_sqft) : null,
        status: r.status,
        is_locked: r.is_locked,
        submitted_at: r.submitted_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
        category: cat
          ? {
              id: cat.id,
              code: cat.code,
              name: cat.name,
              slug: cat.slug,
            }
          : null,
        applicant: usr
          ? {
              id: usr.id,
              full_name: usr.full_name || "Applicant",
              email: usr.email || "",
              phone: usr.phone || null,
              organization_name: orgMap.get(usr.id) || null,
            }
          : null,
      };
    });

    const totalRecords = totalCount ?? 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      success: true,
      applications,
      pagination: {
        totalCount: totalRecords,
        totalPages,
        currentPage: page,
        pageSize,
      },
      statusCounts: counts,
    };
  } catch (err: any) {
    console.error("Exception in getAdminApplications:", err);
    return {
      success: false,
      error: err?.message || "Failed to query applications.",
      applications: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize },
      statusCounts: {
        total: 0,
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
      },
    };
  }
}

export interface AdminDossierFileItem {
  id: string;
  application_id: string;
  upload_requirement_id: string | null;
  upload_type: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  caption: string | null;
  is_cover: boolean;
  created_at: string;
  signedUrl?: string | null;
  requirementTitle?: string | null;
}

export interface AdminDossierQuestionAnswer {
  questionId: string;
  questionKey: string;
  questionText: string;
  helpText: string | null;
  fieldType: string;
  isRequired: boolean;
  displayOrder: number;
  answerText: string | null;
  answerNumber: number | null;
  answerJson: any;
  options: { label: string; value: string }[];
}

export interface AdminClarificationItem {
  id: string;
  applicationId: string;
  requestedBy: string;
  requesterName?: string;
  applicantMessage: string;
  internalNote: string | null;
  status: "pending" | "resolved" | "expired";
  dueDate: string | null;
  responseText: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNoteItem {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  noteText: string;
  createdAt: string;
}

export interface StatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  changerName?: string;
  comments: string | null;
  createdAt: string;
}

export interface AllowedStatusTransition {
  toStatus: string;
  allowedRole: string;
}

export interface AdminApplicationDossierResult {
  success: boolean;
  error?: string;
  application?: any;
  applicant?: any;
  category?: any;
  questionsAndAnswers?: AdminDossierQuestionAnswer[];
  files?: AdminDossierFileItem[];
  clarifications?: AdminClarificationItem[];
  adminNotes?: AdminNoteItem[];
  statusHistory?: StatusHistoryItem[];
  allowedTransitions?: AllowedStatusTransition[];
  currentRoleAccess?: {
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isVerificationTeam: boolean;
  };
}

/**
 * Server action to fetch complete application dossier for an administrator.
 * Generates signed URLs for private files and validates allowed status transitions.
 */
export async function getAdminApplicationDossier(
  applicationId: string
): Promise<AdminApplicationDossierResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch application details
    const { data: application, error: appErr } = await adminClient
      .from("applications")
      .select(`
        *,
        categories(id, code, name, slug, short_description, eligibility_criteria),
        users:applicant_id(id, full_name, email, phone)
      `)
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !application) {
      return { success: false, error: "Application not found." };
    }

    const cat = Array.isArray(application.categories)
      ? application.categories[0]
      : application.categories;
    const usr = Array.isArray(application.users) ? application.users[0] : application.users;

    // 2. Fetch parallel dossier data
    const [
      profileRes,
      questionsRes,
      optionsRes,
      answersRes,
      filesRes,
      reqsRes,
      clarifsRes,
      notesRes,
      statusHistRes,
      transitionsRes,
      auditNotesRes,
    ] = await Promise.all([
      adminClient
        .from("applicant_profiles")
        .select("*")
        .eq("user_id", application.applicant_id)
        .maybeSingle(),
      adminClient
        .from("category_questions")
        .select("*")
        .eq("category_id", application.category_id)
        .eq("is_active", true)
        .order("display_order"),
      adminClient
        .from("question_options")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      adminClient
        .from("application_answers")
        .select("*")
        .eq("application_id", applicationId),
      adminClient
        .from("application_files")
        .select("*")
        .eq("application_id", applicationId)
        .order("display_order")
        .order("created_at", { ascending: false }),
      adminClient
        .from("category_upload_requirements")
        .select("*")
        .eq("category_id", application.category_id)
        .eq("is_active", true)
        .order("display_order"),
      adminClient
        .from("clarification_requests")
        .select("*, users:requested_by(full_name, email)")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
      (adminClient.from as any)("admin_notes")
        .select("*, users:author_id(full_name, email)")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
      adminClient
        .from("application_status_history")
        .select("*, users:changed_by(full_name, email)")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true }),
      adminClient
        .from("status_transitions")
        .select("to_status, allowed_role")
        .eq("from_status", application.status),
      adminClient
        .from("audit_logs")
        .select("*, users:actor_id(full_name, email)")
        .eq("entity_id", applicationId)
        .eq("entity_type", "application_admin_note")
        .order("created_at", { ascending: false }),
    ]);

    const profile = profileRes.data || null;
    const questions = questionsRes.data || [];
    const options = optionsRes.data || [];
    const answers = answersRes.data || [];
    const rawFiles = filesRes.data || [];
    const requirements = reqsRes.data || [];
    const clarifications = clarifsRes.data || [];
    const statusHistory = statusHistRes.data || [];
    const rawTransitions = transitionsRes.data || [];

    // Map question options
    const optionsMap = new Map<string, { label: string; value: string }[]>();
    options.forEach((opt: any) => {
      const list = optionsMap.get(opt.question_id) || [];
      list.push({ label: opt.label, value: opt.value });
      optionsMap.set(opt.question_id, list);
    });

    // Map answers by question_id
    const answersMap = new Map<string, any>();
    answers.forEach((ans: any) => {
      answersMap.set(ans.question_id, ans);
    });

    const questionsAndAnswers: AdminDossierQuestionAnswer[] = questions.map((q: any) => {
      const ans = answersMap.get(q.id);
      return {
        questionId: q.id,
        questionKey: q.question_key,
        questionText: q.question_text,
        helpText: q.help_text,
        fieldType: q.field_type,
        isRequired: q.is_required,
        displayOrder: q.display_order,
        answerText: ans ? ans.answer_text : null,
        answerNumber: ans ? ans.answer_number : null,
        answerJson: ans ? ans.answer_json : null,
        options: optionsMap.get(q.id) || [],
      };
    });

    // Map upload requirements by id
    const reqsMap = new Map<string, string>();
    requirements.forEach((req: any) => {
      reqsMap.set(req.id, req.title);
    });

    // Generate signed URLs for private files (valid for 1 hour)
    const filesWithSignedUrls: AdminDossierFileItem[] = await Promise.all(
      rawFiles.map(async (file: any) => {
        let signedUrl: string | null = null;
        try {
          const { data: urlData } = await adminClient.storage
            .from("application-files")
            .createSignedUrl(file.storage_path, 3600);
          signedUrl = urlData?.signedUrl || null;
        } catch (storageErr) {
          console.error("Error generating signed URL for", file.storage_path, storageErr);
        }

        return {
          id: file.id,
          application_id: file.application_id,
          upload_requirement_id: file.upload_requirement_id,
          upload_type: file.upload_type,
          original_filename: file.original_filename,
          storage_path: file.storage_path,
          mime_type: file.mime_type,
          file_size_bytes: Number(file.file_size_bytes),
          caption: file.caption,
          is_cover: file.is_cover,
          created_at: file.created_at,
          signedUrl,
          requirementTitle: file.upload_requirement_id
            ? reqsMap.get(file.upload_requirement_id) || file.upload_type
            : file.upload_type,
        };
      })
    );

    // Map clarifications
    const formattedClarifications: AdminClarificationItem[] = clarifications.map((c: any) => {
      const reqUsr = Array.isArray(c.users) ? c.users[0] : c.users;
      return {
        id: c.id,
        applicationId: c.application_id,
        requestedBy: c.requested_by,
        requesterName: reqUsr?.full_name || reqUsr?.email || "Verification Officer",
        applicantMessage: c.applicant_message,
        internalNote: c.internal_note,
        status: c.status,
        dueDate: c.due_date,
        responseText: c.response_text,
        respondedAt: c.responded_at,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      };
    });

    // Map internal notes (combining admin_notes table and audit_logs fallback)
    const formattedNotes: AdminNoteItem[] = [];

    // From admin_notes table if present
    if (!notesRes.error && notesRes.data) {
      notesRes.data.forEach((n: any) => {
        const author = Array.isArray(n.users) ? n.users[0] : n.users;
        formattedNotes.push({
          id: n.id,
          applicationId: n.application_id,
          authorId: n.author_id,
          authorName: author?.full_name || "Admin",
          authorEmail: author?.email || "",
          noteText: n.note_text,
          createdAt: n.created_at,
        });
      });
    }

    // From audit_logs fallback notes
    if (auditNotesRes.data && auditNotesRes.data.length > 0) {
      auditNotesRes.data.forEach((an: any) => {
        const actor = Array.isArray(an.users) ? an.users[0] : an.users;
        const notePayload = an.new_values || {};
        // Avoid duplicate if it has same id
        if (!formattedNotes.some((n) => n.id === an.id || n.id === notePayload.id)) {
          formattedNotes.push({
            id: an.id,
            applicationId: an.entity_id,
            authorId: an.actor_id,
            authorName: notePayload.author_name || actor?.full_name || "Admin",
            authorEmail: notePayload.author_email || actor?.email || "",
            noteText: notePayload.note_text || "",
            createdAt: an.created_at,
          });
        }
      });
    }

    // Sort notes newest first
    formattedNotes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Map status history
    const formattedStatusHistory: StatusHistoryItem[] = statusHistory.map((h: any) => {
      const changer = Array.isArray(h.users) ? h.users[0] : h.users;
      return {
        id: h.id,
        fromStatus: h.from_status,
        toStatus: h.to_status,
        changedBy: h.changed_by,
        changerName: changer?.full_name || changer?.email || "System",
        comments: h.comments,
        createdAt: h.created_at,
      };
    });

    // Allowed status transitions for this application based on role matrix
    const userRoles = session.roles;
    const isSuperAdmin = session.isSuperAdmin;
    const isAdmin = session.isAdmin;
    const isVerificationTeam = session.isVerificationTeam;

    const allowedTransitions: AllowedStatusTransition[] = rawTransitions
      .filter((t: any) => {
        if (isSuperAdmin) return true;
        if (isAdmin && (t.allowed_role === "admin" || t.allowed_role === "verification_team")) {
          return true;
        }
        if (isVerificationTeam && t.allowed_role === "verification_team") {
          return true;
        }
        return false;
      })
      .map((t: any) => ({
        toStatus: t.to_status,
        allowedRole: t.allowed_role,
      }));

    return {
      success: true,
      application: {
        id: application.id,
        nomination_id: application.nomination_id,
        edition_id: application.edition_id,
        category_id: application.category_id,
        applicant_id: application.applicant_id,
        project_name: application.project_name,
        project_city: application.project_city,
        project_state: application.project_state,
        project_completion_date: application.project_completion_date,
        built_up_area_sqft: application.built_up_area_sqft
          ? Number(application.built_up_area_sqft)
          : null,
        status: application.status,
        current_wizard_step: application.current_wizard_step,
        declaration_accepted: application.declaration_accepted,
        declaration_accepted_at: application.declaration_accepted_at,
        submitted_at: application.submitted_at,
        is_locked: application.is_locked,
        created_at: application.created_at,
        updated_at: application.updated_at,
      },
      applicant: {
        id: usr?.id || application.applicant_id,
        fullName: usr?.full_name || "Applicant",
        email: usr?.email || "",
        phone: usr?.phone || null,
        organizationName: profile?.organization_name || null,
        designation: profile?.designation || null,
        city: profile?.city || application.project_city,
        state: profile?.state || application.project_state,
        postalCode: profile?.postal_code || null,
        addressLine: profile?.address_line || null,
        websiteUrl: profile?.website_url || null,
        portfolioUrl: profile?.portfolio_url || null,
      },
      category: cat || null,
      questionsAndAnswers,
      files: filesWithSignedUrls,
      clarifications: formattedClarifications,
      adminNotes: formattedNotes,
      statusHistory: formattedStatusHistory,
      allowedTransitions,
      currentRoleAccess: {
        isSuperAdmin,
        isAdmin,
        isVerificationTeam,
      },
    };
  } catch (err: any) {
    console.error("Exception in getAdminApplicationDossier:", err);
    return {
      success: false,
      error: err?.message || "Failed to load application dossier.",
    };
  }
}

/**
 * Server action to update an application's workflow status.
 * Validates transition rules against the `status_transitions` table in database.
 * Logs status change to `application_status_history` and `audit_logs`.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  comments?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch current application state
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select("id, nomination_id, status, applicant_id, project_name, categories(name)")
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    if (app.status === newStatus) {
      return { success: true };
    }

    // 2. Validate transition against status_transitions table
    const { data: transitions, error: transErr } = await adminClient
      .from("status_transitions")
      .select("allowed_role")
      .eq("from_status", app.status)
      .eq("to_status", newStatus);

    if (transErr || !transitions || transitions.length === 0) {
      return {
        success: false,
        error: `Workflow Error: Transition from status '${app.status}' to '${newStatus}' is not permitted by the award workflow rules.`,
      };
    }

    // 3. Verify user's role authorization
    const isSuperAdmin = session.isSuperAdmin;
    const isAdmin = session.isAdmin;
    const isVerificationTeam = session.isVerificationTeam;

    const rolePermitted = transitions.some((t: any) => {
      if (isSuperAdmin) return true;
      if (isAdmin && (t.allowed_role === "admin" || t.allowed_role === "verification_team")) {
        return true;
      }
      if (isVerificationTeam && t.allowed_role === "verification_team") {
        return true;
      }
      return false;
    });

    if (!rolePermitted) {
      return {
        success: false,
        error: `Permission Denied: Your assigned role does not have authorization to transition an application from '${app.status}' to '${newStatus}'.`,
      };
    }

    // 4. Perform application status update
    const now = new Date().toISOString();
    const isLocked = newStatus !== "draft" && newStatus !== "clarification_required";

    const { error: updateErr } = await adminClient
      .from("applications")
      .update({
        status: newStatus,
        is_locked: isLocked,
        updated_at: now,
      })
      .eq("id", applicationId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 5. Record entry in application_status_history
    await adminClient.from("application_status_history").insert({
      application_id: applicationId,
      from_status: app.status,
      to_status: newStatus,
      changed_by: session.user.id,
      comments: comments || null,
      created_at: now,
    });

    // 6. Record immutable entry in audit_logs
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "application_status_change",
      entity_type: "application",
      entity_id: applicationId,
      old_values: { status: app.status },
      new_values: { status: newStatus, comments: comments || null },
      created_at: now,
    });

    // Phase F: Applicant Notification upon relevant status changes (idempotent, non-blocking)
    if (app.applicant_id) {
      if (newStatus === "eligible") {
        sendNotification({
          eventType: "nomination_eligible",
          recipientUserId: app.applicant_id,
          applicationId,
          nominationId: app.nomination_id,
          data: {
            projectName: app.project_name,
            categoryName: (app.categories as any)?.name,
          },
          idempotencyKey: `nomination_eligible:${applicationId}`,
          channels: ["email", "in_app"],
        }).catch((err) => console.error("Eligible notification notice:", err));
      } else if (["under_verification", "rejected", "disqualified"].includes(newStatus)) {
        sendNotification({
          eventType: "nomination_status_changed",
          recipientUserId: app.applicant_id,
          applicationId,
          nominationId: app.nomination_id,
          data: {
            projectName: app.project_name,
            statusLabel: newStatus.replace(/_/g, " ").toUpperCase(),
          },
          idempotencyKey: `status_change:${applicationId}:${newStatus}`,
          channels: ["email", "in_app"],
        }).catch((err) => console.error("Status change notification notice:", err));
      }
    }

    // 7. Revalidate relevant Next.js routes
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/nominations/${applicationId}`);

    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateApplicationStatus:", err);
    return { success: false, error: err?.message || "Failed to update application status." };
  }
}

/**
 * Server action to issue a formal clarification request to the applicant.
 * Persists the request in `clarification_requests`, transitions application status
 * to `clarification_required`, unlocks the application for applicant editing,
 * and logs to `application_status_history` and `audit_logs`.
 */
export async function requestApplicationClarification(
  applicationId: string,
  applicantMessage: string,
  internalNote?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!applicantMessage || applicantMessage.trim() === "") {
    return {
      success: false,
      error: "Clarification message for the applicant is mandatory.",
    };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch current application state
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select("id, nomination_id, status, applicant_id, project_name")
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    // 2. Validate current status allows clarification request
    // Allowed from 'under_verification' (or 'submitted' by first starting verification)
    let currentStatus = app.status;
    const now = new Date().toISOString();

    if (currentStatus === "submitted") {
      // Auto-transition to under_verification first per workflow
      await adminClient
        .from("applications")
        .update({ status: "under_verification", updated_at: now })
        .eq("id", applicationId);

      await adminClient.from("application_status_history").insert({
        application_id: applicationId,
        from_status: "submitted",
        to_status: "under_verification",
        changed_by: session.user.id,
        comments: "Verification desk opened; clarification requested.",
        created_at: now,
      });

      currentStatus = "under_verification";
    }

    if (currentStatus !== "under_verification") {
      return {
        success: false,
        error: `Cannot request clarification for application currently in status '${currentStatus}'. Must be 'under_verification'.`,
      };
    }

    // 3. Insert formal record into clarification_requests
    const { error: clarErr } = await adminClient.from("clarification_requests").insert({
      application_id: applicationId,
      requested_by: session.user.id,
      applicant_message: applicantMessage.trim(),
      internal_note: internalNote?.trim() || null,
      status: "pending",
      created_at: now,
      updated_at: now,
    });

    if (clarErr) {
      console.error("Clarification insert error:", clarErr);
      return { success: false, error: clarErr.message };
    }

    // 4. Update application status to clarification_required and unlock for revisions
    const { error: updateErr } = await adminClient
      .from("applications")
      .update({
        status: "clarification_required",
        is_locked: false, // Unlocked so applicant can update details or media
        updated_at: now,
      })
      .eq("id", applicationId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 5. Record status history
    await adminClient.from("application_status_history").insert({
      application_id: applicationId,
      from_status: "under_verification",
      to_status: "clarification_required",
      changed_by: session.user.id,
      comments: `Clarification requested: ${applicantMessage.trim().substring(0, 200)}...`,
      created_at: now,
    });

    // 6. Record audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "application_clarification_requested",
      entity_type: "application",
      entity_id: applicationId,
      old_values: { status: "under_verification" },
      new_values: {
        status: "clarification_required",
        applicant_message: applicantMessage.trim(),
        internal_note: internalNote?.trim() || null,
      },
      created_at: now,
    });

    // Phase F: High Priority Clarification Requested Notification (Email + In-App, idempotent)
    if (app.applicant_id) {
      sendNotification({
        eventType: "clarification_requested",
        recipientUserId: app.applicant_id,
        applicationId,
        nominationId: app.nomination_id,
        data: {
          projectName: app.project_name,
          clarificationMessage: applicantMessage.trim(),
        },
        idempotencyKey: `clarification_requested:${applicationId}:${now}`,
        channels: ["email", "in_app"],
      }).catch((err) => console.error("Clarification notification notice:", err));
    }

    // 7. Revalidate
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/nominations/${applicationId}`);

    return { success: true };
  } catch (err: any) {
    console.error("Exception in requestApplicationClarification:", err);
    return {
      success: false,
      error: err?.message || "Failed to process clarification request.",
    };
  }
}

/**
 * Server action to create a confidential internal admin note.
 * Strictly inaccessible to applicants.
 * Persists in `admin_notes` table (with seamless fallback to `audit_logs`).
 */
export async function createAdminNote(
  applicationId: string,
  noteText: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!noteText || noteText.trim() === "") {
    return { success: false, error: "Note text cannot be empty." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();
  const trimmedText = noteText.trim();

  try {
    // 1. Attempt insert into admin_notes table
    const { error: insertErr } = await (adminClient.from as any)("admin_notes").insert({
      application_id: applicationId,
      author_id: session.user.id,
      note_text: trimmedText,
      created_at: now,
      updated_at: now,
    });

    // 2. If table is not yet created in live schema cache, fallback to audit_logs
    if (insertErr) {
      console.warn("admin_notes table insert notice, using audit_logs fallback:", insertErr.message);
      await adminClient.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "admin_note_created",
        entity_type: "application_admin_note",
        entity_id: applicationId,
        new_values: {
          note_text: trimmedText,
          author_name: session.user.fullName,
          author_email: session.user.email,
        },
        created_at: now,
      });
    } else {
      // Also log the action in audit_logs
      await adminClient.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "admin_note_created",
        entity_type: "application",
        entity_id: applicationId,
        new_values: { note_preview: trimmedText.substring(0, 100) },
        created_at: now,
      });
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in createAdminNote:", err);
    return { success: false, error: err?.message || "Failed to save internal note." };
  }
}
