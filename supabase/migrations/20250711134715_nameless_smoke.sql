/*
  # Ajouter compteur de connexions

  1. Modifications
    - Ajouter colonne `connection_count` à la table `app_users`
    - Mettre à jour la vue `admin_users_view` pour inclure le compteur
    - Créer une fonction pour incrémenter le compteur lors des connexions

  2. Sécurité
    - Maintenir les politiques RLS existantes
*/

-- Ajouter la colonne connection_count à la table app_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_users' AND column_name = 'connection_count'
  ) THEN
    ALTER TABLE app_users ADD COLUMN connection_count integer DEFAULT 0;
  END IF;
END $$;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_app_users_connection_count ON app_users(connection_count);

-- Mettre à jour la vue admin_users_view pour inclure connection_count
DROP VIEW IF EXISTS admin_users_view;

CREATE VIEW admin_users_view AS
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
  u.connection_count,
  r.name as role_name,
  r.description as role_description,
  r.permissions as role_permissions,
  creator.username as created_by_username,
  creator.email as created_by_email
FROM app_users u
LEFT JOIN user_roles r ON u.role_id = r.id
LEFT JOIN app_users creator ON u.created_by = creator.id;

-- Fonction pour incrémenter le compteur de connexions
CREATE OR REPLACE FUNCTION increment_connection_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE app_users 
  SET connection_count = COALESCE(connection_count, 0) + 1
  WHERE id = user_id_param;
END;
$$;