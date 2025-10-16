/*
  # Correction des fonctions d'authentification

  1. Corrections
    - Remplace gen_random_bytes par une alternative compatible
    - Simplifie la gestion des sessions
    - Corrige les problèmes de contexte de sécurité

  2. Fonctions mises à jour
    - authenticate_user: utilise une méthode alternative pour générer les tokens
    - validate_session: simplifie la validation
    - logout_user: améliore la gestion de déconnexion
*/

-- Supprimer les fonctions existantes pour les recréer
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS validate_session(TEXT);
DROP FUNCTION IF EXISTS logout_user(TEXT);

-- Créer une fonction d'authentification sécurisée avec génération de token alternative
CREATE OR REPLACE FUNCTION authenticate_user(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  role_name TEXT,
  role_permissions JSONB,
  session_token TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_user_id UUID;
  v_username TEXT;
  v_email TEXT;
  v_full_name TEXT;
  v_password_hash TEXT;
  v_role_name TEXT;
  v_role_permissions JSONB;
  v_session_token TEXT;
  v_session_id UUID;
BEGIN
  -- Vérifier les credentials
  SELECT au.id, au.username, au.email, au.full_name, au.password_hash, ur.name, ur.permissions
  INTO v_user_id, v_username, v_email, v_full_name, v_password_hash, v_role_name, v_role_permissions
  FROM app_users au
  LEFT JOIN user_roles ur ON au.role_id = ur.id
  WHERE au.email = p_email AND au.is_active = true;

  -- Vérifier si l'utilisateur existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;

  -- Vérifier le mot de passe (pour l'instant, comparaison simple)
  IF v_password_hash != p_password THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;

  -- Générer un token de session en utilisant une méthode alternative
  v_session_token := encode(
    digest(
      v_user_id::text || 
      extract(epoch from now())::text || 
      random()::text, 
      'sha256'
    ), 
    'hex'
  );

  -- Créer la session dans app_user_sessions
  INSERT INTO app_user_sessions (user_id, session_token, ip_address, user_agent)
  VALUES (
    v_user_id, 
    v_session_token, 
    '127.0.0.1'::inet, -- Valeur par défaut car inet_client_addr() peut ne pas fonctionner
    'Web Application'
  )
  RETURNING id INTO v_session_id;

  -- Mettre à jour la dernière connexion
  UPDATE app_users 
  SET last_login = NOW() 
  WHERE id = v_user_id;

  -- Retourner les informations
  RETURN QUERY SELECT 
    v_user_id,
    v_username,
    v_email,
    v_full_name,
    v_role_name,
    v_role_permissions,
    v_session_token;
END;
$$;

-- Créer une fonction de validation de session simplifiée
CREATE OR REPLACE FUNCTION validate_session(p_session_token TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  role_name TEXT,
  role_permissions JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_user_id UUID;
  v_username TEXT;
  v_email TEXT;
  v_full_name TEXT;
  v_role_name TEXT;
  v_role_permissions JSONB;
BEGIN
  -- Vérifier la session
  SELECT us.user_id, au.username, au.email, au.full_name, ur.name, ur.permissions
  INTO v_user_id, v_username, v_email, v_full_name, v_role_name, v_role_permissions
  FROM app_user_sessions us
  JOIN app_users au ON us.user_id = au.id
  LEFT JOIN user_roles ur ON au.role_id = ur.id
  WHERE us.session_token = p_session_token 
    AND us.is_active = true 
    AND us.expires_at > NOW()
    AND au.is_active = true;

  -- Vérifier si la session existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Session invalide ou expirée';
  END IF;

  -- Mettre à jour la dernière activité
  UPDATE app_user_sessions 
  SET last_activity = NOW() 
  WHERE session_token = p_session_token;

  -- Retourner les informations
  RETURN QUERY SELECT 
    v_user_id,
    v_username,
    v_email,
    v_full_name,
    v_role_name,
    v_role_permissions;
END;
$$;

-- Créer une fonction de déconnexion
CREATE OR REPLACE FUNCTION logout_user(p_session_token TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Désactiver la session
  UPDATE app_user_sessions 
  SET is_active = false 
  WHERE session_token = p_session_token;

  RETURN FOUND;
END;
$$;

-- Vérifier que les utilisateurs de test existent et corriger leurs mots de passe si nécessaire
DO $$
BEGIN
  -- Mettre à jour le mot de passe de l'admin si l'utilisateur existe
  IF EXISTS (SELECT 1 FROM app_users WHERE email = 'admin@wiser.com') THEN
    UPDATE app_users 
    SET password_hash = 'admin123'
    WHERE email = 'admin@wiser.com';
    RAISE NOTICE 'Mot de passe admin mis à jour';
  END IF;

  -- Mettre à jour le mot de passe de l'utilisateur si l'utilisateur existe
  IF EXISTS (SELECT 1 FROM app_users WHERE email = 'user@wiser.com') THEN
    UPDATE app_users 
    SET password_hash = 'user123'
    WHERE email = 'user@wiser.com';
    RAISE NOTICE 'Mot de passe utilisateur mis à jour';
  END IF;
END $$;