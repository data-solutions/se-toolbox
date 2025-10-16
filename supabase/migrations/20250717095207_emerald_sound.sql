/*
  # Insertion de données de test pour ap_studies

  1. Nettoyage des données existantes
  2. Insertion de 30 études avec des données réalistes
  3. Assignation aux utilisateurs existants
  4. Vérification des données insérées
*/

-- Nettoyer les données existantes
DELETE FROM ap_studies;

-- Insérer des données de test une par une pour éviter les erreurs de syntaxe
INSERT INTO ap_studies (ap_number, assigned_to, status, start_date, end_date, time_spent_days, opportunity_value, client_name, description) VALUES
('AP-000001', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'won', '2024-01-15', '2024-02-05', 12, 45000, 'Carrefour', 'Analyse concurrentielle Carrefour'),
('AP-000002', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'lost', '2024-01-20', '2024-02-10', 8, 32000, 'Auchan', 'Optimisation catalogue Auchan'),
('AP-000003', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'in_progress', '2024-02-01', NULL, 15, 67000, 'Leclerc', 'Stratégie pricing Leclerc'),
('AP-000004', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'completed', '2024-02-05', '2024-02-20', 10, 28000, 'Casino', 'Audit technique Casino'),
('AP-000005', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'pending', '2024-02-10', NULL, 5, 89000, 'Monoprix', 'Migration plateforme Monoprix'),

('AP-000006', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'won', '2024-02-15', '2024-03-05', 14, 52000, 'Darty', 'Intégration API Darty'),
('AP-000007', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'lost', '2024-02-20', '2024-03-10', 9, 38000, 'Fnac', 'Formation équipe Fnac'),
('AP-000008', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'in_progress', '2024-03-01', NULL, 18, 73000, 'Boulanger', 'Consulting SEO Boulanger'),
('AP-000009', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'completed', '2024-03-05', '2024-03-25', 11, 31000, 'Cdiscount', 'Analyse performance Cdiscount'),
('AP-000010', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'won', '2024-03-10', '2024-04-02', 16, 64000, 'Amazon', 'Étude de marché Amazon'),

('AP-000011', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'lost', '2024-03-15', '2024-04-05', 7, 29000, 'Zara', 'Analyse concurrentielle Zara'),
('AP-000012', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'in_progress', '2024-03-20', NULL, 13, 58000, 'H&M', 'Optimisation catalogue H&M'),
('AP-000013', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'completed', '2024-04-01', '2024-04-18', 12, 42000, 'Zalando', 'Stratégie pricing Zalando'),
('AP-000014', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'pending', '2024-04-05', NULL, 6, 76000, 'La Redoute', 'Audit technique La Redoute'),
('AP-000015', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'won', '2024-04-10', '2024-05-01', 15, 55000, 'Galeries Lafayette', 'Migration plateforme Galeries Lafayette'),

('AP-000016', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'lost', '2024-04-15', '2024-05-05', 8, 34000, 'Sephora', 'Intégration API Sephora'),
('AP-000017', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'in_progress', '2024-04-20', NULL, 17, 69000, 'Nocibé', 'Formation équipe Nocibé'),
('AP-000018', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'completed', '2024-05-01', '2024-05-20', 13, 37000, 'Marionnaud', 'Consulting SEO Marionnaud'),
('AP-000019', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'won', '2024-05-05', '2024-05-28', 14, 61000, 'Douglas', 'Analyse performance Douglas'),
('AP-000020', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'pending', '2024-05-10', NULL, 4, 82000, 'Yves Rocher', 'Étude de marché Yves Rocher'),

('AP-000021', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'lost', '2024-05-15', '2024-06-05', 9, 41000, 'Leroy Merlin', 'Analyse concurrentielle Leroy Merlin'),
('AP-000022', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'in_progress', '2024-05-20', NULL, 19, 74000, 'Castorama', 'Optimisation catalogue Castorama'),
('AP-000023', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'completed', '2024-06-01', '2024-06-22', 16, 39000, 'Bricorama', 'Stratégie pricing Bricorama'),
('AP-000024', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'won', '2024-06-05', '2024-06-30', 17, 66000, 'Mr Bricolage', 'Audit technique Mr Bricolage'),
('AP-000025', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'pending', '2024-06-10', NULL, 7, 78000, 'Weldom', 'Migration plateforme Weldom'),

('AP-000026', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'lost', '2024-06-15', '2024-07-05', 10, 36000, 'Ikea', 'Intégration API Ikea'),
('AP-000027', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'in_progress', '2024-06-20', NULL, 20, 71000, 'Conforama', 'Formation équipe Conforama'),
('AP-000028', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'completed', '2024-07-01', '2024-07-25', 18, 43000, 'But', 'Consulting SEO But'),
('AP-000029', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0), 'won', '2024-07-05', '2024-08-01', 19, 68000, 'Maisons du Monde', 'Analyse performance Maisons du Monde'),
('AP-000030', (SELECT id FROM app_users WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1), 'pending', '2024-07-10', NULL, 8, 85000, 'Alinéa', 'Étude de marché Alinéa');