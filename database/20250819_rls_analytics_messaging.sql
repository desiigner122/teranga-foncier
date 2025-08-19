-- Migration: RLS policies for analytics + messaging + notifications tables
-- Date: 2025-08-19
-- Purpose: Secure newly added interaction tables (parcel_views, parcel_inquiries, user_activities,
--          conversations, conversation_participants, messages, notifications)
-- Notes: Adjust to stricter model later (e.g. role-based admin override). Designed to be idempotent.

-- ========================= PARCEL VIEWS =========================
ALTER TABLE IF EXISTS parcel_views ENABLE ROW LEVEL SECURITY;

-- Insert: anyone authenticated can log a view for themselves (or anonymously if viewer_id null)
DROP POLICY IF EXISTS parcel_views_insert ON parcel_views;
CREATE POLICY parcel_views_insert ON parcel_views
  FOR INSERT TO authenticated
  WITH CHECK (viewer_id IS NULL OR viewer_id = auth.uid());

-- Select: viewer or parcel owner can see views (extend for admin later)
DROP POLICY IF EXISTS parcel_views_select ON parcel_views;
CREATE POLICY parcel_views_select ON parcel_views
  FOR SELECT TO authenticated
  USING (
    viewer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM parcels p WHERE p.id = parcel_views.parcel_id AND p.owner_id = auth.uid())
  );

-- ========================= PARCEL INQUIRIES =========================
ALTER TABLE IF EXISTS parcel_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parcel_inquiries_insert ON parcel_inquiries;
CREATE POLICY parcel_inquiries_insert ON parcel_inquiries
  FOR INSERT TO authenticated
  WITH CHECK (inquirer_id = auth.uid());

DROP POLICY IF EXISTS parcel_inquiries_select ON parcel_inquiries;
CREATE POLICY parcel_inquiries_select ON parcel_inquiries
  FOR SELECT TO authenticated
  USING (
    inquirer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM parcels p WHERE p.id = parcel_inquiries.parcel_id AND p.owner_id = auth.uid()
    )
  );

-- ========================= USER ACTIVITIES =========================
ALTER TABLE IF EXISTS user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_activities_insert ON user_activities;
CREATE POLICY user_activities_insert ON user_activities
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_activities_select ON user_activities;
CREATE POLICY user_activities_select ON user_activities
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ========================= CONVERSATIONS =========================
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
-- New table for read receipts
CREATE TABLE IF NOT EXISTS message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);
ALTER TABLE IF EXISTS message_reads ENABLE ROW LEVEL SECURITY;

-- Conversations
DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );

-- Conversation participants
DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
CREATE POLICY conversation_participants_insert ON conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Only allow adding yourself; system/service role can bypass RLS
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS conversation_participants_select ON conversation_participants;
CREATE POLICY conversation_participants_select ON conversation_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
  ));

-- Messages
DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

-- message_reads policies
DROP POLICY IF EXISTS message_reads_insert ON message_reads;
CREATE POLICY message_reads_insert ON message_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = auth.uid()
      WHERE m.id = message_reads.message_id
    )
  );

DROP POLICY IF EXISTS message_reads_select ON message_reads;
CREATE POLICY message_reads_select ON message_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = auth.uid()
      WHERE m.id = message_reads.message_id
    )
  );

-- ========================= NOTIFICATIONS =========================
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_insert ON notifications;
CREATE POLICY notifications_insert ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Optional: allow users to mark their notifications read (update)
DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========================= FUTURE ADMIN OVERRIDE =========================
-- Later we can add a helper function has_role(auth.uid(),'admin') and extend USING clauses with OR has_role(...)
-- to provide administrative visibility.

-- =============== ADMIN OVERRIDE (implements has_role function + policy extensions) ===============
CREATE OR REPLACE FUNCTION public.has_role(p_user uuid, p_role text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user AND r.key = p_role
  );
$$;

-- Extend policies (idempotent re-creation) with OR has_role(auth.uid(),'admin')
-- For brevity, only critical select policies are recreated with override.

DROP POLICY IF EXISTS parcel_views_select ON parcel_views;
CREATE POLICY parcel_views_select ON parcel_views
  FOR SELECT TO authenticated
  USING (
    viewer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM parcels p WHERE p.id = parcel_views.parcel_id AND p.owner_id = auth.uid())
    OR has_role(auth.uid(),'admin')
  );

DROP POLICY IF EXISTS parcel_inquiries_select ON parcel_inquiries;
CREATE POLICY parcel_inquiries_select ON parcel_inquiries
  FOR SELECT TO authenticated
  USING (
    inquirer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM parcels p WHERE p.id = parcel_inquiries.parcel_id AND p.owner_id = auth.uid()
    ) OR has_role(auth.uid(),'admin')
  );

DROP POLICY IF EXISTS user_activities_select ON user_activities;
CREATE POLICY user_activities_select ON user_activities
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    ) OR has_role(auth.uid(),'admin')
  );

DROP POLICY IF EXISTS conversation_participants_select ON conversation_participants;
CREATE POLICY conversation_participants_select ON conversation_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
  ) OR has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    ) OR has_role(auth.uid(),'admin')
  );

DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));

-- =============== CONVERSATION LAST MESSAGE TRIGGER ===============
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_conversation_last_message ON messages;
CREATE TRIGGER trg_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- =============== RPC list_user_conversations WITH AGGREGATES ===============
CREATE OR REPLACE FUNCTION public.list_user_conversations(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  subject text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  last_message text,
  last_message_at timestamptz,
  participant_ids uuid[],
  unread_count integer
) LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT c.id, c.subject, c.created_by, c.created_at, c.updated_at, c.last_message, c.last_message_at
    FROM conversations c
    WHERE EXISTS (
      SELECT 1 FROM conversation_participants cp0 WHERE cp0.conversation_id = c.id AND cp0.user_id = p_user_id
    )
  ), participants AS (
    SELECT cp.conversation_id, array_agg(cp.user_id ORDER BY cp.user_id) AS participant_ids
    FROM conversation_participants cp
    WHERE cp.conversation_id IN (SELECT id FROM base)
    GROUP BY cp.conversation_id
  ), unread AS (
    SELECT m.conversation_id, COUNT(*)::int AS unread_count
    FROM messages m
    LEFT JOIN message_reads r ON r.message_id = m.id AND r.user_id = p_user_id
    WHERE m.conversation_id IN (SELECT id FROM base)
      AND m.sender_id <> p_user_id
      AND r.message_id IS NULL
    GROUP BY m.conversation_id
  )
  SELECT b.id, b.subject, b.created_by, b.created_at, b.updated_at,
         b.last_message, b.last_message_at,
         COALESCE(p.participant_ids, ARRAY[]::uuid[]) AS participant_ids,
         COALESCE(u.unread_count, 0) AS unread_count
  FROM base b
  LEFT JOIN participants p ON p.conversation_id = b.id
  LEFT JOIN unread u ON u.conversation_id = b.id
  ORDER BY COALESCE(b.last_message_at, b.updated_at, b.created_at) DESC NULLS LAST
  LIMIT 200;
$$;

-- Helper RPC: list_unread_message_ids
-- Returns array of message IDs in a conversation not yet read by user (excluding user's own messages)
CREATE OR REPLACE FUNCTION list_unread_message_ids(p_conversation_id uuid, p_user_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result uuid[];
BEGIN
  SELECT array_agg(m.id)
  INTO result
  FROM messages m
  LEFT JOIN message_reads r ON r.message_id = m.id AND r.user_id = p_user_id
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id <> p_user_id
    AND r.message_id IS NULL;
  IF result IS NULL THEN
    RETURN ARRAY[]::uuid[];
  END IF;
  RETURN result;
END;$$;

-- Helper RPC: count_unread_messages
CREATE OR REPLACE FUNCTION count_unread_messages(p_conversation_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM messages m
  LEFT JOIN message_reads r ON r.message_id = m.id AND r.user_id = p_user_id
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id <> p_user_id
    AND r.message_id IS NULL;
$$;

-- ========================= END =========================
