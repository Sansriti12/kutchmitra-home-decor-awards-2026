import { createClient } from "@/lib/supabase/server";
import { TIMELINE_MILESTONES } from "@/data/timeline";
import { HOMEPAGE_FAQS } from "@/data/faqs";
import type {
  CmsImportantDate,
  CmsFaq,
  CmsAnnouncement,
  CmsSiteSettings,
  CmsJuryProfileItem,
} from "./types";

// Default Fallback Site Settings
export const DEFAULT_SITE_SETTINGS: CmsSiteSettings = {
  id: "current",
  officeAddress: "Kutchmitra\nNr. Indirabai Park\nBhuj, Kutch – 370001",
  officialEmail: "Kutchmitraweb@gmail.com",
  helplinePhone: "+91 7211189211",
  supportHours: "Monday – Saturday: 10:00 AM – 6:00 PM IST",
  privacyContactEmail: "Kutchmitraweb@gmail.com",
  homepageBannerActive: false,
  homepageBannerBadge: "ANNOUNCEMENT",
  homepageBannerText: "Nominations for the 2026 edition are opening soon across all 16 proposed categories.",
  homepageBannerLink: "/categories",
  homepageBannerLinkText: "View Categories",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Fetch published Important Dates from CMS.
 * Fallback guarantee: Returns static TIMELINE_MILESTONES if DB is empty or fails.
 */
export async function getPublicImportantDates(): Promise<CmsImportantDate[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cms_important_dates")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return TIMELINE_MILESTONES.map((m, idx) => ({
        id: `fallback-${m.number}`,
        milestoneNumber: m.number,
        title: m.title,
        description: m.description,
        dateText: m.date,
        startDate: null,
        endDate: null,
        status: "published" as const,
        isActive: true,
        displayOrder: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return (data as any[]).map((d) => ({
      id: d.id,
      milestoneNumber: d.milestone_number,
      title: d.title,
      description: d.description,
      dateText: d.date_text,
      startDate: d.start_date,
      endDate: d.end_date,
      status: d.status,
      isActive: d.is_active,
      displayOrder: d.display_order,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.warn("Using fallback important dates:", err);
    return TIMELINE_MILESTONES.map((m, idx) => ({
      id: `fallback-${m.number}`,
      milestoneNumber: m.number,
      title: m.title,
      description: m.description,
      dateText: m.date,
      startDate: null,
      endDate: null,
      status: "published" as const,
      isActive: true,
      displayOrder: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Fetch published FAQs from CMS.
 * Fallback guarantee: Returns static FAQ list if DB is empty or fails.
 */
export async function getPublicFaqs(): Promise<CmsFaq[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cms_faqs")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return HOMEPAGE_FAQS.map((f, idx) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: "General",
        status: "published" as const,
        isActive: true,
        isFeaturedHomepage: true,
        displayOrder: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return (data as any[]).map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      status: f.status,
      isActive: f.is_active,
      isFeaturedHomepage: f.is_featured_homepage,
      displayOrder: f.display_order,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
  } catch (err) {
    console.warn("Using fallback FAQs:", err);
    return HOMEPAGE_FAQS.map((f, idx) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: "General",
      status: "published" as const,
      isActive: true,
      isFeaturedHomepage: true,
      displayOrder: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Fetch published FAQs for Homepage display.
 */
export async function getPublicHomepageFaqs(): Promise<CmsFaq[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cms_faqs")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .eq("is_featured_homepage", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return HOMEPAGE_FAQS.map((f, idx) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: "General",
        status: "published" as const,
        isActive: true,
        isFeaturedHomepage: true,
        displayOrder: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return (data as any[]).map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      status: f.status,
      isActive: f.is_active,
      isFeaturedHomepage: f.is_featured_homepage,
      displayOrder: f.display_order,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
  } catch (err) {
    console.warn("Using fallback homepage FAQs:", err);
    return HOMEPAGE_FAQS.map((f, idx) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: "General",
      status: "published" as const,
      isActive: true,
      isFeaturedHomepage: true,
      displayOrder: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Fetch published Announcements for public site.
 */
export async function getPublicAnnouncements(): Promise<CmsAnnouncement[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cms_announcements")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];

    return (data as any[]).map((a) => ({
      id: a.id,
      title: a.title,
      shortDescription: a.short_description,
      content: a.content,
      announcementType: a.announcement_type,
      badgeText: a.badge_text,
      actionUrl: a.action_url,
      actionLabel: a.action_label,
      imageUrl: a.image_url,
      publishDate: a.publish_date,
      expiryDate: a.expiry_date,
      status: a.status,
      isActive: a.is_active,
      displayOrder: a.display_order,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
  } catch (err) {
    console.warn("Error fetching public announcements:", err);
    return [];
  }
}

/**
 * Fetch official Site Settings and contact info.
 */
export async function getPublicSiteSettings(): Promise<CmsSiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cms_site_settings")
      .select("*")
      .eq("id", "current")
      .maybeSingle();

    if (error || !data) return DEFAULT_SITE_SETTINGS;

    const s = data as any;
    return {
      id: s.id,
      officeAddress: s.office_address || DEFAULT_SITE_SETTINGS.officeAddress,
      officialEmail: s.official_email || DEFAULT_SITE_SETTINGS.officialEmail,
      helplinePhone: s.helpline_phone || DEFAULT_SITE_SETTINGS.helplinePhone,
      supportHours: s.support_hours || DEFAULT_SITE_SETTINGS.supportHours,
      privacyContactEmail: s.privacy_contact_email || DEFAULT_SITE_SETTINGS.privacyContactEmail,
      homepageBannerActive: s.homepage_banner_active ?? false,
      homepageBannerBadge: s.homepage_banner_badge || DEFAULT_SITE_SETTINGS.homepageBannerBadge,
      homepageBannerText: s.homepage_banner_text || DEFAULT_SITE_SETTINGS.homepageBannerText,
      homepageBannerLink: s.homepage_banner_link || DEFAULT_SITE_SETTINGS.homepageBannerLink,
      homepageBannerLinkText: s.homepage_banner_link_text || DEFAULT_SITE_SETTINGS.homepageBannerLinkText,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    };
  } catch (err) {
    console.warn("Using fallback site settings:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Fetch published Jury Profiles.
 * Returns empty array if none have is_public = true, allowing public page to show announcement card.
 */
export async function getPublicJuryProfiles(): Promise<CmsJuryProfileItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
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
      .eq("is_public", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];

    return data.map((j: any) => {
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
        isPublic: true,
        createdAt: j.created_at,
        updatedAt: j.updated_at,
      };
    });
  } catch (err) {
    console.warn("Error fetching public jury profiles:", err);
    return [];
  }
}
