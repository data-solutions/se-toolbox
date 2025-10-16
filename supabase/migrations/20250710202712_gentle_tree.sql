/*
  # Système d'utilisateurs simple sans Supabase Auth

  1. Nouvelles Tables
    - `app_users` - Table principale des utilisateurs avec authentification
    - `app_user_sessions` - Sessions utilisateurs pour la sécurité
    
  2. Sécurité
    - Mots de passe hashés avec bcrypt
    - Sessions avec expiration
    - RLS activé sur toutes les tables
    
  3. Fonctionnalités
    - Authentification par email/mot de passe
    - Gestion des rôles intégrée
    - Système de sessions sécurisé
    - Utilisateur administrateur par défaut
*/

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Créer la table principale des utilisateurs
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  password_hash text NOT NULL,
  role_id uuid REFERENCES user_roles(id),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES app_users(id)
);

-- Activer RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Créer la table des sessions
CREATE TABLE IF NOT EXISTS app_user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  last_activity timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE app_user_sessions ENABLE ROW LEVEL SECURITY;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app_users(role_id);
CREATE INDEX IF NOT EXISTS idx_app_users_is_active ON app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_app_user_sessions_user_id ON app_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_sessions_token ON app_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_app_user_sessions_expires ON app_user_sessions(expires_at);

-- Supprimer les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON app_users;
DROP POLICY IF EXISTS "Admins can view all users" ON app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON app_users;
DROP POLICY IF EXISTS "Admins can manage all users" ON app_users;
DROP POLICY IF EXISTS "Users can view own sessions" ON app_user_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON app_user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON app_user_sessions;

-- Politiques RLS pour app_users
CREATE POLICY "Users can view own profile" ON app_users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can view all users" ON app_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = current_setting('app.current_user_id', true)::uuid 
      AND r.name = 'Administrator'
    )
  );

CREATE POLICY "Users can update own profile" ON app_users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all users" ON app_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = current_setting('app.current_user_id', true)::uuid 
      AND r.name = 'Administrator'
    )
  );

-- Politiques RLS pour app_user_sessions
CREATE POLICY "Users can view own sessions" ON app_user_sessions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage own sessions" ON app_user_sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can view all sessions" ON app_user_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = current_setting('app.current_user_id', true)::uuid 
      AND r.name = 'Administrator'
    )
  );

-- Fonction pour hasher les mots de passe
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les mots de passe
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction d'authentification
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email text,
  p_password text
)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role_name text,
  role_permissions jsonb,
  session_token text
) AS $$
DECLARE
  user_record app_users%ROWTYPE;
  role_record user_roles%ROWTYPE;
  new_session_token text;
BEGIN
  -- Chercher l'utilisateur
  SELECT * INTO user_record
  FROM app_users
  WHERE app_users.email = p_email AND is_active = true;
  
  -- Vérifier si l'utilisateur existe et le mot de passe est correct
  IF user_record.id IS NULL OR NOT verify_password(p_password, user_record.password_hash) THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;
  
  -- Récupérer le rôle
  SELECT * INTO role_record
  FROM user_roles
  WHERE id = user_record.role_id;
  
  -- Générer un token de session
  new_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Créer la session
  INSERT INTO app_user_sessions (user_id, session_token)
  VALUES (user_record.id, new_session_token);
  
  -- Mettre à jour la dernière connexion
  UPDATE app_users
  SET last_login = now(), updated_at = now()
  WHERE id = user_record.id;
  
  -- Retourner les informations utilisateur
  RETURN QUERY SELECT
    user_record.id,
    user_record.username,
    user_record.email,
    user_record.full_name,
    role_record.name,
    role_record.permissions,
    new_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour valider une session
CREATE OR REPLACE FUNCTION validate_session(p_session_token text)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role_name text,
  role_permissions jsonb
) AS $$
DECLARE
  session_record app_user_sessions%ROWTYPE;
  user_record app_users%ROWTYPE;
  role_record user_roles%ROWTYPE;
BEGIN
  -- Chercher la session
  SELECT * INTO session_record
  FROM app_user_sessions
  WHERE session_token = p_session_token 
  AND is_active = true 
  AND expires_at > now();
  
  IF session_record.id IS NULL THEN
    RAISE EXCEPTION 'Session invalide ou expirée';
  END IF;
  
  -- Mettre à jour l'activité de la session
  UPDATE app_user_sessions
  SET last_activity = now()
  WHERE id = session_record.id;
  
  -- Récupérer l'utilisateur
  SELECT * INTO user_record
  FROM app_users
  WHERE id = session_record.user_id AND is_active = true;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur inactif';
  END IF;
  
  -- Récupérer le rôle
  SELECT * INTO role_record
  FROM user_roles
  WHERE id = user_record.role_id;
  
  -- Retourner les informations utilisateur
  RETURN QUERY SELECT
    user_record.id,
    user_record.username,
    user_record.email,
    user_record.full_name,
    role_record.name,
    role_record.permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un utilisateur
CREATE OR REPLACE FUNCTION create_user(
  p_email text,
  p_username text,
  p_password text,
  p_full_name text DEFAULT NULL,
  p_role_name text DEFAULT 'Sales Engineer'
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  role_id uuid;
  password_hash text;
BEGIN
  -- Récupérer l'ID du rôle
  SELECT id INTO role_id FROM user_roles WHERE name = p_role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Rôle % non trouvé', p_role_name;
  END IF;
  
  -- Hasher le mot de passe
  password_hash := hash_password(p_password);
  
  -- Créer l'utilisateur
  INSERT INTO app_users (
    email,
    username,
    password_hash,
    full_name,
    role_id,
    email_verified
  ) VALUES (
    p_email,
    p_username,
    password_hash,
    p_full_name,
    role_id,
    true
  ) RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour déconnecter un utilisateur
CREATE OR REPLACE FUNCTION logout_user(p_session_token text)
RETURNS boolean AS $$
BEGIN
  UPDATE app_user_sessions
  SET is_active = false
  WHERE session_token = p_session_token;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour l'administration des utilisateurs
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.full_name,
  u.is_active,
  u.email_verified,
  u.last_login,
  u.created_at,
  u.updated_at,
  r.name as role_name,
  r.description as role_description,
  r.permissions as role_permissions,
  creator.username as created_by_username,
  creator.email as created_by_email
FROM app_users u
LEFT JOIN user_roles r ON u.role_id = r.id
LEFT JOIN app_users creator ON u.created_by = creator.id;

-- Fonctions d'administration
CREATE OR REPLACE FUNCTION admin_assign_role(
  p_user_id uuid,
  p_role_name text
)
RETURNS boolean AS $$
DECLARE
  target_role_id uuid;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM app_users u
    JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = current_setting('app.current_user_id', true)::uuid 
    AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent assigner des rôles';
  END IF;

  -- Récupérer l'ID du rôle
  SELECT id INTO target_role_id FROM user_roles WHERE name = p_role_name;
  
  IF target_role_id IS NULL THEN
    RAISE EXCEPTION 'Rôle % non trouvé', p_role_name;
  END IF;

  -- Mettre à jour le rôle de l'utilisateur
  UPDATE app_users 
  SET role_id = target_role_id, updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_deactivate_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM app_users u
    JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = current_setting('app.current_user_id', true)::uuid 
    AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent désactiver des utilisateurs';
  END IF;

  -- Désactiver l'utilisateur
  UPDATE app_users 
  SET is_active = false, updated_at = now()
  WHERE id = p_user_id;

  -- Désactiver toutes les sessions
  UPDATE app_user_sessions 
  SET is_active = false
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_activate_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM app_users u
    JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = current_setting('app.current_user_id', true)::uuid 
    AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent activer des utilisateurs';
  END IF;

  -- Activer l'utilisateur
  UPDATE app_users 
  SET is_active = true, updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer l'utilisateur administrateur par défaut
DO $$
DECLARE
  admin_role_id uuid;
  admin_user_id uuid;
BEGIN
  -- Récupérer l'ID du rôle administrateur
  SELECT id INTO admin_role_id FROM user_roles WHERE name = 'Administrator';
  
  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Rôle Administrator non trouvé';
  END IF;
  
  -- Créer l'utilisateur administrateur
  SELECT create_user(
    'gmartinez@wiser.com',
    'gael.martinez',
    'admin1234',
    'Gaël MARTINEZ',
    'Administrator'
  ) INTO admin_user_id;
  
  RAISE NOTICE '=== UTILISATEUR ADMINISTRATEUR CRÉÉ ===';
  RAISE NOTICE 'ID: %', admin_user_id;
  RAISE NOTICE 'Email: gmartinez@wiser.com';
  RAISE NOTICE 'Username: gael.martinez';
  RAISE NOTICE 'Mot de passe: admin1234';
  RAISE NOTICE 'Rôle: Administrator';
  RAISE NOTICE '=====================================';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'L''utilisateur administrateur existe déjà';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création de l''administrateur: %', SQLERRM;
END $$;