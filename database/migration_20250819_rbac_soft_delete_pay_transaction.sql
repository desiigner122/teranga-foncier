-- Migration: RBAC enhancements, user soft-delete columns, indexes, and pay_transaction RPC
-- Date: 2025-08-19
-- Idempotent style (guards) so it can be re-run safely.

-- 1. Users table soft-delete columns
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='users' AND column_name='is_active') THEN
    ALTER TABLE public.users ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='users' AND column_name='deleted_at') THEN
    ALTER TABLE public.users ADD COLUMN deleted_at timestamptz NULL;
  END IF;
END $$;

-- 2. Useful composite / partial indexes (wrap in IF NOT EXISTS pattern via catalog check)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_users_active_created') THEN
    CREATE INDEX idx_users_active_created ON public.users (created_at DESC) WHERE is_active AND deleted_at IS NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_roles_user') THEN
    CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_roles_role') THEN
    CREATE INDEX idx_user_roles_role ON public.user_roles(role_id);
  END IF;
END $$;

-- 3. Ensure roles table has protection flags (optional)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='is_system') THEN
    ALTER TABLE public.roles ADD COLUMN is_system boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='is_protected') THEN
    ALTER TABLE public.roles ADD COLUMN is_protected boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 4. Guarded creation of audit_logs table (if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_logs') THEN
    CREATE TABLE public.audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      action text NOT NULL,
      actor_id uuid NULL,
      target_type text NULL,
      target_id uuid NULL,
      target_ref text NULL,
      metadata jsonb NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX audit_logs_created_at ON public.audit_logs(created_at DESC);
  END IF;
END $$;

-- 5. pay_transaction RPC (secure payment state transition)
-- Assumptions: transactions table has columns: id (uuid or int), status text, amount numeric, paid_at timestamptz, method text.
-- Allowed transition: status in (pending, initiated) -> paid
-- Add function (drop & recreate for deterministic behavior)
DROP FUNCTION IF EXISTS public.pay_transaction(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.pay_transaction(bigint, uuid, text);

-- We'll attempt a generic variant for UUID id first; adapt if numeric id.
-- Detect id data type
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='id' AND data_type='uuid') THEN
    EXECUTE $$CREATE FUNCTION public.pay_transaction(p_transaction_id uuid, p_actor uuid, p_method text)
    RETURNS jsonb AS $$
    DECLARE
      v_tx RECORD;
    BEGIN
      SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TRANSACTION_NOT_FOUND';
      END IF;
      IF v_tx.status NOT IN ('pending','initiated') THEN
        RAISE EXCEPTION 'INVALID_STATUS_TRANSITION';
      END IF;
      UPDATE public.transactions
        SET status='paid', paid_at=now(), method = COALESCE(p_method, v_tx.method), updated_at=now()
        WHERE id = p_transaction_id
        RETURNING * INTO v_tx;

      INSERT INTO public.audit_logs(action, actor_id, target_type, target_id, target_ref, metadata)
      VALUES ('pay_transaction', p_actor, 'transaction', v_tx.id, v_tx.reference, jsonb_build_object('amount', v_tx.amount, 'method', v_tx.method));

      RETURN to_jsonb(v_tx);
    END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;$$;
  ELSE
    -- Assume integer / bigint ID
    EXECUTE $$CREATE FUNCTION public.pay_transaction(p_transaction_id bigint, p_actor uuid, p_method text)
    RETURNS jsonb AS $$
    DECLARE
      v_tx RECORD;
    BEGIN
      SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'TRANSACTION_NOT_FOUND';
      END IF;
      IF v_tx.status NOT IN ('pending','initiated') THEN
        RAISE EXCEPTION 'INVALID_STATUS_TRANSITION';
      END IF;
      UPDATE public.transactions
        SET status='paid', paid_at=now(), method = COALESCE(p_method, v_tx.method), updated_at=now()
        WHERE id = p_transaction_id
        RETURNING * INTO v_tx;

      INSERT INTO public.audit_logs(action, actor_id, target_type, target_id, target_ref, metadata)
      VALUES ('pay_transaction', p_actor, 'transaction', v_tx.id, v_tx.reference, jsonb_build_object('amount', v_tx.amount, 'method', v_tx.method));

      RETURN to_jsonb(v_tx);
    END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;$$;
  END IF;
END $$;

-- 6. Basic RLS policy suggestion (manual):
-- 6. Automated RLS enablement + policies (idempotent)
DO $$ BEGIN
  -- Enable RLS on users (if not already) and transactions
  PERFORM 1 FROM pg_tables WHERE schemaname='public' AND tablename='transactions';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY';
    -- Payment update policy (idempotent via name check)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='pay_own_pending'
    ) THEN
      EXECUTE $$CREATE POLICY pay_own_pending ON public.transactions FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending','initiated'))$$;
    END IF;
    -- Select policy (basic – users read only their own or public subset)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='select_own_transactions'
    ) THEN
      EXECUTE $$CREATE POLICY select_own_transactions ON public.transactions FOR SELECT USING (auth.uid() = user_id)$$;
    END IF;
  END IF;
END $$;

-- NOTE: If you maintain admin roles via JWT claims, add a broader policy or use a SECURITY DEFINER RPC for admin listings.

-- 7. Helper comment for assign_role / revoke_role RPCs if not present (assumed already created earlier).
-- (No changes here.)

-- END OF MIGRATION
