-- ==============================================================================
-- PHASE F: NOTIFICATIONS & EMAIL COMMUNICATION SCHEMA MIGRATION
-- Kutchmitra Home & Decor Awards 2026
-- ==============================================================================

-- 1. Extend notifications table with fields required for idempotency, event tracking, and delivery diagnostics
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS event_type VARCHAR(80) NULL,
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS nomination_id VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NULL DEFAULT 'resend',
    ADD COLUMN IF NOT EXISTS provider_message_id VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS metadata JSONB NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL;

-- 2. Unique constraint on idempotency_key to prevent duplicate notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_idempotency_key_key'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_idempotency_key_key UNIQUE (idempotency_key);
    END IF;
END $$;

-- 3. Update status check constraint to support full delivery lifecycle
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_status_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_status_check
    CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'pending'));

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_idempotency ON notifications(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_event_type ON notifications(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_nomination_id ON notifications(nomination_id);
CREATE INDEX IF NOT EXISTS idx_notifications_app_id ON notifications(application_id);

-- 5. RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to update read state on their own notifications
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE USING (recipient_user_id = auth.uid())
    WITH CHECK (recipient_user_id = auth.uid());

-- Allow administrators and verification team full access to all notification records
DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications;
CREATE POLICY "Admins manage all notifications" ON notifications
    FOR ALL USING (
        public.has_role('admin') OR
        public.has_role('super_admin') OR
        public.has_role('verification_team')
    );
