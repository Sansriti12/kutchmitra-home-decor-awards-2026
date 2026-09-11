import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface ApplicantProfileInput {
  organization_name?: string | null;
  city: string;
  state: string;
  designation?: string | null;
  postal_code?: string | null;
  address_line?: string | null;
  website_url?: string | null;
  portfolio_url?: string | null;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
}

/**
 * Idempotently ensures that an applicant profile exists in public.applicant_profiles.
 * 
 * Works for both:
 * 1. Immediate post-registration when a session is active.
 * 2. First login after email confirmation (reading registration details from user_metadata).
 * 
 * Uses the authenticated user's Supabase client respecting RLS (user_id = auth.uid()).
 */
export async function ensureApplicantProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  explicitData?: Partial<ApplicantProfileInput>
) {
  if (!user || !user.id) {
    return { data: null, error: new Error("User must be authenticated to create a profile.") };
  }

  // 1. Check if profile already exists (idempotency guard)
  const { data: existingProfile, error: fetchError } = await supabase
    .from("applicant_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking existing applicant profile:", fetchError.message);
    return { data: null, error: fetchError };
  }

  if (existingProfile) {
    // Profile already exists; do not duplicate
    return { data: existingProfile, error: null };
  }

  // 2. Extract profile fields from explicit input or fallback to user_metadata saved during signUp
  const metadata = user.user_metadata || {};
  const organizationName = explicitData?.organization_name ?? metadata.organization_name ?? null;
  const city = explicitData?.city ?? metadata.city ?? "Kutch";
  const state = explicitData?.state ?? metadata.state ?? "Gujarat";
  const now = new Date().toISOString();
  const termsAcceptedAt = explicitData?.terms_accepted_at ?? metadata.terms_accepted_at ?? now;
  const privacyAcceptedAt = explicitData?.privacy_accepted_at ?? metadata.privacy_accepted_at ?? now;

  // 3. Insert into public.applicant_profiles
  const { data: newProfile, error: insertError } = await supabase
    .from("applicant_profiles")
    .insert({
      user_id: user.id,
      organization_name: organizationName,
      city: city.trim(),
      state: state.trim(),
      terms_accepted_at: termsAcceptedAt,
      privacy_accepted_at: privacyAcceptedAt,
    })
    .select()
    .single();

  if (insertError) {
    // In case of concurrent insert race, retry fetch once
    if (insertError.code === "23505") { // unique violation
      const { data: retriedProfile } = await supabase
        .from("applicant_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (retriedProfile) {
        return { data: retriedProfile, error: null };
      }
    }
    console.error("Error creating applicant profile:", insertError.message);
    return { data: null, error: insertError };
  }

  return { data: newProfile, error: null };
}
