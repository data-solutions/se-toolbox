/*
  # Création de l'utilisateur administrateur - Approche simplifiée

  1. Instructions manuelles
    - Aller dans l'interface Supabase Auth > Users
    - Créer un utilisateur avec email: gmartinez@wiser.com
    - Mot de passe: admin1234
    - Confirmer l'email automatiquement

  2. Ce script créera automatiquement le profil administrateur
*/

-- Script pour créer automatiquement le profil administrateur
-- quand l'utilisateur se connecte pour la première fois

CREATE OR REPLACE FUNCTION create_admin_profile_if_needed()
RETURNS trigger AS $$
DECLARE
  admin_role_id uuid;
  user_count integer;
BEGIN
  -- Vérifier si c'est l'email administrateur
  IF NEW.email = 'gmartinez@wiser.com' THEN
    
    -- Récupérer l'ID du rôle administrateur
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'Administrator';
    
    IF admin_role_id IS NULL THEN
      RAISE EXCEPTION 'Rôle Administrator non trouvé';
    END IF;
    
    -- Vérifier si le profil existe déjà
    SELECT COUNT(*) INTO user_count FROM profiles WHERE id = NEW.id;
    
    IF user_count = 0 THEN
      -- Créer le profil administrateur
      INSERT INTO profiles (
        id,
        username,
        email,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        'Gaël MARTINEZ',
        NEW.email,
        'Gaël MARTINEZ',
        admin_role_id,
        true,
        now(),
        now()
      );
      
      RAISE NOTICE 'Profil administrateur créé automatiquement pour %', NEW.email;
    ELSE
      -- Mettre à jour le profil existant pour s'assurer qu'il a le bon rôle
      UPDATE profiles SET
        role_id = admin_role_id,
        is_active = true,
        updated_at = now()
      WHERE id = NEW.id;
      
      RAISE NOTICE 'Profil administrateur mis à jour pour %', NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS auto_create_admin_profile ON auth.users;

-- Créer le trigger pour l'auto-création du profil admin
CREATE TRIGGER auto_create_admin_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION create_admin_profile_if_needed();

-- Vérifier si l'utilisateur existe déjà et créer le profil si nécessaire
DO $$
DECLARE
  existing_user_id uuid;
  admin_role_id uuid;
  user_count integer;
BEGIN
  -- Chercher l'utilisateur existant
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'gmartinez@wiser.com';
  
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'Utilisateur trouvé, création/mise à jour du profil...';
    
    -- Récupérer l'ID du rôle administrateur
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'Administrator';
    
    IF admin_role_id IS NULL THEN
      RAISE EXCEPTION 'Rôle Administrator non trouvé';
    END IF;
    
    -- Vérifier si le profil existe
    SELECT COUNT(*) INTO user_count FROM profiles WHERE id = existing_user_id;
    
    IF user_count = 0 THEN
      -- Créer le profil
      INSERT INTO profiles (
        id,
        username,
        email,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        existing_user_id,
        'Gaël MARTINEZ',
        'gmartinez@wiser.com',
        'Gaël MARTINEZ',
        admin_role_id,
        true,
        now(),
        now()
      );
      
      RAISE NOTICE 'Profil administrateur créé avec succès!';
    ELSE
      -- Mettre à jour le profil existant
      UPDATE profiles SET
        role_id = admin_role_id,
        is_active = true,
        updated_at = now()
      WHERE id = existing_user_id;
      
      RAISE NOTICE 'Profil administrateur mis à jour avec succès!';
    END IF;
    
    RAISE NOTICE '=== INFORMATIONS DE CONNEXION ===';
    RAISE NOTICE 'Email: gmartinez@wiser.com';
    RAISE NOTICE 'Mot de passe: admin1234';
    RAISE NOTICE 'Rôle: Administrator';
    RAISE NOTICE '================================';
  ELSE
    RAISE NOTICE '=== INSTRUCTIONS MANUELLES ===';
    RAISE NOTICE '1. Aller dans Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Cliquer sur "Add user"';
    RAISE NOTICE '3. Email: gmartinez@wiser.com';
    RAISE NOTICE '4. Password: admin1234';
    RAISE NOTICE '5. Cocher "Email confirm"';
    RAISE NOTICE '6. Le profil administrateur sera créé automatiquement';
    RAISE NOTICE '===============================';
  END IF;
END $$;