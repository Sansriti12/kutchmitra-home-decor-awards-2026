import { createClient } from "@/lib/supabase/server";
import type { PublicWinnerCard, PublicWinnerDetail, WinnerType } from "@/types/shortlist-winner.types";

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

/**
 * Public Query for Winners Showcase (/winners).
 * SECURITY:
 *   - Strictly queries entries WHERE is_published = TRUE AND publication_status = 'published'.
 *   - Projections contain ONLY approved public fields.
 *   - Completely excludes jury evaluations, confidential ratings, scoring criteria,
 *     internal deliberation notes, and private applicant contact info.
 */
export async function getPublicWinners(params?: {
  categorySlug?: string;
  editionId?: string;
}): Promise<{
  winners: PublicWinnerCard[];
  categories: Array<{ id: string; name: string; code: string; slug: string; count: number }>;
}> {
  try {
    const supabase = createClient();
    const editionId = params?.editionId || CURRENT_EDITION_ID;

    // 1. Fetch active categories
    const { data: rawCategories } = await supabase
      .from("categories")
      .select("id, name, code, slug, display_order")
      .eq("is_active", true)
      .order("display_order");

    const categoriesList = (rawCategories || []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      slug: c.slug,
      count: 0,
    }));

    // 2. Fetch published winners with safe public projection
    let query = supabase
      .from("winners")
      .select(`
        id,
        award_title,
        winner_type,
        winner_title,
        project_name,
        entrant_name,
        organization_name,
        project_location,
        summary_description,
        citation,
        hero_image_url,
        is_featured,
        display_order,
        categories!winners_category_id_fkey(
          code,
          name,
          slug
        )
      `)
      .eq("edition_id", editionId)
      .eq("is_published", true)
      .eq("publication_status", "published")
      .order("display_order", { ascending: true });

    if (params?.categorySlug && params.categorySlug !== "all") {
      // Find category id by slug
      const cat = categoriesList.find((c) => c.slug === params.categorySlug);
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    const { data: rawWinners, error } = await query;
    if (error) {
      console.error("Public winners query error:", error);
      return { winners: [], categories: categoriesList };
    }

    // Count per category
    const catCountMap = new Map<string, number>();

    const winners: PublicWinnerCard[] = (rawWinners || []).map((w: any) => {
      const cat = Array.isArray(w.categories) ? w.categories[0] : w.categories;
      const catCode = cat?.code || "00";
      const catName = cat?.name || "";
      const catSlug = cat?.slug || "";

      catCountMap.set(catSlug, (catCountMap.get(catSlug) || 0) + 1);

      return {
        id: w.id,
        awardTitle: w.award_title,
        winnerType: (w.winner_type as WinnerType) || "winner",
        winnerTitle: w.winner_title || `${w.award_title} — ${w.project_name || "Project"}`,
        projectName: w.project_name || "",
        entrantName: w.entrant_name || "",
        organizationName: w.organization_name || "",
        projectLocation: w.project_location || "",
        summaryDescription: w.summary_description || w.citation || "",
        citation: w.citation || "",
        heroImageUrl: w.hero_image_url || "/images/award-placeholder.jpg",
        categoryCode: catCode,
        categoryName: catName,
        categorySlug: catSlug,
        isFeatured: w.is_featured,
        displayOrder: w.display_order,
      };
    });

    const enrichedCategories = categoriesList.map((c) => ({
      ...c,
      count: catCountMap.get(c.slug) || 0,
    }));

    return { winners, categories: enrichedCategories };
  } catch (err: any) {
    console.error("Exception in getPublicWinners:", err);
    return { winners: [], categories: [] };
  }
}

/**
 * Public Query for Single Winner Detail (/winners/[id]).
 * Returns 404/null if the winner is not published.
 */
export async function getPublicWinnerDetail(winnerId: string): Promise<PublicWinnerDetail | null> {
  try {
    const supabase = createClient();

    const { data: w, error } = await supabase
      .from("winners")
      .select(`
        id,
        award_title,
        winner_type,
        winner_title,
        project_name,
        entrant_name,
        organization_name,
        project_location,
        summary_description,
        citation,
        project_story,
        hero_image_url,
        gallery_urls,
        is_featured,
        display_order,
        published_at,
        categories!winners_category_id_fkey(
          code,
          name,
          slug
        )
      `)
      .eq("id", winnerId)
      .eq("is_published", true)
      .eq("publication_status", "published")
      .maybeSingle();

    if (error || !w) {
      return null;
    }

    const cat = Array.isArray(w.categories) ? w.categories[0] : w.categories;

    return {
      id: w.id,
      awardTitle: w.award_title,
      winnerType: (w.winner_type as WinnerType) || "winner",
      winnerTitle: w.winner_title || `${w.award_title} — ${w.project_name || "Project"}`,
      projectName: w.project_name || "",
      entrantName: w.entrant_name || "",
      organizationName: w.organization_name || "",
      projectLocation: w.project_location || "",
      summaryDescription: w.summary_description || "",
      citation: w.citation || "",
      projectStory: w.project_story || "",
      heroImageUrl: w.hero_image_url || "/images/award-placeholder.jpg",
      galleryUrls: w.gallery_urls || [],
      categoryCode: cat?.code || "00",
      categoryName: cat?.name || "",
      categorySlug: cat?.slug || "",
      isFeatured: w.is_featured,
      displayOrder: w.display_order,
      publishedAt: w.published_at || "",
    };
  } catch (err: any) {
    console.error("Exception in getPublicWinnerDetail:", err);
    return null;
  }
}
