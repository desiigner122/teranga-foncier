-- Fonction SQL pour créer un utilisateur avec mot de passe dans Supabase
-- À exécuter dans la console SQL de Supabase ou via migration

-- Fonction pour créer un utilisateur avec mot de passe
CREATE OR REPLACE FUNCTION public.create_user_with_password(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_type TEXT,
  p_role TEXT,
  p_verification_status TEXT DEFAULT 'not_verified',
  p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Important: s'exécute avec les permissions du propriétaire
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_profile json;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà';
  END IF;

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    -- Utiliser crypt pour hashage, requiert l'extension pgcrypto
    crypt(p_password, gen_salt('bf')),
    CASE WHEN p_verification_status = 'verified' THEN now() ELSE NULL END,
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object(
      'full_name', p_full_name, 
      'type', p_type, 
      'role', p_role
    ),
    now(),
    now()
  ) RETURNING id INTO v_user;

  -- Créer le profil utilisateur dans la table users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    type,
    role,
    verification_status,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_user,
    p_email,
    p_full_name,
    p_type,
    p_role,
    p_verification_status,
    p_metadata,
    now(),
    now()
  ) RETURNING to_json(users.*) INTO v_profile;

  -- Retourner le profil complet
  RETURN v_profile;
EXCEPTION
  WHEN others THEN
    RAISE;
END;
$$;

-- Accorder le droit d'exécution à authenticated et anon
GRANT EXECUTE ON FUNCTION public.create_user_with_password TO authenticated, anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_user_with_password IS 
'Crée un utilisateur dans auth.users avec un mot de passe et un profil dans public.users.
 Nécessite l''extension pgcrypto. Utilisé pour création admin exceptionnelle.';
