/*
  # Création complète du système de performance équipe

  1. Nouvelles tables
    - `ap_studies` : Études de faisabilité avec métriques de performance
  
  2. Nouveaux utilisateurs
    - Création des comptes pour toute l'équipe SE
    
  3. Données de test
    - 150 études réparties sur 6 mois
    - Métriques réalistes pour le dashboard
    
  4. Sécurité
    - RLS activé sur ap_studies
    - Politiques d'accès appropriées
*/

-- Créer les utilisateurs de l'équipe s'ils n'existent pas
DO $$
DECLARE
    sales_engineer_role_id uuid;
BEGIN
    -- Récupérer l'ID du rôle Sales Engineer
    SELECT id INTO sales_engineer_role_id FROM user_roles WHERE name = 'Sales Engineer' LIMIT 1;
    
    -- Si le rôle n'existe pas, le créer
    IF sales_engineer_role_id IS NULL THEN
        INSERT INTO user_roles (name, description, permissions, is_active)
        VALUES (
            'Sales Engineer',
            'Sales Engineer avec accès aux outils de vente',
            '{"view_own_data": true, "create_conversations": true, "upload_files": true, "view_team_data": true}',
            true
        )
        RETURNING id INTO sales_engineer_role_id;
    END IF;

    -- Créer les utilisateurs de l'équipe
    INSERT INTO app_users (email, username, full_name, password_hash, role_id, is_active, email_verified)
    VALUES 
        ('aleblanc@wiser.com', 'aleblanc', 'Andy Leblanc', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('gturner@wiser.com', 'gturner', 'George Turner', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('ddinh@wiser.com', 'ddinh', 'Dan Dinh', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('nmandadjiev@wiser.com', 'nmandadjiev', 'Nicolas Mandadjiev', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('rfellows@wiser.com', 'rfellows', 'Rob Fellows', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('mcaliando@wiser.com', 'mcaliando', 'Michael Caliando', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true),
        ('gmartinez@wiser.com', 'gmartinez', 'Gaël MARTINEZ', '$2b$10$rQZ9vKzQ8vKzQ8vKzQ8vKOq', sales_engineer_role_id, true, true)
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Créer la table ap_studies
CREATE TABLE IF NOT EXISTS ap_studies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ap_number text NOT NULL,
    assigned_to uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'won', 'lost')),
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    end_date date,
    time_spent_days integer NOT NULL DEFAULT 0,
    opportunity_value numeric(12,2) NOT NULL DEFAULT 0,
    client_name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT ap_studies_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES app_users(id) ON DELETE CASCADE
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_ap_studies_assigned_to ON ap_studies(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ap_studies_status ON ap_studies(status);
CREATE INDEX IF NOT EXISTS idx_ap_studies_start_date ON ap_studies(start_date);
CREATE INDEX IF NOT EXISTS idx_ap_studies_created_at ON ap_studies(created_at);

-- Activer RLS
ALTER TABLE ap_studies ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Allow authenticated users to view all ap_studies"
    ON ap_studies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert ap_studies"
    ON ap_studies FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ap_studies"
    ON ap_studies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete ap_studies"
    ON ap_studies FOR DELETE
    TO authenticated
    USING (true);

-- Créer la fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_ap_studies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_ap_studies_updated_at_trigger ON ap_studies;
CREATE TRIGGER update_ap_studies_updated_at_trigger
    BEFORE UPDATE ON ap_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_ap_studies_updated_at();

-- Insérer des données de test seulement si la table est vide
DO $$
DECLARE
    user_ids uuid[];
    user_id uuid;
    i integer;
    random_status text;
    random_days integer;
    random_value numeric;
    random_date date;
    statuses text[] := ARRAY['won', 'lost', 'in_progress', 'completed'];
    clients text[] := ARRAY['Carrefour', 'Auchan', 'Leclerc', 'Intermarché', 'Casino', 'Monoprix', 'Franprix', 'Picard', 'Darty', 'Fnac', 'Boulanger', 'Cdiscount', 'Amazon France', 'Zalando', 'Vente-privee', 'La Redoute', 'Showroomprive', 'Rue du Commerce', 'Conforama', 'But'];
BEGIN
    -- Vérifier si la table est vide
    IF (SELECT COUNT(*) FROM ap_studies) = 0 THEN
        -- Récupérer les IDs des utilisateurs de l'équipe
        SELECT ARRAY(
            SELECT id FROM app_users 
            WHERE email LIKE '%@wiser.com' 
            AND is_active = true
            ORDER BY created_at
        ) INTO user_ids;
        
        -- Générer 150 études sur les 6 derniers mois
        FOR i IN 1..150 LOOP
            -- Sélectionner un utilisateur aléatoire
            user_id := user_ids[1 + (i - 1) % array_length(user_ids, 1)];
            
            -- Générer des valeurs aléatoires réalistes
            random_status := statuses[1 + (random() * (array_length(statuses, 1) - 1))::integer];
            random_days := 1 + (random() * 14)::integer; -- 1 à 15 jours
            random_value := (5000 + random() * 95000)::numeric(12,2); -- 5k à 100k€
            random_date := CURRENT_DATE - (random() * 180)::integer; -- 6 derniers mois
            
            INSERT INTO ap_studies (
                ap_number,
                assigned_to,
                status,
                start_date,
                end_date,
                time_spent_days,
                opportunity_value,
                client_name,
                description
            ) VALUES (
                'AP-' || LPAD((20240001 + i)::text, 6, '0'),
                user_id,
                random_status,
                random_date,
                CASE 
                    WHEN random_status IN ('completed', 'won', 'lost') 
                    THEN random_date + random_days 
                    ELSE NULL 
                END,
                random_days,
                random_value,
                clients[1 + (random() * (array_length(clients, 1) - 1))::integer],
                'Étude de faisabilité pour intégration e-commerce - ' || 
                clients[1 + (random() * (array_length(clients, 1) - 1))::integer]
            );
        END LOOP;
        
        RAISE NOTICE 'Inserted 150 test AP studies for team performance dashboard';
    ELSE
        RAISE NOTICE 'AP studies table already contains data, skipping test data insertion';
    END IF;
END $$;