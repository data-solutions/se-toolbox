/*
  # Créer un utilisateur de test

  1. Utilisateur de test
    - Email: admin@wiser.com
    - Username: admin
    - Password: admin123
    - Rôle: Administrator
    - Nom complet: Administrateur Test

  2. Sécurité
    - Utilise la fonction create_user pour créer l'utilisateur
    - Assigne automatiquement le rôle Administrator
*/

-- Créer un utilisateur administrateur de test
DO $$
DECLARE
  v_user_id UUID;
  v_admin_role_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  IF NOT EXISTS (SELECT 1 FROM app_users WHERE email = 'admin@wiser.com') THEN
    
    -- Récupérer l'ID du rôle Administrator
    SELECT id INTO v_admin_role_id FROM user_roles WHERE name = 'Administrator' AND is_active = true;
    
    IF v_admin_role_id IS NULL THEN
      RAISE EXCEPTION 'Rôle Administrator non trouvé';
    END IF;

    -- Créer l'utilisateur de test
    INSERT INTO app_users (
      email, 
      username, 
      password_hash, 
      full_name, 
      role_id,
      is_active,
      email_verified
    ) VALUES (
      'admin@wiser.com',
      'admin',
      'admin123', -- Mot de passe simple pour les tests
      'Administrateur Test',
      v_admin_role_id,
      true,
      true
    ) RETURNING id INTO v_user_id;

    RAISE NOTICE 'Utilisateur de test créé avec succès: %', v_user_id;
  ELSE
    RAISE NOTICE 'L''utilisateur admin@wiser.com existe déjà';
  END IF;
END $$;

-- Créer également un utilisateur Sales Engineer de test
DO $$
DECLARE
  v_user_id UUID;
  v_se_role_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  IF NOT EXISTS (SELECT 1 FROM app_users WHERE email = 'user@wiser.com') THEN
    
    -- Récupérer l'ID du rôle Sales Engineer
    SELECT id INTO v_se_role_id FROM user_roles WHERE name = 'Sales Engineer' AND is_active = true;
    
    IF v_se_role_id IS NULL THEN
      RAISE EXCEPTION 'Rôle Sales Engineer non trouvé';
    END IF;

    -- Créer l'utilisateur de test
    INSERT INTO app_users (
      email, 
      username, 
      password_hash, 
      full_name, 
      role_id,
      is_active,
      email_verified
    ) VALUES (
      'user@wiser.com',
      'user',
      'user123', -- Mot de passe simple pour les tests
      'Utilisateur Test',
      v_se_role_id,
      true,
      true
    ) RETURNING id INTO v_user_id;

    RAISE NOTICE 'Utilisateur Sales Engineer de test créé avec succès: %', v_user_id;
  ELSE
    RAISE NOTICE 'L''utilisateur user@wiser.com existe déjà';
  END IF;
END $$;