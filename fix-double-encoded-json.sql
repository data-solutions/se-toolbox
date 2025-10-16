-- Script SQL pour corriger le double-encodage JSON dans domain_checks.results
-- À exécuter dans l'éditeur SQL de Supabase

-- Étape 1: Vérifier le problème
SELECT
  id,
  domain,
  pg_typeof(results) as type,
  results
FROM domain_checks
LIMIT 3;

-- Étape 2: Corriger les données double-encodées
-- Cette requête va parser le JSON deux fois pour enlever le double-encodage
DO $$
DECLARE
  rec RECORD;
  fixed_json JSONB;
  json_text TEXT;
BEGIN
  FOR rec IN
    SELECT id, results
    FROM domain_checks
    WHERE results IS NOT NULL
  LOOP
    BEGIN
      -- Convertir results en texte
      json_text := rec.results::text;

      -- Vérifier si c'est double-encodé (commence par "\" ou contient \\")
      IF json_text LIKE '"%' OR json_text LIKE '%\\"%' THEN
        -- Parser une première fois pour enlever les quotes externes
        json_text := regexp_replace(json_text, '^"(.*)"$', '\1');
        -- Remplacer les backslashes échappés
        json_text := replace(json_text, '\"', '"');
        json_text := replace(json_text, '\\', '\');

        -- Parser en JSONB
        fixed_json := json_text::jsonb;

        -- Mettre à jour
        UPDATE domain_checks
        SET results = fixed_json,
            updated_at = now()
        WHERE id = rec.id;

        RAISE NOTICE 'Fixed record % for domain %', rec.id, (SELECT domain FROM domain_checks WHERE id = rec.id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix record %: %', rec.id, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Étape 3: Vérifier que c'est corrigé
SELECT
  id,
  domain,
  results,
  pg_typeof(results) as type
FROM domain_checks;
