"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateProfileInput {
  fullName: string;
  phone: string;
  organizationName: string;
  designation: string;
  city: string;
  state: string;
  postalCode?: string;
  addressLine?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
}

/**
 * Server action to update permitted profile fields for the authenticated applicant.
 * Strictly respects RLS by operating within the caller's session cookies.
 */
export async function updateApplicantProfile(input: UpdateProfileInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized: Session expired or invalid." };
  }

  // 1. Update users table (full_name, phone)
  const { error: userError } = await supabase
    .from("users")
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (userError) {
    console.error("Error updating users record:", userError.message);
    return { success: false, error: userError.message };
  }

  // 2. Update applicant_profiles table
  const { error: profileError } = await supabase
    .from("applicant_profiles")
    .update({
      organization_name: input.organizationName.trim() || null,
      designation: input.designation.trim() || null,
      city: input.city.trim(),
      state: input.state.trim(),
      postal_code: input.postalCode?.trim() || null,
      address_line: input.addressLine?.trim() || null,
      website_url: input.websiteUrl?.trim() || null,
      portfolio_url: input.portfolioUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (profileError) {
    console.error("Error updating applicant_profiles record:", profileError.message);
    return { success: false, error: profileError.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}
