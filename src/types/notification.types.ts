/**
 * Phase F: Notifications & Email Communication Types
 * Kutchmitra Home & Decor Awards 2026
 */

export type NotificationChannel = "email" | "in_app" | "sms" | "whatsapp";

export type NotificationStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "pending";

export type NotificationEventType =
  // Applicant Events
  | "applicant_registered"
  | "nomination_submitted"
  | "clarification_requested"
  | "clarification_responded"
  | "nomination_eligible"
  | "nomination_shortlisted"
  | "nomination_status_changed"
  | "winner_designated"
  | "winner_published"
  // Admin / Verification Operational Alerts
  | "admin_new_submission"
  | "admin_clarification_responded"
  | "admin_jury_conflict"
  | "admin_winner_action"
  // Jury Events
  | "jury_assigned"
  | "jury_evaluation_reopened";

export interface NotificationRecord {
  id: string;
  recipient_user_id: string;
  edition_id?: string | null;
  application_id?: string | null;
  channel: NotificationChannel;
  notification_type: string;
  event_type: NotificationEventType | string;
  entity_type?: string | null;
  entity_id?: string | null;
  nomination_id?: string | null;
  recipient_address: string;
  subject?: string | null;
  body: string;
  status: NotificationStatus;
  provider?: string | null;
  provider_message_id?: string | null;
  idempotency_key?: string | null;
  metadata?: Record<string, any>;
  sent_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface SendNotificationOptions {
  eventType: NotificationEventType;
  recipientUserId: string;
  recipientEmail?: string;
  recipientName?: string;
  applicationId?: string;
  nominationId?: string;
  editionId?: string;
  entityType?: string;
  entityId?: string;
  subject?: string;
  customBody?: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  idempotencyKey?: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  notificationId?: string;
  skipped?: boolean;
  error?: string;
  channelsDelivered?: NotificationChannel[];
}

export interface AdminNotificationLogItem {
  id: string;
  createdAt: string;
  recipientUserId: string;
  recipientName?: string;
  recipientEmail: string;
  channel: NotificationChannel;
  eventType: string;
  nominationId?: string | null;
  subject?: string | null;
  body: string;
  status: NotificationStatus;
  provider?: string | null;
  providerMessageId?: string | null;
  idempotencyKey?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  errorMessage?: string | null;
  isRead: boolean;
}
