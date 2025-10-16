/*
  # Insertion de données fictives pour ap_studies

  1. Données de test
    - Insertion de 50+ études AP avec des données réalistes
    - Répartition sur les utilisateurs existants @wiser.com
    - Statuts variés : pending, in_progress, completed, won, lost
    - Valeurs d'opportunités réalistes (10k€ à 100k€)
    - Clients français connus
    - Dates sur les 12 derniers mois
*/

-- Insérer des données fictives dans ap_studies
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
) VALUES
-- Études gagnées (won)
('AP-001234', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-01-15', '2024-01-25', 8, 45000, 'Carrefour', 'Mise en place solution e-commerce'),
('AP-001235', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-02-01', '2024-02-12', 10, 67000, 'Auchan', 'Optimisation catalogue produits'),
('AP-001236', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-02-15', '2024-02-28', 12, 89000, 'Leclerc', 'Intégration API marketplace'),
('AP-001237', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-03-01', '2024-03-15', 14, 34000, 'Casino', 'Analyse concurrentielle'),
('AP-001238', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-03-20', '2024-04-05', 15, 78000, 'Darty', 'Solution pricing dynamique'),
('AP-001239', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-04-10', '2024-04-22', 11, 56000, 'Fnac', 'Monitoring concurrence'),
('AP-001240', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'won', '2024-04-25', '2024-05-08', 13, 92000, 'Boulanger', 'Stratégie omnicanal'),
('AP-001241', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-05-15', '2024-05-30', 14, 43000, 'Cdiscount', 'Optimisation SEO produits'),
('AP-001242', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-06-01', '2024-06-18', 16, 71000, 'Zara', 'Intelligence artificielle'),
('AP-001243', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-06-20', '2024-07-05', 14, 85000, 'H&M', 'Analyse sentiment client'),
('AP-001244', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 4), 'won', '2024-07-10', '2024-07-25', 15, 38000, 'Zalando', 'Recommandations produits'),
('AP-001245', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'won', '2024-08-01', '2024-08-20', 18, 94000, 'La Redoute', 'Transformation digitale'),
('AP-001246', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-08-25', '2024-09-10', 15, 52000, 'Leroy Merlin', 'Solution mobile-first'),
('AP-001247', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-09-15', '2024-10-02', 16, 76000, 'Castorama', 'Analytics avancés'),
('AP-001248', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-10-05', '2024-10-22', 17, 41000, 'Monoprix', 'Personnalisation UX'),

-- Études perdues (lost)
('AP-001249', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-01-20', '2024-02-05', 12, 58000, 'Intermarché', 'Projet annulé - budget'),
('AP-001250', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-02-10', '2024-02-25', 10, 73000, 'Système U', 'Concurrent sélectionné'),
('AP-001251', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'lost', '2024-03-05', '2024-03-20', 14, 29000, 'Cora', 'Solution interne choisie'),
('AP-001252', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'lost', '2024-04-01', '2024-04-18', 16, 84000, 'Galeries Lafayette', 'Timing inadéquat'),
('AP-001253', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-05-10', '2024-05-28', 17, 47000, 'Printemps', 'Prix trop élevé'),
('AP-001254', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-06-15', '2024-07-02', 15, 91000, 'BHV', 'Spécifications changées'),
('AP-001255', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 4), 'lost', '2024-07-20', '2024-08-08', 18, 36000, 'Conforama', 'Projet reporté'),
('AP-001256', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'lost', '2024-08-15', '2024-09-05', 20, 68000, 'But', 'Changement direction'),
('AP-001257', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'lost', '2024-09-10', '2024-09-30', 19, 53000, 'Ikea', 'Solution concurrente'),
('AP-001258', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-10-01', '2024-10-25', 23, 77000, 'Maisons du Monde', 'Budget insuffisant'),

-- Études en cours (in_progress)
('AP-001259', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'in_progress', '2024-10-15', NULL, 12, 62000, 'Sephora', 'Analyse beauty tech en cours'),
('AP-001260', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'in_progress', '2024-10-20', NULL, 8, 48000, 'Decathlon', 'Sport e-commerce study'),
('AP-001261', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'in_progress', '2024-11-01', NULL, 5, 83000, 'Vinted', 'Marketplace secondaire'),
('AP-001262', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'in_progress', '2024-11-05', NULL, 7, 39000, 'Leboncoin', 'Optimisation mobile'),
('AP-001263', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 4), 'in_progress', '2024-11-10', NULL, 9, 71000, 'Veepee', 'Flash sales analysis'),
('AP-001264', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'in_progress', '2024-11-15', NULL, 6, 54000, 'Showroomprive', 'Luxury e-commerce'),
('AP-001265', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'in_progress', '2024-11-20', NULL, 4, 87000, 'Sarenza', 'Chaussures online'),
('AP-001266', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'in_progress', '2024-11-25', NULL, 3, 45000, 'Spartoo', 'Competitor analysis'),

-- Études terminées (completed)
('AP-001267', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'completed', '2024-01-10', '2024-01-20', 9, 33000, 'Nocibé', 'Étude cosmétiques terminée'),
('AP-001268', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'completed', '2024-02-05', '2024-02-18', 12, 59000, 'Marionnaud', 'Analyse parfumerie'),
('AP-001269', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'completed', '2024-03-10', '2024-03-25', 14, 42000, 'Douglas', 'Beauty market study'),
('AP-001270', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'completed', '2024-04-15', '2024-05-01', 15, 76000, 'Yves Rocher', 'Bio cosmetics analysis'),
('AP-001271', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'completed', '2024-05-20', '2024-06-05', 15, 28000, 'Lush', 'Handmade cosmetics'),
('AP-001272', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'completed', '2024-06-25', '2024-07-12', 16, 64000, 'Kiko', 'Italian beauty brand'),
('AP-001273', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 4), 'completed', '2024-07-30', '2024-08-15', 15, 51000, 'NYX', 'Makeup trends study'),
('AP-001274', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'completed', '2024-09-01', '2024-09-18', 16, 88000, 'MAC', 'Professional makeup'),
('AP-001275', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'completed', '2024-10-10', '2024-10-28', 17, 37000, 'Urban Decay', 'Premium cosmetics'),

-- Études en attente (pending)
('AP-001276', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'pending', '2024-12-01', NULL, 0, 55000, 'Mango', 'Fashion retail study'),
('AP-001277', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'pending', '2024-12-05', NULL, 0, 72000, 'Uniqlo', 'Fast fashion analysis'),
('AP-001278', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'pending', '2024-12-10', NULL, 0, 41000, 'Kiabi', 'Family fashion study'),
('AP-001279', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 3), 'pending', '2024-12-15', NULL, 0, 86000, 'Celio', 'Men fashion analysis'),
('AP-001280', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 4), 'pending', '2024-12-20', NULL, 0, 49000, 'Etam', 'Women lingerie study');