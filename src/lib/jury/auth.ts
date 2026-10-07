import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RoleId } from "@/types/database.types";

export interface JuryUserSession {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  juryProfile: {
    id: string;
    editionId: string;
    honorific: string | null;
    organization: string | null;
    designation: string | null;
    bio: string | null;
  } | null;
  roles: RoleId[];
  isJuryMember: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Server-side helper to verify that the current user has 'jury_member', 'admin', or 'super_admin' role.
 * Validates the authenticated session and queries `user_roles` and `jury_profiles` using the service client.
 */
export async function getJurySession(): Promise<JuryUserSession | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return null;
    }

    const adminClient = createAdminClient();
    const [userRolesRes, profileRes, juryProfileRes] = await Promise.all([
      adminClient
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id),
      adminClient
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      adminClient
        .from("jury_profiles")
        .select("id, edition_id, honorific, organization, designation, bio")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (userRolesRes.error) {
      console.error("Failed to query user_roles for jury verification:", userRolesRes.error);
      return null;
    }

    const roles = (userRolesRes.data || []).map((r) => r.role_id as RoleId);
    const isSuperAdmin = roles.includes("super_admin");
    const isAdmin = roles.includes("admin") || isSuperAdmin;
    const isJuryMember = roles.includes("jury_member");

    // Strictly deny applicants or unassigned non-staff roles
    if (!isJuryMember && !isAdmin) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName:
          profileRes.data?.full_name ||
          user.user_metadata?.full_name ||
          user.email.split("@")[0],
      },
      juryProfile: juryProfileRes.data
        ? {
            id: juryProfileRes.data.id,
            editionId: juryProfileRes.data.edition_id,
            honorific: juryProfileRes.data.honorific,
            organization: juryProfileRes.data.organization,
            designation: juryProfileRes.data.designation,
            bio: juryProfileRes.data.bio,
          }
        : null,
      roles,
      isJuryMember,
      isAdmin,
      isSuperAdmin,
    };
  } catch (error) {
    console.error("Error in getJurySession:", error);
    return null;
  }
}
