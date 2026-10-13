"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession, isManagementAuthorized } from "@/lib/admin/auth";
import { getCategoryDisplayNumber, getActiveCategories } from "@/lib/utils";
import type {
  CmsImportantDate,
  CmsFaq,
  CmsAnnouncement,
  CmsSiteSettings,
  CmsJuryProfileItem,
  CmsCategoryItem,
  CmsWorkspaceData,
} from "./types";

/**
 * Audit logging helper for CMS administrative operations.
 */
async function logCmsAudit(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
}) {
  const adminClient = createAdminClient();
  try {
    await adminClient.from("audit_logs").insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Failed to write to audit_logs for CMS:", err);
  }
}

/**
 * Fetch all CMS workspace data for Admin CMS dashboard.
 * Restricted to Super Admin and Admin (Management).
 */
export async function getCmsWorkspaceData(): Promise<CmsWorkspaceData> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return {
      success: false,
      error: "Unauthorized: CMS access is restricted to Management and Super Administrators.",
      dates: [],
      faqs: [],
      announcements: [],
      siteSettings: {
        id: "current",
        officeAddress: "",
        officialEmail: "",
        helplinePhone: "",
        supportHours: "",
        privacyContactEmail: "",
        homepageBannerActive: false,
        homepageBannerBadge: "",
        homepageBannerText: "",
        homepageBannerLink: "",
        homepageBannerLinkText: "",
        createdAt: "",
        updatedAt: "",
      },
      juryProfiles: [],
      categories: [],
      winnerStats: {
        totalWinners: 0,
        publishedWinners: 0,
      },
    };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch Important Dates
    const { data: rawDates } = await adminClient
      .from("cms_important_dates")
      .select("*")
      .order("display_order", { ascending: true });

    const dates: CmsImportantDate[] = (rawDates || []).map((d) => ({
      id: d.id,
      milestoneNumber: d.milestone_number,
      title: d.title,
      description: d.description,
      dateText: d.date_text,
      startDate: d.start_date,
      endDate: d.end_date,
      status: (d.status as any) || "published",
      isActive: d.is_active,
      displayOrder: d.display_order,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    // 2. Fetch FAQs
    const { data: rawFaqs } = await adminClient
      .from("cms_faqs")
      .select("*")
      .order("display_order", { ascending: true });

    const faqs: CmsFaq[] = (rawFaqs || []).map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      status: (f.status as any) || "published",
      isActive: f.is_active,
      isFeaturedHomepage: f.is_featured_homepage,
      displayOrder: f.display_order,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    // 3. Fetch Announcements
    const { data: rawAnnouncements } = await adminClient
      .from("cms_announcements")
      .select("*")
      .order("display_order", { ascending: true });

    const announcements: CmsAnnouncement[] = (rawAnnouncements || []).map((a) => ({
      id: a.id,
      title: a.title,
      shortDescription: a.short_description,
      content: a.content,
      announcementType: (a.announcement_type as any) || "general",
      badgeText: a.badge_text,
      actionUrl: a.action_url,
      actionLabel: a.action_label,
      imageUrl: a.image_url,
      publishDate: a.publish_date,
      expiryDate: a.expiry_date,
      status: (a.status as any) || "published",
      isActive: a.is_active,
      displayOrder: a.display_order,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    // 4. Fetch Site Settings
    const { data: rawSettings } = await adminClient
      .from("cms_site_settings")
      .select("*")
      .eq("id", "current")
      .maybeSingle();

    const siteSettings: CmsSiteSettings = {
      id: rawSettings?.id || "current",
      officeAddress: rawSettings?.office_address || "Kutchmitra\nNr. Indirabai Park\nBhuj, Kutch – 370001",
      officialEmail: rawSettings?.official_email || "Kutchmitraweb@gmail.com",
      helplinePhone: rawSettings?.helpline_phone || "+91 7211189211",
      supportHours: rawSettings?.support_hours || "Monday – Saturday: 10:00 AM – 6:00 PM IST",
      privacyContactEmail: rawSettings?.privacy_contact_email || "Kutchmitraweb@gmail.com",
      homepageBannerActive: rawSettings?.homepage_banner_active ?? false,
      homepageBannerBadge: rawSettings?.homepage_banner_badge || "ANNOUNCEMENT",
      homepageBannerText: rawSettings?.homepage_banner_text || "Nominations for the 2026 edition are opening soon across all 14 categories.",
      homepageBannerLink: rawSettings?.homepage_banner_link || "/categories",
      homepageBannerLinkText: rawSettings?.homepage_banner_link_text || "View Categories",
      createdAt: rawSettings?.created_at || new Date().toISOString(),
      updatedAt: rawSettings?.updated_at || new Date().toISOString(),
    };

    // 5. Fetch Public Jury Profiles (reusing existing jury_profiles & users table)
    const { data: rawJury } = await adminClient
      .from("jury_profiles")
      .select(`
        id,
        user_id,
        honorific,
        organization,
        designation,
        bio,
        photo_url,
        display_order,
        is_public,
        created_at,
        updated_at,
        users:user_id(id, full_name, email)
      `)
      .order("display_order", { ascending: true });

    const juryProfiles: CmsJuryProfileItem[] = (rawJury || []).map((j: any) => {
      const u = Array.isArray(j.users) ? j.users[0] : j.users;
      return {
        id: j.id,
        userId: j.user_id,
        jurorName: u?.full_name || "Jury Member",
        email: u?.email || "",
        honorific: j.honorific,
        organization: j.organization,
        designation: j.designation,
        bio: j.bio,
        photoUrl: j.photo_url,
        displayOrder: j.display_order,
        isPublic: j.is_public ?? false,
        createdAt: j.created_at,
        updatedAt: j.updated_at,
      };
    });

    // 6. Fetch Categories (Strictly active categories, 14 count, sequential 01–14)
    const { data: rawCategories } = await adminClient
      .from("categories")
      .select("id, code, name, slug, short_description, full_description, eligibility_criteria, cover_image_url, is_active, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    const categories: CmsCategoryItem[] = getActiveCategories(rawCategories).map((c: any) => ({
      id: c.id,
      code: c.code,
      displayNumber: c.displayNumber,
      name: c.name,
      slug: c.slug,
      shortDescription: c.short_description || c.shortDescription || null,
      fullDescription: c.full_description || c.fullDescription || null,
      eligibilityCriteria: c.eligibility_criteria || c.eligibilityCriteria || null,
      coverImageUrl: c.cover_image_url || c.coverImageUrl || null,
      isActive: c.is_active ?? true,
      displayOrder: c.display_order ?? c.displayOrder ?? 0,
    }));

    // 7. Winner Stats
    const { data: rawWinners } = await adminClient
      .from("winners")
      .select("id, is_published");

    const winnerStats = {
      totalWinners: (rawWinners || []).length,
      publishedWinners: (rawWinners || []).filter((w) => w.is_published).length,
    };

    return {
      success: true,
      dates,
      faqs,
      announcements,
      siteSettings,
      juryProfiles,
      categories,
      winnerStats,
    };
  } catch (err: any) {
    console.error("Error in getCmsWorkspaceData:", err);
    return {
      success: false,
      error: `Failed to load CMS data: ${err.message}`,
      dates: [],
      faqs: [],
      announcements: [],
      siteSettings: {
        id: "current",
        officeAddress: "",
        officialEmail: "",
        helplinePhone: "",
        supportHours: "",
        privacyContactEmail: "",
        homepageBannerActive: false,
        homepageBannerBadge: "",
        homepageBannerText: "",
        homepageBannerLink: "",
        homepageBannerLinkText: "",
        createdAt: "",
        updatedAt: "",
      },
      juryProfiles: [],
      categories: [],
      winnerStats: { totalWinners: 0, publishedWinners: 0 },
    };
  }
}

// ==============================================================================
// IMPORTANT DATES ACTIONS
// ==============================================================================

export async function saveCmsImportantDate(payload: {
  id?: string;
  milestoneNumber: string;
  title: string;
  description: string;
  dateText: string;
  startDate?: string | null;
  endDate?: string | null;
  status: "draft" | "published" | "archived";
  isActive: boolean;
  displayOrder: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    if (payload.id) {
      // Update existing
      const { data: prev } = await adminClient
        .from("cms_important_dates")
        .select("*")
        .eq("id", payload.id)
        .single();

      const { data, error } = await adminClient
        .from("cms_important_dates")
        .update({
          milestone_number: payload.milestoneNumber.trim(),
          title: payload.title.trim(),
          description: payload.description.trim(),
          date_text: payload.dateText.trim(),
          start_date: payload.startDate || null,
          end_date: payload.endDate || null,
          status: payload.status,
          is_active: payload.isActive,
          display_order: payload.displayOrder,
          updated_at: now,
          updated_by: session.user.id,
        })
        .eq("id", payload.id)
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_important_date_updated",
        entityType: "cms_important_dates",
        entityId: payload.id,
        oldValues: prev,
        newValues: payload,
      });

      revalidatePath("/important-dates");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    } else {
      // Create new
      const { data, error } = await adminClient
        .from("cms_important_dates")
        .insert({
          milestone_number: payload.milestoneNumber.trim(),
          title: payload.title.trim(),
          description: payload.description.trim(),
          date_text: payload.dateText.trim(),
          start_date: payload.startDate || null,
          end_date: payload.endDate || null,
          status: payload.status,
          is_active: payload.isActive,
          display_order: payload.displayOrder,
          created_at: now,
          updated_at: now,
          created_by: session.user.id,
          updated_by: session.user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_important_date_created",
        entityType: "cms_important_dates",
        entityId: data.id,
        newValues: payload,
      });

      revalidatePath("/important-dates");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    }
  } catch (err: any) {
    console.error("Error saving CMS important date:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteCmsImportantDate(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: prev } = await adminClient
      .from("cms_important_dates")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await adminClient.from("cms_important_dates").delete().eq("id", id);
    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_important_date_deleted",
      entityType: "cms_important_dates",
      entityId: id,
      oldValues: prev,
    });

    revalidatePath("/important-dates");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting CMS important date:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// FAQS ACTIONS
// ==============================================================================

export async function saveCmsFaq(payload: {
  id?: string;
  question: string;
  answer: string;
  category: string;
  status: "draft" | "published" | "archived";
  isActive: boolean;
  isFeaturedHomepage: boolean;
  displayOrder: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    if (payload.id) {
      const { data: prev } = await adminClient
        .from("cms_faqs")
        .select("*")
        .eq("id", payload.id)
        .single();

      const { data, error } = await adminClient
        .from("cms_faqs")
        .update({
          question: payload.question.trim(),
          answer: payload.answer.trim(),
          category: payload.category.trim() || "General",
          status: payload.status,
          is_active: payload.isActive,
          is_featured_homepage: payload.isFeaturedHomepage,
          display_order: payload.displayOrder,
          updated_at: now,
          updated_by: session.user.id,
        })
        .eq("id", payload.id)
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_faq_updated",
        entityType: "cms_faqs",
        entityId: payload.id,
        oldValues: prev,
        newValues: payload,
      });

      revalidatePath("/faqs");
      revalidatePath("/");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    } else {
      const { data, error } = await adminClient
        .from("cms_faqs")
        .insert({
          question: payload.question.trim(),
          answer: payload.answer.trim(),
          category: payload.category.trim() || "General",
          status: payload.status,
          is_active: payload.isActive,
          is_featured_homepage: payload.isFeaturedHomepage,
          display_order: payload.displayOrder,
          created_at: now,
          updated_at: now,
          created_by: session.user.id,
          updated_by: session.user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_faq_created",
        entityType: "cms_faqs",
        entityId: data.id,
        newValues: payload,
      });

      revalidatePath("/faqs");
      revalidatePath("/");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    }
  } catch (err: any) {
    console.error("Error saving CMS FAQ:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteCmsFaq(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: prev } = await adminClient.from("cms_faqs").select("*").eq("id", id).single();

    const { error } = await adminClient.from("cms_faqs").delete().eq("id", id);
    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_faq_deleted",
      entityType: "cms_faqs",
      entityId: id,
      oldValues: prev,
    });

    revalidatePath("/faqs");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting CMS FAQ:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// ANNOUNCEMENTS ACTIONS
// ==============================================================================

export async function saveCmsAnnouncement(payload: {
  id?: string;
  title: string;
  shortDescription?: string | null;
  content?: string | null;
  announcementType: "general" | "deadline" | "event" | "alert";
  badgeText?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  imageUrl?: string | null;
  publishDate?: string | null;
  expiryDate?: string | null;
  status: "draft" | "published" | "archived";
  isActive: boolean;
  displayOrder: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    if (payload.id) {
      const { data: prev } = await adminClient
        .from("cms_announcements")
        .select("*")
        .eq("id", payload.id)
        .single();

      const { data, error } = await adminClient
        .from("cms_announcements")
        .update({
          title: payload.title.trim(),
          short_description: payload.shortDescription ? payload.shortDescription.trim() : null,
          content: payload.content ? payload.content.trim() : null,
          announcement_type: payload.announcementType,
          badge_text: payload.badgeText ? payload.badgeText.trim() : null,
          action_url: payload.actionUrl ? payload.actionUrl.trim() : null,
          action_label: payload.actionLabel ? payload.actionLabel.trim() : null,
          image_url: payload.imageUrl ? payload.imageUrl.trim() : null,
          publish_date: payload.publishDate || now,
          expiry_date: payload.expiryDate || null,
          status: payload.status,
          is_active: payload.isActive,
          display_order: payload.displayOrder,
          updated_at: now,
          updated_by: session.user.id,
        })
        .eq("id", payload.id)
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_announcement_updated",
        entityType: "cms_announcements",
        entityId: payload.id,
        oldValues: prev,
        newValues: payload,
      });

      revalidatePath("/");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    } else {
      const { data, error } = await adminClient
        .from("cms_announcements")
        .insert({
          title: payload.title.trim(),
          short_description: payload.shortDescription ? payload.shortDescription.trim() : null,
          content: payload.content ? payload.content.trim() : null,
          announcement_type: payload.announcementType,
          badge_text: payload.badgeText ? payload.badgeText.trim() : null,
          action_url: payload.actionUrl ? payload.actionUrl.trim() : null,
          action_label: payload.actionLabel ? payload.actionLabel.trim() : null,
          image_url: payload.imageUrl ? payload.imageUrl.trim() : null,
          publish_date: payload.publishDate || now,
          expiry_date: payload.expiryDate || null,
          status: payload.status,
          is_active: payload.isActive,
          display_order: payload.displayOrder,
          created_at: now,
          updated_at: now,
          created_by: session.user.id,
          updated_by: session.user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      await logCmsAudit({
        actorId: session.user.id,
        action: "cms_announcement_created",
        entityType: "cms_announcements",
        entityId: data.id,
        newValues: payload,
      });

      revalidatePath("/");
      revalidatePath("/admin/cms");
      return { success: true, id: data.id };
    }
  } catch (err: any) {
    console.error("Error saving CMS announcement:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteCmsAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();

  try {
    const { data: prev } = await adminClient.from("cms_announcements").select("*").eq("id", id).single();

    const { error } = await adminClient.from("cms_announcements").delete().eq("id", id);
    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_announcement_deleted",
      entityType: "cms_announcements",
      entityId: id,
      oldValues: prev,
    });

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting CMS announcement:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// SITE SETTINGS & CONTACT INFO ACTIONS
// ==============================================================================

export async function saveCmsSiteSettings(payload: {
  officeAddress: string;
  officialEmail: string;
  helplinePhone: string;
  supportHours: string;
  privacyContactEmail: string;
  homepageBannerActive: boolean;
  homepageBannerBadge: string;
  homepageBannerText: string;
  homepageBannerLink: string;
  homepageBannerLinkText: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    const { data: prev } = await adminClient
      .from("cms_site_settings")
      .select("*")
      .eq("id", "current")
      .maybeSingle();

    const { error } = await adminClient
      .from("cms_site_settings")
      .upsert(
        {
          id: "current",
          office_address: payload.officeAddress.trim(),
          official_email: payload.officialEmail.trim(),
          helpline_phone: payload.helplinePhone.trim(),
          support_hours: payload.supportHours.trim(),
          privacy_contact_email: payload.privacyContactEmail.trim(),
          homepage_banner_active: payload.homepageBannerActive,
          homepage_banner_badge: payload.homepageBannerBadge.trim(),
          homepage_banner_text: payload.homepageBannerText.trim(),
          homepage_banner_link: payload.homepageBannerLink.trim(),
          homepage_banner_link_text: payload.homepageBannerLinkText.trim(),
          updated_at: now,
          updated_by: session.user.id,
        },
        { onConflict: "id" }
      );

    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_site_settings_updated",
      entityType: "cms_site_settings",
      entityId: "current",
      oldValues: prev,
      newValues: payload,
    });

    revalidatePath("/contact");
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving CMS site settings:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// PUBLIC JURY PROFILE ACTIONS (REUSING jury_profiles)
// ==============================================================================

export async function updateCmsJuryProfile(
  id: string,
  payload: {
    honorific?: string | null;
    organization?: string | null;
    designation?: string | null;
    bio?: string | null;
    photoUrl?: string | null;
    displayOrder: number;
    isPublic: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    const { data: prev } = await adminClient.from("jury_profiles").select("*").eq("id", id).single();

    const { error } = await adminClient
      .from("jury_profiles")
      .update({
        honorific: payload.honorific ? payload.honorific.trim() : null,
        organization: payload.organization ? payload.organization.trim() : null,
        designation: payload.designation ? payload.designation.trim() : null,
        bio: payload.bio ? payload.bio.trim() : null,
        photo_url: payload.photoUrl ? payload.photoUrl.trim() : null,
        display_order: payload.displayOrder,
        is_public: payload.isPublic,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_jury_profile_updated",
      entityType: "jury_profiles",
      entityId: id,
      oldValues: prev,
      newValues: payload,
    });

    revalidatePath("/jury");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating CMS jury profile:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// CATEGORY CONTENT ACTIONS (REUSING categories)
// STRICT SAFETY: Preserves Category 03 inactive, preserves category codes & UUIDs
// ==============================================================================

export async function updateCmsCategoryContent(
  id: string,
  payload: {
    shortDescription?: string | null;
    fullDescription?: string | null;
    eligibilityCriteria?: string | null;
    coverImageUrl?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  try {
    const { data: prev } = await adminClient.from("categories").select("*").eq("id", id).single();

    // Critical Safety: Do NOT allow modifying code, is_active, display_order, or edition_id via CMS
    const { error } = await adminClient
      .from("categories")
      .update({
        short_description: payload.shortDescription ? payload.shortDescription.trim() : (prev?.short_description || ""),
        full_description: payload.fullDescription ? payload.fullDescription.trim() : null,
        eligibility_criteria: payload.eligibilityCriteria ? payload.eligibilityCriteria.trim() : null,
        cover_image_url: payload.coverImageUrl ? payload.coverImageUrl.trim() : null,
        updated_at: now,
      })
      .eq("id", id);

    if (error) throw error;

    await logCmsAudit({
      actorId: session.user.id,
      action: "cms_category_content_updated",
      entityType: "categories",
      entityId: id,
      oldValues: prev,
      newValues: payload,
    });

    revalidatePath("/categories");
    revalidatePath("/admin/cms");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating CMS category content:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// MEDIA / IMAGE UPLOAD TO cms-public-assets BUCKET
// ==============================================================================

export async function uploadCmsAsset(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await getAdminSession();
  if (!session || !isManagementAuthorized(session)) {
    return { success: false, error: "Unauthorized: Management permissions required." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided for upload." };
  }

  // Validate MIME type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type (${file.type}). Only JPG, PNG, WebP, and SVG images are permitted.`,
    };
  }

  // Validate File Size (max 5 MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted limit of 5MB.`,
    };
  }

  const adminClient = createAdminClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `cms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await adminClient.storage
      .from("cms-public-assets")
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = adminClient.storage
      .from("cms-public-assets")
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error("Error uploading CMS asset:", err);
    return { success: false, error: err.message };
  }
}
