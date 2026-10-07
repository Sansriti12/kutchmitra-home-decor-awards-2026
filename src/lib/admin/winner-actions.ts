"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { sendNotification } from "@/lib/notifications/notification-service";
import type {
  WinnerRecord,
  WinnerProfilePayload,
  WinnerType,
  PublicationStatus,
  WinnerWorkspaceStats,
  WinnerCandidateItem,
} from "@/types/shortlist-winner.types";

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

/**
 * Fetches data for the Winner Management workspace.
 * Returns categories, shortlisted nominations eligible for winner selection,
 * current winner records, and publication statistics.
 */
export async function getWinnersWorkspaceData(params?: {
  categoryId?: string;
}): Promise<{
  success: boolean;
  error?: string;
  categories: Array<{ id: string; name: string; code: string }>;
  winners: WinnerRecord[];
  shortlistedCandidates: WinnerCandidateItem[];
  stats: WinnerWorkspaceStats;
}> {
  const session = await getAdminSession();
  if (!session || (!session.isAdmin && !session.isVerificationTeam)) {
    return {
      success: false,
      error: "Unauthorized: Administrator credentials required.",
      categories: [],
      winners: [],
      shortlistedCandidates: [],
      stats: {
        totalWinners: 0,
        totalApproved: 0,
        totalPublished: 0,
        categoriesWithWinnersCount: 0,
        totalCategories: 0,
        totalShortlisted: 0,
        availableFinalists: 0,
      },
    };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch categories
    const { data: rawCategories } = await adminClient
      .from("categories")
      .select("id, name, code, display_order")
      .eq("is_active", true)
      .order("display_order");

    const categories = (rawCategories || []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));

    // 2. Query existing winners
    let winnerQuery = adminClient
      .from("winners")
      .select(`
        *,
        applications(
          nomination_id,
          project_name,
          project_city,
          project_state,
          applicant_id,
          users:applicant_id(id, full_name),
          categories(id, name, code)
        )
      `)
      .eq("edition_id", CURRENT_EDITION_ID)
      .order("display_order", { ascending: true });

    if (params?.categoryId && params.categoryId !== "all") {
      winnerQuery = winnerQuery.eq("category_id", params.categoryId);
    }

    const { data: rawWinners, error: winErr } = await winnerQuery;
    if (winErr) {
      console.error("Error querying winners:", winErr);
      return {
        success: false,
        error: winErr.message,
        categories,
        winners: [],
        shortlistedCandidates: [],
        stats: {
          totalWinners: 0,
          totalApproved: 0,
          totalPublished: 0,
          categoriesWithWinnersCount: 0,
          totalCategories: categories.length,
          totalShortlisted: 0,
          availableFinalists: 0,
        },
      };
    }

    const winners: WinnerRecord[] = (rawWinners || []).map((w: any) => {
      const app = w.applications;
      const catObj = Array.isArray(app?.categories) ? app.categories[0] : app?.categories;
      const userObj = Array.isArray(app?.users) ? app.users[0] : app?.users;

      return {
        id: w.id,
        applicationId: w.application_id,
        editionId: w.edition_id,
        categoryId: w.category_id,
        categoryCode: catObj?.code || "",
        categoryName: catObj?.name || "",
        awardTitle: w.award_title,
        winnerType: (w.winner_type as WinnerType) || "winner",
        winnerTitle: w.winner_title || w.award_title,
        projectName: w.project_name || app?.project_name || "",
        entrantName: w.entrant_name || userObj?.full_name || "",
        organizationName: w.organization_name || userObj?.organization || "",
        projectLocation: w.project_location || `${app?.project_city || ""}, ${app?.project_state || ""}`,
        summaryDescription: w.summary_description || "",
        citation: w.citation || "",
        projectStory: w.project_story || "",
        heroImageUrl: w.hero_image_url || "",
        galleryUrls: w.gallery_urls || [],
        publicationStatus: (w.publication_status as PublicationStatus) || "draft",
        isPublished: w.is_published,
        publishedAt: w.published_at,
        isFeatured: w.is_featured || false,
        displayOrder: w.display_order || 1,
        nominationId: app?.nomination_id || "",
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      };
    });

    // 3. Query official shortlisted candidates from authoritative application_shortlists
    const { data: rawShortlists, error: shortErr } = await adminClient
      .from("application_shortlists")
      .select("id, application_id, category_id, is_locked, created_at")
      .eq("edition_id", CURRENT_EDITION_ID);

    if (shortErr) {
      console.error("Error querying application_shortlists in winner workspace:", shortErr);
    }

    const shortlistedAppIds = Array.from(
      new Set((rawShortlists || []).map((s: any) => s.application_id).filter(Boolean))
    );
    const totalShortlisted = shortlistedAppIds.length;

    let shortlistedCandidates: WinnerCandidateItem[] = [];

    if (shortlistedAppIds.length > 0) {
      let candidateQuery = adminClient
        .from("applications")
        .select(`
          id,
          nomination_id,
          project_name,
          category_id,
          applicant_id,
          project_city,
          project_state,
          users:applicant_id(id, full_name),
          categories(id, name, code),
          application_files(upload_type, storage_path)
        `)
        .eq("edition_id", CURRENT_EDITION_ID)
        .in("id", shortlistedAppIds)
        .in("status", ["shortlisted", "winner"])
        .order("created_at", { ascending: false });

      if (params?.categoryId && params.categoryId !== "all") {
        candidateQuery = candidateQuery.eq("category_id", params.categoryId);
      }

      const { data: rawCandidates, error: candErr } = await candidateQuery;
      if (candErr) {
        console.error("Error querying candidate applications:", candErr);
      }

      const candidateApplicantIds = Array.from(
        new Set((rawCandidates || []).map((c: any) => c.applicant_id).filter(Boolean))
      );
      const candidateOrgMap = new Map<string, string>();
      if (candidateApplicantIds.length > 0) {
        const { data: candidateProfiles } = await adminClient
          .from("applicant_profiles")
          .select("user_id, organization_name")
          .in("user_id", candidateApplicantIds);

        (candidateProfiles || []).forEach((p) => {
          if (p.organization_name) {
            candidateOrgMap.set(p.user_id, p.organization_name);
          }
        });
      }

      shortlistedCandidates = await Promise.all(
        (rawCandidates || []).map(async (c: any) => {
          const catObj = Array.isArray(c.categories) ? c.categories[0] : c.categories;
          const userObj = Array.isArray(c.users) ? c.users[0] : c.users;
          const cover = (c.application_files || []).find(
            (f: any) => f.upload_type === "cover_image" || f.upload_type === "project_photo"
          );

          let coverImageUrl: string | undefined;
          if (cover?.storage_path) {
            const { data: signed } = await adminClient.storage
              .from("nomination-files")
              .createSignedUrl(cover.storage_path, 3600);
            coverImageUrl = signed?.signedUrl;
          }

          return {
            id: c.id,
            nominationId: c.nomination_id,
            projectName: c.project_name,
            categoryId: c.category_id,
            categoryName: catObj?.name || "",
            categoryCode: catObj?.code || "",
            applicantName: userObj?.full_name || "",
            organization: candidateOrgMap.get(c.applicant_id) || "",
            projectCity: c.project_city || "",
            projectState: c.project_state || "",
            coverImageUrl,
          };
        })
      );
    }

    // 4. Calculate statistics
    const totalWinners = winners.length;
    const totalApproved = winners.filter((w) => w.publicationStatus === "approved" || w.isPublished).length;
    const totalPublished = winners.filter((w) => w.isPublished).length;
    const uniqueWinnerCategories = new Set(winners.map((w) => w.categoryId)).size;
    const winnerAppIds = new Set(winners.map((w) => w.applicationId));
    const availableFinalists = shortlistedCandidates.filter((c) => !winnerAppIds.has(c.id)).length;

    return {
      success: true,
      categories,
      winners,
      shortlistedCandidates,
      stats: {
        totalWinners,
        totalApproved,
        totalPublished,
        categoriesWithWinnersCount: uniqueWinnerCategories,
        totalCategories: categories.length,
        totalShortlisted,
        availableFinalists,
      },
    };
  } catch (err: any) {
    console.error("Exception in getWinnersWorkspaceData:", err);
    return {
      success: false,
      error: err.message || "Failed to load winner management workspace.",
      categories: [],
      winners: [],
      shortlistedCandidates: [],
      stats: {
        totalWinners: 0,
        totalApproved: 0,
        totalPublished: 0,
        categoriesWithWinnersCount: 0,
        totalCategories: 0,
        totalShortlisted: 0,
        availableFinalists: 0,
      },
    };
  }
}

/**
 * Designates an entry as Winner, Runner-Up, or Special Commendation for its category.
 * Enforces category primary winner uniqueness (only 1 "Winner" award per category).
 * Initializes winner profile in 'draft' publication status.
 */
export async function selectWinner(
  applicationId: string,
  payload: {
    awardTitle: string; // e.g. "Winner", "Runner-Up", "Special Commendation"
    winnerType: WinnerType;
    citation?: string;
    projectStory?: string;
    heroImageUrl?: string;
    displayOrder?: number;
  }
): Promise<{ success: boolean; error?: string; winnerId?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required to designate winners." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch application details
    const { data: app, error: appErr } = await adminClient
      .from("applications")
      .select(`
        id,
        nomination_id,
        edition_id,
        category_id,
        project_name,
        project_city,
        project_state,
        status,
        users!applications_user_id_fkey(full_name, organization)
      `)
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return { success: false, error: "Application not found." };
    }

    if (app.status === "rejected" || app.status === "disqualified") {
      return {
        success: false,
        error: `Cannot designate a ${app.status.toUpperCase()} entry as an award winner.`,
      };
    }

    // 2. Enforce Category Primary Winner Rule:
    // Only one entry may hold the primary "Winner" award title in each category.
    if (payload.awardTitle.trim().toLowerCase() === "winner" || payload.winnerType === "winner") {
      const { data: existingPrimary } = await adminClient
        .from("winners")
        .select("id, application_id, award_title")
        .eq("category_id", app.category_id)
        .eq("award_title", "Winner")
        .neq("application_id", applicationId)
        .maybeSingle();

      if (existingPrimary) {
        return {
          success: false,
          error: `Category Constraint: A primary 'Winner' has already been designated for this category. Please reassign the previous winner as 'Runner-Up' or remove it before designating a new primary winner.`,
        };
      }
    }

    const now = new Date().toISOString();
    const userObj = Array.isArray(app.users) ? app.users[0] : app.users;

    // 3. Upsert into winners table
    const { data: winnerRecord, error: winErr } = await adminClient
      .from("winners")
      .upsert(
        {
          application_id: app.id,
          edition_id: app.edition_id,
          category_id: app.category_id,
          award_title: payload.awardTitle.trim(),
          winner_type: payload.winnerType,
          winner_title: `${payload.awardTitle.trim()} — ${app.project_name}`,
          project_name: app.project_name,
          entrant_name: userObj?.full_name || "",
          organization_name: userObj?.organization || "",
          project_location: `${app.project_city || ""}, ${app.project_state || ""}`,
          citation: payload.citation?.trim() || null,
          project_story: payload.projectStory?.trim() || null,
          hero_image_url: payload.heroImageUrl?.trim() || null,
          gallery_urls: [],
          is_published: false,
          publication_status: "draft",
          display_order: payload.displayOrder || 1,
          updated_at: now,
        },
        { onConflict: "application_id" }
      )
      .select("id")
      .single();

    if (winErr || !winnerRecord) {
      console.error("Error creating winner record:", winErr);
      return { success: false, error: `Failed to create winner record: ${winErr?.message}` };
    }

    // 4. Transition application status to 'winner'
    if (app.status !== "winner") {
      await adminClient
        .from("applications")
        .update({ status: "winner", updated_at: now })
        .eq("id", app.id);

      await adminClient.from("application_status_history").insert({
        application_id: app.id,
        from_status: app.status,
        to_status: "winner",
        changed_by: session.user.id,
        comments: `Designated as official ${payload.awardTitle} by Awards Management.`,
        created_at: now,
      });
    }

    // 5. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_selected",
      entity_type: "winner",
      entity_id: winnerRecord.id,
      new_values: {
        nominationId: app.nomination_id,
        awardTitle: payload.awardTitle,
        winnerType: payload.winnerType,
        projectName: app.project_name,
      },
      created_at: now,
    });

    revalidatePath("/admin/winners");
    revalidatePath("/admin/shortlisting");
    revalidatePath("/dashboard");
    return { success: true, winnerId: winnerRecord.id };
  } catch (err: any) {
    console.error("Exception in selectWinner:", err);
    return { success: false, error: err.message || "Failed to designate winner." };
  }
}

/**
 * Removes a winner record and reverts the application status back to 'shortlisted'.
 */
export async function removeWinner(
  winnerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: winner, error: getErr } = await adminClient
      .from("winners")
      .select("id, application_id, award_title, is_published, applications(nomination_id, project_name)")
      .eq("id", winnerId)
      .single();

    if (getErr || !winner) {
      return { success: false, error: "Winner record not found." };
    }

    if (winner.is_published) {
      return {
        success: false,
        error: "Cannot delete a published winner directly. Please unpublish the winner first.",
      };
    }

    const now = new Date().toISOString();

    // 1. Delete winner record
    await adminClient.from("winners").delete().eq("id", winnerId);

    // 2. Revert application status back to 'shortlisted'
    await adminClient
      .from("applications")
      .update({ status: "shortlisted", updated_at: now })
      .eq("id", winner.application_id);

    await adminClient.from("application_status_history").insert({
      application_id: winner.application_id,
      from_status: "winner",
      to_status: "shortlisted",
      changed_by: session.user.id,
      comments: reason || "Winner designation removed; reverted to shortlisted.",
      created_at: now,
    });

    // 3. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_removed",
      entity_type: "winner",
      entity_id: winnerId,
      new_values: {
        awardTitle: winner.award_title,
        reason: reason || "Winner revoked",
      },
      created_at: now,
    });

    revalidatePath("/admin/winners");
    revalidatePath("/admin/shortlisting");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in removeWinner:", err);
    return { success: false, error: err.message || "Failed to remove winner." };
  }
}

/**
 * Updates the public editorial profile for a winner record.
 */
export async function updateWinnerProfile(
  winnerId: string,
  profile: WinnerProfilePayload
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { error: updateErr } = await adminClient
      .from("winners")
      .update({
        award_title: profile.awardTitle.trim(),
        winner_type: profile.winnerType,
        winner_title: profile.winnerTitle.trim(),
        project_name: profile.projectName.trim(),
        entrant_name: profile.entrantName.trim(),
        organization_name: profile.organizationName.trim(),
        project_location: profile.projectLocation.trim(),
        summary_description: profile.summaryDescription.trim(),
        citation: profile.citation.trim(),
        project_story: profile.projectStory.trim(),
        hero_image_url: profile.heroImageUrl.trim() || null,
        gallery_urls: profile.galleryUrls || [],
        is_featured: profile.isFeatured,
        display_order: profile.displayOrder || 1,
        updated_at: now,
      })
      .eq("id", winnerId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_profile_updated",
      entity_type: "winner",
      entity_id: winnerId,
      new_values: {
        winnerTitle: profile.winnerTitle,
        awardTitle: profile.awardTitle,
      },
      created_at: now,
    });

    revalidatePath("/admin/winners");
    revalidatePath("/winners");
    revalidatePath(`/winners/${winnerId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateWinnerProfile:", err);
    return { success: false, error: err.message || "Failed to update winner profile." };
  }
}

/**
 * Approves a winner profile for eventual publication.
 * Lifecycle transition: draft -> approved.
 */
export async function approveWinner(winnerId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("winners")
      .update({
        publication_status: "approved",
        updated_at: now,
      })
      .eq("id", winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_approved",
      entity_type: "winner",
      entity_id: winnerId,
      new_values: { publicationStatus: "approved" },
      created_at: now,
    });

    revalidatePath("/admin/winners");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in approveWinner:", err);
    return { success: false, error: err.message || "Failed to approve winner." };
  }
}

/**
 * Publishes an approved winner to the official public /winners showcase.
 * Sets is_published = TRUE and publication_status = 'published'.
 */
export async function publishWinner(winnerId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required to publish." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("winners")
      .update({
        is_published: true,
        publication_status: "published",
        published_at: now,
        published_by: session.user.id,
        updated_at: now,
      })
      .eq("id", winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_published",
      entity_type: "winner",
      entity_id: winnerId,
      new_values: { isPublished: true, publicationStatus: "published" },
      created_at: now,
    });

    // Phase F: Official Winner Published Notification (Email + In-App, idempotent)
    const { data: winnerData } = await adminClient
      .from("winners")
      .select(`
        id,
        award_title,
        winner_type,
        project_name,
        entrant_name,
        application_id,
        applications(id, nomination_id, applicant_id, categories(name))
      `)
      .eq("id", winnerId)
      .maybeSingle();

    const appObj = Array.isArray(winnerData?.applications)
      ? winnerData.applications[0]
      : winnerData?.applications;
    const catObj = Array.isArray(appObj?.categories)
      ? appObj.categories[0]
      : appObj?.categories;

    if (appObj?.applicant_id) {
      sendNotification({
        eventType: "winner_published",
        recipientUserId: appObj.applicant_id,
        recipientName: winnerData?.entrant_name || undefined,
        applicationId: appObj.id,
        nominationId: appObj.nomination_id,
        data: {
          projectName: winnerData?.project_name || "",
          categoryName: catObj?.name || "",
          awardTitle: winnerData?.award_title || "Honoree",
        },
        idempotencyKey: `winner_published:${winnerId}`,
        channels: ["email", "in_app"],
      }).catch((err) => console.error("Winner published notification notice:", err));
    }

    revalidatePath("/admin/winners");
    revalidatePath("/winners");
    revalidatePath(`/winners/${winnerId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in publishWinner:", err);
    return { success: false, error: err.message || "Failed to publish winner." };
  }
}

/**
 * Unpublishes a winner from the public showcase.
 * Sets is_published = FALSE and reverts publication_status = 'approved'.
 */
export async function unpublishWinner(
  winnerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("winners")
      .update({
        is_published: false,
        publication_status: "approved",
        updated_at: now,
      })
      .eq("id", winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "winner_unpublished",
      entity_type: "winner",
      entity_id: winnerId,
      new_values: { reason: reason || "Unpublished from public showcase" },
      created_at: now,
    });

    revalidatePath("/admin/winners");
    revalidatePath("/winners");
    revalidatePath(`/winners/${winnerId}`);
    return { success: true };
  } catch (err: any) {
    console.error("Exception in unpublishWinner:", err);
    return { success: false, error: err.message || "Failed to unpublish winner." };
  }
}

/**
 * Bulk publishes all approved winners across categories for the grand gala release.
 */
export async function publishAllApprovedWinners(
  editionId: string = CURRENT_EDITION_ID
): Promise<{ success: boolean; count?: number; error?: string }> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Administrator permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const now = new Date().toISOString();

    const { data: updated, error } = await adminClient
      .from("winners")
      .update({
        is_published: true,
        publication_status: "published",
        published_at: now,
        published_by: session.user.id,
        updated_at: now,
      })
      .eq("edition_id", editionId)
      .eq("publication_status", "approved")
      .select("id");

    if (error) {
      return { success: false, error: error.message };
    }

    const count = updated?.length || 0;

    await adminClient.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "all_approved_winners_published",
      entity_type: "award_edition",
      entity_id: editionId,
      new_values: { publishedCount: count },
      created_at: now,
    });

    // Phase F: Notify each published winner in batch (idempotent, non-blocking)
    if (updated && updated.length > 0) {
      const updatedIds = updated.map((u: any) => u.id);
      const { data: allWinners } = await adminClient
        .from("winners")
        .select(`
          id,
          award_title,
          project_name,
          entrant_name,
          applications(id, nomination_id, applicant_id, categories(name))
        `)
        .in("id", updatedIds);

      (allWinners || []).forEach((w: any) => {
        const appObj = Array.isArray(w.applications) ? w.applications[0] : w.applications;
        const catObj = Array.isArray(appObj?.categories) ? appObj.categories[0] : appObj?.categories;
        if (appObj?.applicant_id) {
          sendNotification({
            eventType: "winner_published",
            recipientUserId: appObj.applicant_id,
            recipientName: w.entrant_name,
            applicationId: appObj.id,
            nominationId: appObj.nomination_id,
            data: {
              projectName: w.project_name,
              categoryName: catObj?.name,
              awardTitle: w.award_title || "Honoree",
            },
            idempotencyKey: `winner_published:${w.id}`,
            channels: ["email", "in_app"],
          }).catch((err) => console.error("Batch winner notify notice:", err));
        }
      });
    }

    revalidatePath("/admin/winners");
    revalidatePath("/winners");
    return { success: true, count };
  } catch (err: any) {
    console.error("Exception in publishAllApprovedWinners:", err);
    return { success: false, error: err.message || "Failed to publish approved winners." };
  }
}
