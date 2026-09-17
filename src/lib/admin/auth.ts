import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RoleId } from "@/types/database.types";

export interface AdminUserSession {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  roles: RoleId[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

/**
 * Server-side helper to verify that the current user has 'admin' or 'super_admin' role.
 * Validates the authenticated session and queries `user_roles` securely using the service role client.
 */
export async function getAdminSession(): Promise<AdminUserSession | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return null;
    }

    // Use service role admin client to fetch authoritative roles, avoiding any RLS ambiguity
    const adminClient = createAdminClient();
    const [userRolesRes, profileRes] = await Promise.all([
      adminClient
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id),
      adminClient
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (userRolesRes.error) {
      console.error("Failed to query user_roles for admin verification:", userRolesRes.error);
      return null;
    }

    const roles = (userRolesRes.data || []).map((r) => r.role_id as RoleId);
    const isSuperAdmin = roles.includes("super_admin");
    const isAdmin = roles.includes("admin") || isSuperAdmin;

    if (!isAdmin) {
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
      roles,
      isSuperAdmin,
      isAdmin,
    };
  } catch (error) {
    console.error("Error in getAdminSession:", error);
    return null;
  }
}
