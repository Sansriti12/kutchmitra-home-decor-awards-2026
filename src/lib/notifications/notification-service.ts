/**
 * Phase F: Central Notification & Dispatch Orchestrator
 * Kutchmitra Home & Decor Awards 2026
 * 
 * Coordinates multi-channel notifications (Email & In-App), enforces idempotency,
 * logs delivery status, handles provider failures safely, and protects audit integrity.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { renderEmailTemplate } from "@/lib/notifications/email-templates";
import { sendTransactionalEmail } from "@/lib/notifications/email-service";
import type {
  SendNotificationOptions,
  NotificationDispatchResult,
  NotificationEventType,
} from "@/types/notification.types";

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

/**
 * Dispatches an event-driven notification with strict idempotency and fault isolation.
 */
export async function sendNotification(
  options: SendNotificationOptions
): Promise<NotificationDispatchResult> {
  const adminClient = createAdminClient();
  const channels = options.channels || ["email", "in_app"];

  // 1. Generate deterministic idempotency key if omitted
  const rawKey =
    options.idempotencyKey ||
    `${options.eventType}:${options.entityId || options.applicationId || options.recipientUserId}:${
      options.data?.status || options.data?.version || "default"
    }`;
  const idempotencyKey = rawKey.substring(0, 255);

  try {
    // 2. Idempotency Check: prevent duplicate notifications
    const { data: existingNotif } = await adminClient
      .from("notifications")
      .select("id, status, channel, created_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingNotif) {
      console.log(`[NOTIFICATION IDEMPOTENCY] Skipped duplicate event: '${idempotencyKey}'`);
      return {
        success: true,
        skipped: true,
        notificationId: existingNotif.id,
      };
    }

    // 3. Resolve Recipient User Info
    let recipientEmail = options.recipientEmail;
    let recipientName = options.recipientName;

    if (!recipientEmail || !recipientName) {
      const { data: userRec } = await adminClient
        .from("users")
        .select("id, email, full_name")
        .eq("id", options.recipientUserId)
        .maybeSingle();

      if (userRec) {
        recipientEmail = recipientEmail || userRec.email;
        recipientName = recipientName || userRec.full_name;
      }
    }

    if (!recipientEmail) {
      console.error(`[NOTIFICATION ERROR] Recipient email could not be resolved for user: ${options.recipientUserId}`);
      return {
        success: false,
        error: `Could not resolve email for recipient user: ${options.recipientUserId}`,
      };
    }

    // 4. Render Email Content
    const templateContext = {
      recipientName: recipientName || "Entrant",
      nominationId: options.nominationId,
      projectName: options.data?.projectName,
      categoryName: options.data?.categoryName,
      categoryCode: options.data?.categoryCode,
      clarificationMessage: options.data?.clarificationMessage,
      awardTitle: options.data?.awardTitle,
      statusLabel: options.data?.statusLabel,
      portalUrl: options.data?.portalUrl,
      actorName: options.data?.actorName,
      reason: options.data?.reason,
      meta: {
        applicationId: options.applicationId,
        ...options.data,
      },
    };

    const rendered = renderEmailTemplate(options.eventType, templateContext);
    const emailSubject = options.subject || rendered.subject;
    const emailBody = rendered.text;
    const now = new Date().toISOString();

    let primaryNotificationId: string | undefined;
    const deliveredChannels: Array<"email" | "in_app"> = [];

    // 5. Send Transactional Email (if requested)
    if (channels.includes("email")) {
      // Create initial notification record
      const { data: notifRecord, error: insertErr } = await adminClient
        .from("notifications")
        .insert({
          recipient_user_id: options.recipientUserId,
          edition_id: options.editionId || CURRENT_EDITION_ID,
          application_id: options.applicationId || null,
          channel: "email",
          notification_type: options.eventType,
          event_type: options.eventType,
          entity_type: options.entityType || "application",
          entity_id: options.entityId || options.applicationId || null,
          nomination_id: options.nominationId || null,
          recipient_address: recipientEmail,
          subject: emailSubject,
          body: emailBody,
          status: "sending",
          idempotency_key: idempotencyKey,
          metadata: {
            ...options.data,
            recipientName,
          },
          created_at: now,
        })
        .select("id")
        .single();

      if (insertErr) {
        // Unique constraint race condition check
        if (insertErr.code === "23505") {
          console.log(`[NOTIFICATION RACE GUARD] Duplicate insert prevented: '${idempotencyKey}'`);
          return { success: true, skipped: true };
        }
        console.error("[NOTIFICATION INSERT ERROR]", insertErr);
      }

      primaryNotificationId = notifRecord?.id;

      // Dispatch via server-side email service
      const emailResult = await sendTransactionalEmail({
        to: recipientEmail,
        subject: emailSubject,
        html: rendered.html,
        text: rendered.text,
      });

      // Update record with delivery status
      if (primaryNotificationId) {
        if (emailResult.success) {
          await adminClient
            .from("notifications")
            .update({
              status: "sent",
              provider: emailResult.provider,
              provider_message_id: emailResult.messageId,
              sent_at: new Date().toISOString(),
            })
            .eq("id", primaryNotificationId);

          deliveredChannels.push("email");
        } else {
          await adminClient
            .from("notifications")
            .update({
              status: "failed",
              provider: emailResult.provider,
              failed_at: new Date().toISOString(),
              error_message: emailResult.error || "Email delivery failed",
            })
            .eq("id", primaryNotificationId);
        }
      }
    }

    // 6. Deliver In-App Notification (if requested)
    if (channels.includes("in_app")) {
      const inAppIdempotencyKey = `${idempotencyKey}:in_app`;

      const { data: inAppRecord, error: inAppErr } = await adminClient
        .from("notifications")
        .insert({
          recipient_user_id: options.recipientUserId,
          edition_id: options.editionId || CURRENT_EDITION_ID,
          application_id: options.applicationId || null,
          channel: "in_app",
          notification_type: options.eventType,
          event_type: options.eventType,
          entity_type: options.entityType || "application",
          entity_id: options.entityId || options.applicationId || null,
          nomination_id: options.nominationId || null,
          recipient_address: recipientEmail,
          subject: emailSubject,
          body: emailBody,
          status: "delivered",
          is_read: false,
          idempotency_key: inAppIdempotencyKey,
          metadata: {
            ...options.data,
            recipientName,
          },
          created_at: now,
          delivered_at: now,
        })
        .select("id")
        .single();

      if (!inAppErr) {
        deliveredChannels.push("in_app");
        if (!primaryNotificationId) {
          primaryNotificationId = inAppRecord?.id;
        }
      }
    }

    // 7. Record immutable audit log for sensitive events
    const sensitiveEvents: NotificationEventType[] = [
      "clarification_requested",
      "nomination_shortlisted",
      "winner_designated",
      "winner_published",
      "jury_assigned",
    ];

    if (sensitiveEvents.includes(options.eventType)) {
      await adminClient.from("audit_logs").insert({
        actor_id: options.recipientUserId,
        action: `notification_${options.eventType}`,
        entity_type: "notification",
        entity_id: primaryNotificationId || idempotencyKey,
        new_values: {
          recipientEmail,
          eventType: options.eventType,
          nominationId: options.nominationId,
          channels: deliveredChannels,
        },
        created_at: now,
      });
    }

    return {
      success: true,
      notificationId: primaryNotificationId,
      channelsDelivered: deliveredChannels,
    };
  } catch (err: any) {
    // Top-level error boundary: prevent notification errors from failing the caller
    console.error("[NOTIFICATION DISPATCH EXCEPTION]", err);
    return {
      success: false,
      error: err?.message || "Notification dispatch exception",
    };
  }
}

/**
 * Broadcasts an operational notification to active administrators and verification staff.
 */
export async function notifyAdmins(
  eventType: NotificationEventType,
  options: {
    nominationId?: string;
    applicationId?: string;
    subject?: string;
    data?: Record<string, any>;
  }
): Promise<void> {
  const adminClient = createAdminClient();

  try {
    // 1. Fetch all users who possess admin, super_admin, or verification_team roles
    const { data: adminRoles } = await adminClient
      .from("user_roles")
      .select("user_id, roles(name)")
      .in("role_id", ["admin", "super_admin", "verification_team"]);

    if (!adminRoles || adminRoles.length === 0) return;

    const uniqueAdminUserIds = Array.from(new Set(adminRoles.map((r) => r.user_id)));

    const { data: adminUsers } = await adminClient
      .from("users")
      .select("id, email, full_name")
      .in("id", uniqueAdminUserIds)
      .eq("is_active", true);

    if (!adminUsers || adminUsers.length === 0) return;

    // 2. Dispatch internal alert to each authorized administrator
    for (const admin of adminUsers) {
      await sendNotification({
        eventType,
        recipientUserId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.full_name,
        nominationId: options.nominationId,
        applicationId: options.applicationId,
        subject: options.subject,
        data: options.data,
        channels: ["email", "in_app"],
        idempotencyKey: `admin:${eventType}:${options.applicationId || "global"}:${admin.id}:${Date.now()}`,
      });
    }
  } catch (err) {
    console.error("[NOTIFY ADMINS EXCEPTION]", err);
  }
}
