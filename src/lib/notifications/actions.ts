"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { sendTransactionalEmail } from "@/lib/notifications/email-service";
import type {
  AdminNotificationLogItem,
  NotificationChannel,
  NotificationStatus,
} from "@/types/notification.types";

/**
 * Fetches in-app notifications for the currently authenticated user (Applicant or Juror).
 * Strictly enforced by Supabase RLS (recipient_user_id = auth.uid()).
 */
export async function getUserNotifications(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<{
  success: boolean;
  notifications: Array<{
    id: string;
    subject: string | null;
    body: string;
    channel: string;
    notification_type: string;
    event_type?: string | null;
    nomination_id?: string | null;
    status: string;
    is_read: boolean;
    created_at: string;
  }>;
  unreadCount: number;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, notifications: [], unreadCount: 0, error: "Unauthorized" };
  }

  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  try {
    // 1. Count unread notifications
    const { count: unreadCount, error: countErr } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", user.id)
      .eq("is_read", false);

    if (countErr) {
      console.error("Error counting unread notifications:", countErr);
    }

    // 2. Query notifications list
    let query = supabase
      .from("notifications")
      .select("id, subject, body, channel, notification_type, event_type, nomination_id, status, is_read, created_at")
      .eq("recipient_user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error: notifErr } = await query;

    if (notifErr) {
      return {
        success: false,
        notifications: [],
        unreadCount: unreadCount || 0,
        error: notifErr.message,
      };
    }

    return {
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    };
  } catch (err: any) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: err?.message || "Failed to load notifications",
    };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("recipient_user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update notification." };
  }
}

/**
 * Marks all notifications for the authenticated user as read.
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("recipient_user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update notifications." };
  }
}

/**
 * Fetches admin operational notification logs with status diagnostics,
 * pagination, and filtering. Restricted to admin roles.
 */
export async function getAdminNotificationLogs(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  channel?: string;
  eventType?: string;
  search?: string;
}): Promise<{
  success: boolean;
  error?: string;
  logs: AdminNotificationLogItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    unread: number;
  };
}> {
  const session = await getAdminSession();
  if (!session || (!session.isAdmin && !session.isVerificationTeam)) {
    return {
      success: false,
      error: "Unauthorized: Admin privileges required.",
      logs: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: 1, pageSize: 20 },
      stats: { total: 0, sent: 0, delivered: 0, failed: 0, unread: 0 },
    };
  }

  const adminClient = createAdminClient();
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(5, Math.min(100, params?.pageSize || 20));
  const offset = (page - 1) * pageSize;

  try {
    // 1. Fetch aggregate statistics
    const [allCount, sentCount, deliveredCount, failedCount, unreadCount] = await Promise.all([
      adminClient.from("notifications").select("id", { count: "exact", head: true }),
      adminClient.from("notifications").select("id", { count: "exact", head: true }).eq("status", "sent"),
      adminClient.from("notifications").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      adminClient.from("notifications").select("id", { count: "exact", head: true }).eq("status", "failed"),
      adminClient.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    // 2. Query paginated logs with recipient user details
    let query = adminClient
      .from("notifications")
      .select(`
        id,
        created_at,
        recipient_user_id,
        recipient_address,
        channel,
        event_type,
        notification_type,
        nomination_id,
        subject,
        body,
        status,
        provider,
        provider_message_id,
        idempotency_key,
        sent_at,
        delivered_at,
        failed_at,
        error_message,
        is_read,
        users:recipient_user_id(id, full_name, email)
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status as NotificationStatus);
    }
    if (params?.channel && params.channel !== "all") {
      query = query.eq("channel", params.channel as NotificationChannel);
    }
    if (params?.eventType && params.eventType !== "all") {
      query = query.eq("event_type", params.eventType);
    }
    if (params?.search && params.search.trim()) {
      const term = params.search.trim();
      query = query.or(`recipient_address.ilike.%${term}%,subject.ilike.%${term}%,nomination_id.ilike.%${term}%`);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: rows, count: totalFiltered, error: queryErr } = await query;

    if (queryErr) {
      console.error("Error querying notification logs:", queryErr);
      return {
        success: false,
        error: queryErr.message,
        logs: [],
        pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize },
        stats: {
          total: allCount.count || 0,
          sent: sentCount.count || 0,
          delivered: deliveredCount.count || 0,
          failed: failedCount.count || 0,
          unread: unreadCount.count || 0,
        },
      };
    }

    const logs: AdminNotificationLogItem[] = (rows || []).map((r: any) => {
      const userObj = Array.isArray(r.users) ? r.users[0] : r.users;
      return {
        id: r.id,
        createdAt: r.created_at,
        recipientUserId: r.recipient_user_id,
        recipientName: userObj?.full_name || undefined,
        recipientEmail: r.recipient_address,
        channel: r.channel as NotificationChannel,
        eventType: r.event_type || r.notification_type,
        nominationId: r.nomination_id,
        subject: r.subject,
        body: r.body,
        status: r.status as NotificationStatus,
        provider: r.provider,
        providerMessageId: r.provider_message_id,
        idempotencyKey: r.idempotency_key,
        sentAt: r.sent_at,
        deliveredAt: r.delivered_at,
        failedAt: r.failed_at,
        errorMessage: r.error_message,
        isRead: r.is_read || false,
      };
    });

    const totalCount = totalFiltered || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      logs,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      },
      stats: {
        total: allCount.count || 0,
        sent: sentCount.count || 0,
        delivered: deliveredCount.count || 0,
        failed: failedCount.count || 0,
        unread: unreadCount.count || 0,
      },
    };
  } catch (err: any) {
    console.error("Exception in getAdminNotificationLogs:", err);
    return {
      success: false,
      error: err?.message || "Failed to load notification logs.",
      logs: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: 1, pageSize },
      stats: { total: 0, sent: 0, delivered: 0, failed: 0, unread: 0 },
    };
  }
}

/**
 * Retries a failed notification securely server-side.
 * Restricted to super_admin or admin roles.
 */
export async function retryFailedNotification(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch notification row
    const { data: notif, error: fetchErr } = await adminClient
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .maybeSingle();

    if (fetchErr || !notif) {
      return { success: false, error: "Notification record not found." };
    }

    if (notif.channel !== "email") {
      return { success: false, error: "Retry is only supported for email notifications." };
    }

    const now = new Date().toISOString();

    // 2. Dispatch email
    const emailResult = await sendTransactionalEmail({
      to: notif.recipient_address,
      subject: notif.subject || "Kutchmitra Awards 2026 Notification",
      html: `<p>${notif.body.replace(/\n/g, "<br>")}</p>`,
      text: notif.body,
    });

    // 3. Update notification state
    if (emailResult.success) {
      await adminClient
        .from("notifications")
        .update({
          status: "sent",
          provider: emailResult.provider,
          provider_message_id: emailResult.messageId,
          sent_at: now,
          error_message: null,
        })
        .eq("id", notificationId);

      // Audit log
      await adminClient.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "notification_manual_retry_succeeded",
        entity_type: "notification",
        entity_id: notificationId,
        new_values: { provider: emailResult.provider, messageId: emailResult.messageId },
        created_at: now,
      });

      revalidatePath("/admin/notifications");
      return { success: true };
    } else {
      await adminClient
        .from("notifications")
        .update({
          status: "failed",
          failed_at: now,
          error_message: emailResult.error || "Retry attempt failed.",
        })
        .eq("id", notificationId);

      return { success: false, error: emailResult.error || "Retry attempt failed." };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to retry notification." };
  }
}
