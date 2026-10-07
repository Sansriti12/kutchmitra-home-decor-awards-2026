"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { getJurySession } from "@/lib/jury/auth";
import { sendNotification, notifyAdmins } from "@/lib/notifications/notification-service";
import type {
  JuryMemberItem,
  JuryAssignmentItem,
  ScoringCriterionItem,
  JuryEvaluationPayload,
  JuryEvaluationDetail,
  JuryApplicationDossier,
  JuryRecommendation,
  QualitativeRating,
} from "@/types/jury.types";

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

// ==============================================================================
// 1. ADMIN SERVER ACTIONS: JURY GOVERNANCE & ASSIGNMENT
// ==============================================================================

/**
 * Fetches the complete Jury overview for the Admin Jury Management portal.
 * Returns jury members with progress stats, all assignments, and assignable nominations.
 */
export async function getAdminJuryOverview(): Promise<{
  success: boolean;
  error?: string;
  stats?: {
    totalJuryMembers: number;
    activeJuryMembers: number;
    totalAssignments: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    conflictsDeclared: number;
  };
  juryMembers?: JuryMemberItem[];
  assignments?: JuryAssignmentItem[];
  eligibleApplications?: Array<{
    id: string;
    nominationId: string;
    projectName: string;
    projectCity: string;
    status: string;
    category: {
      id: string;
      code: string;
      name: string;
      slug: string;
    } | null;
  }>;
}> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch all jury profiles with user info
    const { data: rawProfiles, error: profErr } = await adminClient
      .from("jury_profiles")
      .select(`
        id,
        user_id,
        edition_id,
        honorific,
        organization,
        designation,
        bio,
        photo_url,
        display_order,
        is_public,
        created_at,
        users (
          id,
          email,
          full_name,
          is_active
        )
      `)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (profErr) {
      console.error("Error fetching jury profiles:", profErr);
      return { success: false, error: profErr.message };
    }

    // 2. Fetch all assignments with application and evaluation details
    const { data: rawAssignments, error: assignErr } = await adminClient
      .from("jury_assignments")
      .select(`
        id,
        edition_id,
        jury_profile_id,
        application_id,
        assigned_by,
        status,
        conflict_declared,
        conflict_reason,
        completed_at,
        created_at,
        applications (
          id,
          nomination_id,
          project_name,
          project_city,
          project_state,
          category_id,
          categories (
            id,
            code,
            name,
            slug
          )
        ),
        jury_profiles (
          id,
          user_id,
          organization,
          designation,
          users (
            id,
            full_name,
            email
          )
        ),
        jury_evaluations (
          id,
          status,
          is_locked,
          submitted_at,
          recommendation,
          general_comment
        )
      `)
      .order("created_at", { ascending: false });

    if (assignErr) {
      console.error("Error fetching jury assignments:", assignErr);
      return { success: false, error: assignErr.message };
    }

    // 3. Fetch applications eligible for jury assignment ('eligible' or 'jury_review')
    const { data: rawEligible, error: eligErr } = await adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        project_name,
        project_city,
        status,
        category_id,
        categories (
          id,
          code,
          name,
          slug
        )
      `)
      .in("status", ["eligible", "jury_review"])
      .order("nomination_id", { ascending: true });

    if (eligErr) {
      console.error("Error fetching eligible applications:", eligErr);
      return { success: false, error: eligErr.message };
    }

    // Format assignments
    const assignments: JuryAssignmentItem[] = (rawAssignments || []).map((ra: any) => {
      const app = Array.isArray(ra.applications) ? ra.applications[0] : ra.applications;
      const cat = app ? (Array.isArray(app.categories) ? app.categories[0] : app.categories) : null;
      const jp = Array.isArray(ra.jury_profiles) ? ra.jury_profiles[0] : ra.jury_profiles;
      const u = jp ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;
      const ev = Array.isArray(ra.jury_evaluations) ? ra.jury_evaluations[0] : ra.jury_evaluations;

      return {
        id: ra.id,
        editionId: ra.edition_id,
        juryProfileId: ra.jury_profile_id,
        applicationId: ra.application_id,
        nominationId: app?.nomination_id || "KHA26-XX-XXXX",
        projectName: app?.project_name || "Untitled Nomination",
        projectCity: app?.project_city || "Kutch",
        projectState: app?.project_state || "Gujarat",
        category: cat ? { id: cat.id, code: cat.code, name: cat.name, slug: cat.slug } : null,
        assignedBy: ra.assigned_by,
        assignedAt: ra.created_at,
        status: ra.status,
        conflictDeclared: ra.conflict_declared,
        conflictReason: ra.conflict_reason,
        completedAt: ra.completed_at,
        juror: jp
          ? {
              id: jp.id,
              userId: jp.user_id,
              fullName: u?.full_name || "Juror",
              email: u?.email || "",
              organization: jp.organization,
              designation: jp.designation,
            }
          : null,
        evaluation: ev
          ? {
              id: ev.id,
              status: ev.status,
              isLocked: ev.is_locked,
              submittedAt: ev.submitted_at,
              recommendation: ev.recommendation,
              generalComment: ev.general_comment,
            }
          : null,
      };
    });

    // Format jury members and calculate per-juror metrics
    const juryMembers: JuryMemberItem[] = (rawProfiles || []).map((rp: any) => {
      const usr = Array.isArray(rp.users) ? rp.users[0] : rp.users;
      const jurorAssignments = assignments.filter((a) => a.juryProfileId === rp.id);

      const assignedCount = jurorAssignments.length;
      const completedCount = jurorAssignments.filter((a) => a.status === "completed").length;
      const conflictCount = jurorAssignments.filter((a) => a.conflictDeclared).length;
      const pendingCount = jurorAssignments.filter(
        (a) => !a.conflictDeclared && a.status !== "completed"
      ).length;

      return {
        id: rp.id,
        userId: rp.user_id,
        email: usr?.email || "",
        fullName: usr?.full_name || "Jury Member",
        honorific: rp.honorific,
        organization: rp.organization,
        designation: rp.designation,
        bio: rp.bio,
        photoUrl: rp.photo_url,
        displayOrder: rp.display_order ?? 0,
        isPublic: rp.is_public ?? false,
        isActive: usr?.is_active ?? true,
        assignedCount,
        completedCount,
        pendingCount,
        conflictCount,
        createdAt: rp.created_at,
      };
    });

    // Format eligible applications
    const eligibleApplications = (rawEligible || []).map((app: any) => {
      const cat = Array.isArray(app.categories) ? app.categories[0] : app.categories;
      return {
        id: app.id,
        nominationId: app.nomination_id,
        projectName: app.project_name || "Untitled Project",
        projectCity: app.project_city || "Kutch",
        status: app.status,
        category: cat ? { id: cat.id, code: cat.code, name: cat.name, slug: cat.slug } : null,
      };
    });

    // Aggregate summary stats
    const totalJuryMembers = juryMembers.length;
    const activeJuryMembers = juryMembers.filter((m) => m.isActive).length;
    const totalAssignments = assignments.length;
    const completedEvaluations = assignments.filter((a) => a.status === "completed").length;
    const conflictsDeclared = assignments.filter((a) => a.conflictDeclared).length;
    const pendingEvaluations = assignments.filter(
      (a) => !a.conflictDeclared && a.status !== "completed"
    ).length;

    return {
      success: true,
      stats: {
        totalJuryMembers,
        activeJuryMembers,
        totalAssignments,
        completedEvaluations,
        pendingEvaluations,
        conflictsDeclared,
      },
      juryMembers,
      assignments,
      eligibleApplications,
    };
  } catch (err: any) {
    console.error("Exception in getAdminJuryOverview:", err);
    return { success: false, error: err.message || "Failed to load jury management data." };
  }
}

/**
 * Creates a new Jury Member account and profile.
 * Registers user in Supabase Auth, assigns `jury_member` role, and creates `jury_profiles` record.
 */
export async function createJuryMember(data: {
  fullName: string;
  email: string;
  password?: string;
  honorific?: string;
  organization?: string;
  designation?: string;
  bio?: string;
  isPublic?: boolean;
}): Promise<{ success: boolean; error?: string; juryProfileId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();

  if (!email || !fullName) {
    return { success: false, error: "Name and email are mandatory." };
  }

  const adminClient = createAdminClient();
  const initialPassword = data.password?.trim() || "KutchAwards2026#Jury";

  try {
    // 1. Create or retrieve auth user
    let userId: string;
    const { data: newUser, error: createAuthErr } = await adminClient.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createAuthErr) {
      if (createAuthErr.message.includes("already registered") || createAuthErr.message.includes("exists")) {
        // Find existing user id
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          return { success: false, error: `User with email ${email} already exists in authentication.` };
        }
      } else {
        return { success: false, error: `Authentication account creation failed: ${createAuthErr.message}` };
      }
    } else {
      userId = newUser.user.id;
    }

    // 2. Ensure users record is synchronized
    await adminClient.from("users").upsert({
      id: userId,
      email,
      full_name: fullName,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    // 3. Assign `jury_member` role in user_roles
    await adminClient.from("user_roles").upsert(
      {
        user_id: userId,
        role_id: "jury_member",
      },
      { onConflict: "user_id, role_id" }
    );

    // 4. Create jury_profiles record
    const { data: profileData, error: profileErr } = await adminClient
      .from("jury_profiles")
      .upsert(
        {
          user_id: userId,
          edition_id: CURRENT_EDITION_ID,
          honorific: data.honorific?.trim() || null,
          organization: data.organization?.trim() || null,
          designation: data.designation?.trim() || null,
          bio: data.bio?.trim() || null,
          is_public: data.isPublic ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("id")
      .single();

    if (profileErr) {
      console.error("Error creating jury profile:", profileErr);
      return { success: false, error: `Failed to create jury profile: ${profileErr.message}` };
    }

    // 5. Append to audit trail
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_member_created",
      entity_type: "jury_profile",
      entity_id: profileData.id,
      new_values: {
        email,
        full_name: fullName,
        organization: data.organization,
        designation: data.designation,
      },
      created_at: new Date().toISOString(),
    });

    revalidatePath("/admin/jury");
    return { success: true, juryProfileId: profileData.id };
  } catch (err: any) {
    console.error("Exception in createJuryMember:", err);
    return { success: false, error: err.message || "Failed to create jury member." };
  }
}

/**
 * Updates an existing Jury Member profile.
 */
export async function updateJuryMember(
  profileId: string,
  data: {
    fullName: string;
    honorific?: string;
    organization?: string;
    designation?: string;
    bio?: string;
    isPublic?: boolean;
    displayOrder?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: profile, error: getErr } = await adminClient
      .from("jury_profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .single();

    if (getErr || !profile) {
      return { success: false, error: "Jury profile not found." };
    }

    // Update user full_name
    if (data.fullName && data.fullName.trim()) {
      await adminClient
        .from("users")
        .update({ full_name: data.fullName.trim(), updated_at: new Date().toISOString() })
        .eq("id", profile.user_id);
    }

    // Update jury_profiles
    const { error: updateErr } = await adminClient
      .from("jury_profiles")
      .update({
        honorific: data.honorific !== undefined ? data.honorific?.trim() || null : undefined,
        organization: data.organization !== undefined ? data.organization?.trim() || null : undefined,
        designation: data.designation !== undefined ? data.designation?.trim() || null : undefined,
        bio: data.bio !== undefined ? data.bio?.trim() || null : undefined,
        is_public: data.isPublic !== undefined ? data.isPublic : undefined,
        display_order: data.displayOrder !== undefined ? data.displayOrder : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_member_updated",
      entity_type: "jury_profile",
      entity_id: profileId,
      new_values: data,
      created_at: new Date().toISOString(),
    });

    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update jury member." };
  }
}

/**
 * Toggles active/inactive state of a Jury Member.
 */
export async function toggleJuryMemberStatus(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from("users")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_member_status_changed",
      entity_type: "user",
      entity_id: userId,
      new_values: { is_active: isActive },
      created_at: new Date().toISOString(),
    });

    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Assigns an eligible nomination to an appointed Jury Member.
 * Enforces non-duplicate assignment and advances status to `jury_review` if appropriate.
 */
export async function assignApplicationToJury(
  applicationId: string,
  juryProfileId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Verify application eligibility
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select("id, nomination_id, status, edition_id, project_name, categories(name)")
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    if (!["eligible", "jury_review"].includes(app.status)) {
      return {
        success: false,
        error: `Only applications with status 'eligible' or 'jury_review' can be assigned to jurors (current: ${app.status}).`,
      };
    }

    // 2. Check for duplicate assignment
    const { data: existing } = await adminClient
      .from("jury_assignments")
      .select("id")
      .eq("application_id", applicationId)
      .eq("jury_profile_id", juryProfileId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "This nomination is already assigned to this jury member." };
    }

    // 3. Insert assignment
    const now = new Date().toISOString();
    const { data: assignment, error: assignErr } = await adminClient
      .from("jury_assignments")
      .insert({
        edition_id: app.edition_id || CURRENT_EDITION_ID,
        jury_profile_id: juryProfileId,
        application_id: applicationId,
        assigned_by: session.user.id,
        status: "assigned",
        conflict_declared: false,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (assignErr) {
      console.error("Error creating assignment:", assignErr);
      return { success: false, error: `Assignment failed: ${assignErr.message}` };
    }

    // 4. If application was in 'eligible' status, transition to 'jury_review'
    if (app.status === "eligible") {
      await adminClient
        .from("applications")
        .update({ status: "jury_review", updated_at: now })
        .eq("id", applicationId);

      await adminClient.from("application_status_history").insert({
        application_id: applicationId,
        from_status: "eligible",
        to_status: "jury_review",
        changed_by: session.user.id,
        comments: "Assigned to Grand Jury panel for criteria evaluation",
        created_at: now,
      });
    }

    // 5. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_application_assigned",
      entity_type: "jury_assignment",
      entity_id: assignment.id,
      new_values: {
        application_id: applicationId,
        nomination_id: app.nomination_id,
        jury_profile_id: juryProfileId,
      },
      created_at: now,
    });

    // Phase F: Jury Assignment Notification (Email + In-App, idempotent)
    const { data: jurorProfile } = await adminClient
      .from("jury_profiles")
      .select("id, user_id")
      .eq("id", juryProfileId)
      .maybeSingle();

    if (jurorProfile?.user_id) {
      const { data: jurorUser } = await adminClient
        .from("users")
        .select("id, email, full_name")
        .eq("id", jurorProfile.user_id)
        .maybeSingle();

      sendNotification({
        eventType: "jury_assigned",
        recipientUserId: jurorProfile.user_id,
        recipientEmail: jurorUser?.email || undefined,
        recipientName: jurorUser?.full_name || undefined,
        applicationId,
        nominationId: app.nomination_id,
        data: {
          projectName: app.project_name,
          categoryName: (app.categories as any)?.name,
        },
        idempotencyKey: `jury_assigned:${applicationId}:${juryProfileId}`,
        channels: ["email", "in_app"],
      }).catch((err) => console.error("Jury assigned notification notice:", err));
    }

    revalidatePath("/admin/jury");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in assignApplicationToJury:", err);
    return { success: false, error: err.message || "Failed to assign application." };
  }
}

/**
 * Removes an existing Jury assignment.
 */
export async function removeJuryAssignment(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: assignment, error: getErr } = await adminClient
      .from("jury_assignments")
      .select("id, application_id, jury_profile_id, status")
      .eq("id", assignmentId)
      .single();

    if (getErr || !assignment) {
      return { success: false, error: "Assignment not found." };
    }

    const { error: delErr } = await adminClient
      .from("jury_assignments")
      .delete()
      .eq("id", assignmentId);

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_application_unassigned",
      entity_type: "jury_assignment",
      entity_id: assignmentId,
      old_values: assignment,
      created_at: new Date().toISOString(),
    });

    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove assignment." };
  }
}

/**
 * Reopens a locked Jury evaluation (Admin authorized action).
 * Sets evaluation back to 'draft' and assignment to 'in_progress'.
 */
export async function reopenJuryEvaluation(
  evaluationId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!reason || reason.trim() === "") {
    return { success: false, error: "A valid reason for reopening the evaluation is required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: evalRecord, error: getErr } = await adminClient
      .from("jury_evaluations")
      .select("id, jury_assignment_id, status, is_locked")
      .eq("id", evaluationId)
      .single();

    if (getErr || !evalRecord) {
      return { success: false, error: "Evaluation not found." };
    }

    const now = new Date().toISOString();

    await adminClient
      .from("jury_evaluations")
      .update({ status: "draft", is_locked: false, updated_at: now })
      .eq("id", evaluationId);

    await adminClient
      .from("jury_assignments")
      .update({ status: "in_progress", updated_at: now })
      .eq("id", evalRecord.jury_assignment_id);

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_evaluation_reopened",
      entity_type: "jury_evaluation",
      entity_id: evaluationId,
      new_values: { reason: reason.trim(), reopened_by: session.user.fullName },
      created_at: now,
    });

    // Phase F: Notify Juror that their evaluation has been reopened (idempotent, non-blocking)
    const { data: assignData } = await adminClient
      .from("jury_assignments")
      .select(`
        application_id,
        applications(id, nomination_id, project_name),
        jury_profiles(user_id, full_name, email)
      `)
      .eq("id", evalRecord.jury_assignment_id)
      .maybeSingle();

    const jurorProfile = Array.isArray(assignData?.jury_profiles)
      ? assignData.jury_profiles[0]
      : assignData?.jury_profiles;
    const appData = Array.isArray(assignData?.applications)
      ? assignData.applications[0]
      : assignData?.applications;

    if (jurorProfile?.user_id) {
      sendNotification({
        eventType: "jury_evaluation_reopened",
        recipientUserId: jurorProfile.user_id,
        recipientEmail: jurorProfile.email,
        recipientName: jurorProfile.full_name,
        applicationId: appData?.id,
        nominationId: appData?.nomination_id,
        data: {
          projectName: appData?.project_name,
          reason: reason.trim(),
        },
        idempotencyKey: `jury_reopen:${evaluationId}:${now}`,
        channels: ["email", "in_app"],
      }).catch((err) => console.error("Jury reopen notification notice:", err));
    }

    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reopen evaluation." };
  }
}

// ==============================================================================
// 2. JURY PORTAL SERVER ACTIONS: WORKSPACE & QUALITATIVE EVALUATION
// ==============================================================================

/**
 * Fetches dashboard data for the authenticated Jury Member.
 * Returns only assignments specifically linked to this juror.
 */
export async function getJuryDashboardData(): Promise<{
  success: boolean;
  error?: string;
  juror?: {
    id: string;
    fullName: string;
    email: string;
    organization: string | null;
    designation: string | null;
    honorific: string | null;
  };
  stats?: {
    totalAssigned: number;
    pendingCount: number;
    completedCount: number;
    conflictCount: number;
  };
  assignments?: JuryAssignmentItem[];
}> {
  const session = await getJurySession();
  if (!session) {
    return { success: false, error: "Unauthorized: Jury credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // If user is admin/super_admin without a juror profile, locate or create a provisional one for testing
    let juryProfileId = session.juryProfile?.id;
    if (!juryProfileId) {
      const { data: createdProfile } = await adminClient
        .from("jury_profiles")
        .upsert(
          {
            user_id: session.user.id,
            edition_id: CURRENT_EDITION_ID,
            organization: "Grand Jury Panel",
            designation: session.isSuperAdmin ? "Lead Juror / Super Admin" : "Jury Member",
            is_public: false,
          },
          { onConflict: "user_id" }
        )
        .select("id")
        .single();

      juryProfileId = createdProfile?.id;
    }

    if (!juryProfileId) {
      return { success: false, error: "No associated Jury profile found for this account." };
    }

    // Fetch assignments for this juror ONLY
    const { data: rawAssignments, error: assignErr } = await adminClient
      .from("jury_assignments")
      .select(`
        id,
        edition_id,
        jury_profile_id,
        application_id,
        assigned_by,
        status,
        conflict_declared,
        conflict_reason,
        completed_at,
        created_at,
        applications (
          id,
          nomination_id,
          project_name,
          project_city,
          project_state,
          category_id,
          categories (
            id,
            code,
            name,
            slug
          )
        ),
        jury_evaluations (
          id,
          status,
          is_locked,
          submitted_at,
          recommendation,
          general_comment
        )
      `)
      .eq("jury_profile_id", juryProfileId)
      .order("created_at", { ascending: false });

    if (assignErr) {
      console.error("Error fetching juror assignments:", assignErr);
      return { success: false, error: assignErr.message };
    }

    const assignments: JuryAssignmentItem[] = (rawAssignments || []).map((ra: any) => {
      const app = Array.isArray(ra.applications) ? ra.applications[0] : ra.applications;
      const cat = app ? (Array.isArray(app.categories) ? app.categories[0] : app.categories) : null;
      const ev = Array.isArray(ra.jury_evaluations) ? ra.jury_evaluations[0] : ra.jury_evaluations;

      return {
        id: ra.id,
        editionId: ra.edition_id,
        juryProfileId: ra.jury_profile_id,
        applicationId: ra.application_id,
        nominationId: app?.nomination_id || "KHA26-XX-XXXX",
        projectName: app?.project_name || "Untitled Nomination",
        projectCity: app?.project_city || "Kutch",
        projectState: app?.project_state || "Gujarat",
        category: cat ? { id: cat.id, code: cat.code, name: cat.name, slug: cat.slug } : null,
        assignedBy: ra.assigned_by,
        assignedAt: ra.created_at,
        status: ra.status,
        conflictDeclared: ra.conflict_declared,
        conflictReason: ra.conflict_reason,
        completedAt: ra.completed_at,
        juror: {
          id: juryProfileId,
          userId: session.user.id,
          fullName: session.user.fullName,
          email: session.user.email,
          organization: session.juryProfile?.organization || null,
          designation: session.juryProfile?.designation || null,
        },
        evaluation: ev
          ? {
              id: ev.id,
              status: ev.status,
              isLocked: ev.is_locked,
              submittedAt: ev.submitted_at,
              recommendation: ev.recommendation,
              generalComment: ev.general_comment,
            }
          : null,
      };
    });

    const totalAssigned = assignments.length;
    const completedCount = assignments.filter((a) => a.status === "completed").length;
    const conflictCount = assignments.filter((a) => a.conflictDeclared).length;
    const pendingCount = assignments.filter(
      (a) => !a.conflictDeclared && a.status !== "completed"
    ).length;

    return {
      success: true,
      juror: {
        id: juryProfileId,
        fullName: session.user.fullName,
        email: session.user.email,
        organization: session.juryProfile?.organization || "Independent Design Expert",
        designation: session.juryProfile?.designation || "Jury Member",
        honorific: session.juryProfile?.honorific || null,
      },
      stats: {
        totalAssigned,
        pendingCount,
        completedCount,
        conflictCount,
      },
      assignments,
    };
  } catch (err: any) {
    console.error("Exception in getJuryDashboardData:", err);
    return { success: false, error: err.message || "Failed to load juror dashboard." };
  }
}

/**
 * Fetches the complete evaluation dossier for an assigned nomination.
 * Strictly verifies that the requested application is assigned to the authenticated juror.
 */
export async function getJuryApplicationDossier(
  applicationId: string
): Promise<{
  success: boolean;
  error?: string;
  dossier?: JuryApplicationDossier;
}> {
  const session = await getJurySession();
  if (!session) {
    return { success: false, error: "Unauthorized: Jury credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Strict Server-Side Authorization: Verify that this application is assigned to this juror
    let juryProfileId = session.juryProfile?.id;
    if (!juryProfileId) {
      const { data: profile } = await adminClient
        .from("jury_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      juryProfileId = profile?.id;
    }

    if (!juryProfileId) {
      return { success: false, error: "No active jury profile found." };
    }

    // Query jury_assignments for this specific pairing
    const { data: assignment, error: assignErr } = await adminClient
      .from("jury_assignments")
      .select(`
        id,
        edition_id,
        jury_profile_id,
        application_id,
        assigned_by,
        status,
        conflict_declared,
        conflict_reason,
        completed_at,
        created_at
      `)
      .eq("application_id", applicationId)
      .eq("jury_profile_id", juryProfileId)
      .maybeSingle();

    // If not assigned to this juror, strictly deny access
    if (assignErr || !assignment) {
      return {
        success: false,
        error: "Access Denied: This nomination is not assigned to your jury evaluation portfolio.",
      };
    }

    // 2. Fetch application and category details
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        project_name,
        project_city,
        project_state,
        project_completion_date,
        built_up_area_sqft,
        status,
        category_id,
        categories (
          id,
          code,
          name,
          slug,
          short_description
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    const cat = Array.isArray(app.categories) ? app.categories[0] : app.categories;

    // 3. Fetch dynamic questions and answers
    const [questionsRes, answersRes, filesRes, criteriaRes, evalRes] = await Promise.all([
      adminClient
        .from("category_questions")
        .select("id, question_key, question_text, help_text, field_type, display_order")
        .eq("category_id", app.category_id)
        .eq("is_active", true)
        .order("display_order"),
      adminClient
        .from("application_answers")
        .select("question_id, answer_text, answer_json, answer_number, answer_date, answer_boolean, category_questions(question_key)")
        .eq("application_id", applicationId),
      adminClient
        .from("application_files")
        .select("id, upload_type, title, description, file_path, file_name, file_size_bytes, mime_type")
        .eq("application_id", applicationId),
      adminClient
        .from("scoring_criteria")
        .select("id, code, title, description, weight_percentage, max_score, display_order, is_active")
        .eq("edition_id", CURRENT_EDITION_ID)
        .eq("is_active", true)
        .order("display_order"),
      (adminClient as any)
        .from("jury_evaluations")
        .select(`
          id,
          jury_assignment_id,
          status,
          is_locked,
          submitted_at,
          general_comment,
          strengths,
          areas_of_concern,
          recommendation,
          qualitative_assessment,
          jury_scores (
            id,
            criterion_id,
            score,
            qualitative_rating,
            confidential_comment
          )
        `)
        .eq("jury_assignment_id", assignment.id)
        .maybeSingle(),
    ]);

    // Map answers by question_key
    const answerMap: Record<string, any> = {};
    (answersRes.data || []).forEach((ans: any) => {
      const qKey = ans.category_questions?.question_key;
      if (qKey) {
        answerMap[qKey] =
          ans.answer_text ??
          ans.answer_number ??
          ans.answer_date ??
          ans.answer_boolean ??
          ans.answer_json ??
          "";
      }
    });

    // Generate signed URLs for uploaded files
    const filesWithUrls = await Promise.all(
      (filesRes.data || []).map(async (f: any) => {
        let signedUrl: string | null = null;
        if (f.file_path) {
          const { data: urlData } = await adminClient.storage
            .from("application-files")
            .createSignedUrl(f.file_path, 3600); // 1 hour valid
          signedUrl = urlData?.signedUrl || null;
        }
        return {
          id: f.id,
          uploadType: f.upload_type,
          title: f.title || f.file_name,
          description: f.description,
          filePath: f.file_path,
          fileName: f.file_name,
          signedUrl,
          fileSizeBytes: f.file_size_bytes,
          mimeType: f.mime_type,
        };
      })
    );

    // Format criteria
    const criteria: ScoringCriterionItem[] = (criteriaRes.data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      weightPercentage: Number(c.weight_percentage),
      maxScore: Number(c.max_score),
      displayOrder: c.display_order,
      isActive: c.is_active,
    }));

    // Format existing evaluation if present
    let existingEvaluation: JuryEvaluationDetail | null = null;
    if (evalRes.data) {
      const ev = evalRes.data;
      const scores = (ev.jury_scores || []).map((s: any) => {
        const crit = criteria.find((c) => c.id === s.criterion_id);
        return {
          id: s.id,
          criterionId: s.criterion_id,
          criterionCode: crit?.code || "",
          criterionTitle: crit?.title || "Criterion",
          qualitativeRating: (s.qualitative_rating || "") as QualitativeRating,
          score: Number(s.score || 0),
          confidentialComment: s.confidential_comment || "",
        };
      });

      existingEvaluation = {
        id: ev.id,
        juryAssignmentId: ev.jury_assignment_id,
        status: ev.status,
        isLocked: ev.is_locked,
        submittedAt: ev.submitted_at,
        generalComment: ev.general_comment || "",
        strengths: ev.strengths || "",
        areasOfConcern: ev.areas_of_concern || "",
        recommendation: (ev.recommendation || "") as JuryRecommendation,
        qualitativeAssessment: ev.qualitative_assessment || "",
        scores,
      };
    }

    const dossier: JuryApplicationDossier = {
      assignment: {
        id: assignment.id,
        editionId: assignment.edition_id,
        juryProfileId: assignment.jury_profile_id,
        applicationId: assignment.application_id,
        nominationId: app.nomination_id,
        projectName: app.project_name || "Untitled Project",
        projectCity: app.project_city || "Kutch",
        projectState: app.project_state || "Gujarat",
        category: cat ? { id: cat.id, code: cat.code, name: cat.name, slug: cat.slug } : null,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.created_at,
        status: assignment.status,
        conflictDeclared: assignment.conflict_declared,
        conflictReason: assignment.conflict_reason,
        completedAt: assignment.completed_at,
        juror: {
          id: juryProfileId,
          userId: session.user.id,
          fullName: session.user.fullName,
          email: session.user.email,
          organization: session.juryProfile?.organization || null,
          designation: session.juryProfile?.designation || null,
        },
      },
      application: {
        id: app.id,
        nominationId: app.nomination_id,
        projectName: app.project_name || "Untitled Project",
        projectCity: app.project_city || "Kutch",
        projectState: app.project_state || "Gujarat",
        projectCompletionDate: app.project_completion_date,
        builtUpAreaSqft: app.built_up_area_sqft ? Number(app.built_up_area_sqft) : null,
        status: app.status,
        category: cat
          ? {
              id: cat.id,
              code: cat.code,
              name: cat.name,
              slug: cat.slug,
              shortDescription: cat.short_description,
            }
          : null,
      },
      questions: (questionsRes.data || []).map((q: any) => ({
        id: q.id,
        questionKey: q.question_key,
        questionText: q.question_text,
        helpText: q.help_text,
        fieldType: q.field_type,
        displayOrder: q.display_order,
      })),
      answers: answerMap,
      files: filesWithUrls,
      criteria,
      evaluation: existingEvaluation,
    };

    return { success: true, dossier };
  } catch (err: any) {
    console.error("Exception in getJuryApplicationDossier:", err);
    return { success: false, error: err.message || "Failed to load application dossier." };
  }
}

/**
 * Declares Conflict of Interest or confirms No Conflict for an assigned nomination.
 * When conflict is declared, evaluation controls are disabled and the status becomes `declined_conflict`.
 */
export async function declareJuryConflict(
  assignmentId: string,
  hasConflict: boolean,
  conflictReason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getJurySession();
  if (!session) {
    return { success: false, error: "Unauthorized: Jury credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // Verify assignment belongs to juror
    const { data: assignment, error: getErr } = await adminClient
      .from("jury_assignments")
      .select("id, jury_profile_id, application_id, status")
      .eq("id", assignmentId)
      .single();

    if (getErr || !assignment) {
      return { success: false, error: "Assignment not found." };
    }

    if (session.juryProfile && assignment.jury_profile_id !== session.juryProfile.id && !session.isAdmin) {
      return { success: false, error: "Unauthorized: You do not own this assignment." };
    }

    const now = new Date().toISOString();
    const newStatus = hasConflict ? "declined_conflict" : "assigned";

    const { error: updateErr } = await adminClient
      .from("jury_assignments")
      .update({
        conflict_declared: hasConflict,
        conflict_reason: hasConflict ? conflictReason?.trim() || "Conflict of interest declared." : null,
        status: newStatus,
        updated_at: now,
      })
      .eq("id", assignmentId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_conflict_declared",
      entity_type: "jury_assignment",
      entity_id: assignmentId,
      new_values: {
        conflict_declared: hasConflict,
        conflict_reason: hasConflict ? conflictReason?.trim() : null,
        juror_name: session.user.fullName,
      },
      created_at: now,
    });

    // Phase F: Alert Admins regarding declared Conflict of Interest (idempotent, non-blocking)
    if (hasConflict) {
      notifyAdmins("admin_jury_conflict", {
        applicationId: assignment.application_id,
        data: {
          actorName: session.user.fullName || "Jury Member",
          reason: conflictReason?.trim() || "Conflict of interest declared.",
        },
      }).catch((err) => console.error("Admin conflict notice:", err));
    }

    revalidatePath("/jury/portal");
    revalidatePath(`/jury/applications/${assignment.application_id}`);
    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in declareJuryConflict:", err);
    return { success: false, error: err.message || "Failed to record conflict declaration." };
  }
}

/**
 * Saves a draft of the qualitative Jury evaluation.
 * Does NOT lock the evaluation, allowing the juror to return and edit.
 */
export async function saveJuryEvaluationDraft(
  assignmentId: string,
  payload: JuryEvaluationPayload
): Promise<{ success: boolean; error?: string; evaluationId?: string }> {
  const session = await getJurySession();
  if (!session) {
    return { success: false, error: "Unauthorized: Jury credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Verify assignment belongs to juror and no conflict declared
    const { data: assignment, error: getErr } = await adminClient
      .from("jury_assignments")
      .select("id, jury_profile_id, application_id, conflict_declared")
      .eq("id", assignmentId)
      .single();

    if (getErr || !assignment) {
      return { success: false, error: "Assignment not found." };
    }

    if (session.juryProfile && assignment.jury_profile_id !== session.juryProfile.id && !session.isAdmin) {
      return { success: false, error: "Unauthorized: You do not own this assignment." };
    }

    if (assignment.conflict_declared) {
      return { success: false, error: "Cannot evaluate an application with a declared conflict of interest." };
    }

    // 2. Check if already locked
    const { data: existingEval } = await adminClient
      .from("jury_evaluations")
      .select("id, is_locked")
      .eq("jury_assignment_id", assignmentId)
      .maybeSingle();

    if (existingEval?.is_locked) {
      return { success: false, error: "This evaluation has already been submitted and locked." };
    }

    const now = new Date().toISOString();

    // 3. Upsert into jury_evaluations
    const { data: evaluation, error: evalErr } = await adminClient
      .from("jury_evaluations")
      .upsert(
        {
          jury_assignment_id: assignmentId,
          status: "draft",
          is_locked: false,
          general_comment: payload.generalComment?.trim() || null,
          strengths: payload.strengths?.trim() || null,
          areas_of_concern: payload.areasOfConcern?.trim() || null,
          recommendation: payload.recommendation || null,
          updated_at: now,
        },
        { onConflict: "jury_assignment_id" }
      )
      .select("id")
      .single();

    if (evalErr || !evaluation) {
      return { success: false, error: `Failed to save evaluation draft: ${evalErr?.message}` };
    }

    // 4. Upsert criterion scores
    if (payload.criterionScores && payload.criterionScores.length > 0) {
      for (const cs of payload.criterionScores) {
        if (!cs.criterionId) continue;
        await adminClient.from("jury_scores").upsert(
          {
            evaluation_id: evaluation.id,
            criterion_id: cs.criterionId,
            score: cs.score || 0,
            qualitative_rating: cs.qualitativeRating || null,
            confidential_comment: cs.confidentialComment?.trim() || null,
            updated_at: now,
          },
          { onConflict: "evaluation_id, criterion_id" }
        );
      }
    }

    // 5. Update assignment status to in_progress
    await adminClient
      .from("jury_assignments")
      .update({ status: "in_progress", updated_at: now })
      .eq("id", assignmentId);

    // 6. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_evaluation_draft_saved",
      entity_type: "jury_evaluation",
      entity_id: evaluation.id,
      new_values: { recommendation: payload.recommendation },
      created_at: now,
    });

    revalidatePath("/jury/portal");
    revalidatePath(`/jury/applications/${assignment.application_id}`);
    return { success: true, evaluationId: evaluation.id };
  } catch (err: any) {
    console.error("Exception in saveJuryEvaluationDraft:", err);
    return { success: false, error: err.message || "Failed to save draft." };
  }
}

/**
 * Submits and permanently locks the qualitative Jury evaluation.
 * Validates that criteria assessments and overall recommendation are provided.
 */
export async function submitJuryEvaluation(
  assignmentId: string,
  payload: JuryEvaluationPayload
): Promise<{ success: boolean; error?: string }> {
  const session = await getJurySession();
  if (!session) {
    return { success: false, error: "Unauthorized: Jury credentials required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Verify assignment and conflict status
    const { data: assignment, error: getErr } = await adminClient
      .from("jury_assignments")
      .select("id, jury_profile_id, application_id, conflict_declared")
      .eq("id", assignmentId)
      .single();

    if (getErr || !assignment) {
      return { success: false, error: "Assignment not found." };
    }

    if (session.juryProfile && assignment.jury_profile_id !== session.juryProfile.id && !session.isAdmin) {
      return { success: false, error: "Unauthorized: You do not own this assignment." };
    }

    if (assignment.conflict_declared) {
      return { success: false, error: "Cannot submit an evaluation for a nomination with a declared conflict." };
    }

    // 2. Validate that all 5 criteria have an assessment
    if (!payload.criterionScores || payload.criterionScores.length < 5) {
      return {
        success: false,
        error: "All 5 Kutchmitra evaluation criteria must be qualitatively assessed before final submission.",
      };
    }

    const missingRating = payload.criterionScores.some((cs) => !cs.qualitativeRating);
    if (missingRating) {
      return {
        success: false,
        error: "Please select a qualitative rating for each of the 5 criteria.",
      };
    }

    if (!payload.recommendation) {
      return {
        success: false,
        error: "Please select an overall Jury recommendation before submitting.",
      };
    }

    const now = new Date().toISOString();

    // 3. Upsert into jury_evaluations with is_locked = true, status = 'submitted'
    const { data: evaluation, error: evalErr } = await adminClient
      .from("jury_evaluations")
      .upsert(
        {
          jury_assignment_id: assignmentId,
          status: "submitted",
          is_locked: true,
          submitted_at: now,
          general_comment: payload.generalComment?.trim() || null,
          strengths: payload.strengths?.trim() || null,
          areas_of_concern: payload.areasOfConcern?.trim() || null,
          recommendation: payload.recommendation,
          updated_at: now,
        },
        { onConflict: "jury_assignment_id" }
      )
      .select("id")
      .single();

    if (evalErr || !evaluation) {
      return { success: false, error: `Failed to submit evaluation: ${evalErr?.message}` };
    }

    // 4. Save criterion scores
    for (const cs of payload.criterionScores) {
      await adminClient.from("jury_scores").upsert(
        {
          evaluation_id: evaluation.id,
          criterion_id: cs.criterionId,
          score: cs.score || 0,
          qualitative_rating: cs.qualitativeRating,
          confidential_comment: cs.confidentialComment?.trim() || null,
          updated_at: now,
        },
        { onConflict: "evaluation_id, criterion_id" }
      );
    }

    // 5. Update assignment status to completed
    await adminClient
      .from("jury_assignments")
      .update({ status: "completed", completed_at: now, updated_at: now })
      .eq("id", assignmentId);

    // 6. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "jury_evaluation_submitted",
      entity_type: "jury_evaluation",
      entity_id: evaluation.id,
      new_values: {
        recommendation: payload.recommendation,
        juror_name: session.user.fullName,
        submitted_at: now,
      },
      created_at: now,
    });

    revalidatePath("/jury/portal");
    revalidatePath(`/jury/applications/${assignment.application_id}`);
    revalidatePath("/admin/jury");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in submitJuryEvaluation:", err);
    return { success: false, error: err.message || "Failed to submit evaluation." };
  }
}
