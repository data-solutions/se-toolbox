/*
  # Insertion de données fictives dans ap_studies

  1. Données de test
    - 50+ études AP avec données réalistes
    - Statuts variés : won, lost, in_progress, completed, pending
    - Valeurs d'opportunités : 15k€ à 95k€
    - Clients français connus
    - Assignation aux utilisateurs @wiser.com existants

  2. Approche simple
    - Insertions directes sans CROSS JOIN
    - Utilisation de sous-requêtes simples
    - Compatible avec toutes les versions PostgreSQL
*/

-- Insérer des données fictives dans ap_studies
INSERT INTO ap_studies (ap_number, assigned_to, status, start_date, end_date, time_spent_days, opportunity_value, client_name, description) VALUES

-- Études gagnées (won) - 15 études
('AP-001234', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-01-15', '2024-01-28', 13, 45000, 'Carrefour', 'Mise en place solution e-commerce pour hypermarchés'),
('AP-001235', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-01-20', '2024-02-05', 16, 67000, 'Darty', 'Optimisation catalogue produits électroménager'),
('AP-001236', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-02-01', '2024-02-12', 11, 32000, 'Fnac', 'Intégration API pour livres et multimédia'),
('AP-001237', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-02-10', '2024-02-25', 15, 78000, 'Auchan', 'Solution de matching produits alimentaires'),
('AP-001238', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-02-15', '2024-03-02', 16, 54000, 'Boulanger', 'Catalogue high-tech et électronique'),
('AP-001239', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-03-01', '2024-03-18', 17, 89000, 'Leclerc', 'Plateforme e-commerce multi-enseignes'),
('AP-001240', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-03-10', '2024-03-22', 12, 41000, 'Zara', 'Solution mode et textile'),
('AP-001241', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-03-20', '2024-04-05', 16, 63000, 'Sephora', 'Catalogue beauté et cosmétiques'),
('AP-001242', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-04-01', '2024-04-15', 14, 52000, 'Leroy Merlin', 'Bricolage et jardinage'),
('AP-001243', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-04-10', '2024-04-28', 18, 76000, 'Cdiscount', 'Marketplace généraliste'),
('AP-001244', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-05-01', '2024-05-14', 13, 38000, 'H&M', 'Fast fashion et accessoires'),
('AP-001245', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-05-15', '2024-06-02', 18, 84000, 'Casino', 'Distribution alimentaire'),
('AP-001246', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'won', '2024-06-01', '2024-06-16', 15, 47000, 'Zalando', 'Mode en ligne européenne'),
('AP-001247', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'won', '2024-06-10', '2024-06-25', 15, 59000, 'La Redoute', 'Mode et maison'),
('AP-001248', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'won', '2024-07-01', '2024-07-18', 17, 71000, 'Castorama', 'Bricolage et rénovation'),

-- Études perdues (lost) - 10 études
('AP-002001', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-01-10', '2024-01-25', 15, 55000, 'Monoprix', 'Projet abandonné - budget insuffisant'),
('AP-002002', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-02-05', '2024-02-20', 15, 42000, 'Nocibé', 'Concurrence remportée'),
('AP-002003', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'lost', '2024-03-01', '2024-03-15', 14, 68000, 'Conforama', 'Délais trop courts'),
('AP-002004', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-04-01', '2024-04-18', 17, 39000, 'But', 'Solution interne préférée'),
('AP-002005', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-05-01', '2024-05-16', 15, 73000, 'Ikea', 'Spécifications non compatibles'),
('AP-002006', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'lost', '2024-06-01', '2024-06-14', 13, 46000, 'Decathlon', 'Budget réalloué'),
('AP-002007', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-07-01', '2024-07-15', 14, 61000, 'Go Sport', 'Projet reporté'),
('AP-002008', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'lost', '2024-08-01', '2024-08-18', 17, 34000, 'Intersport', 'Concurrence moins chère'),
('AP-002009', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'lost', '2024-09-01', '2024-09-12', 11, 58000, 'Kiabi', 'Changement de stratégie'),
('AP-002010', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'lost', '2024-10-01', '2024-10-16', 15, 49000, 'Celio', 'Projet annulé'),

-- Études en cours (in_progress) - 8 études
('AP-003001', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'in_progress', '2024-11-01', NULL, 15, 72000, 'Galeries Lafayette', 'Luxe et grands magasins - en cours'),
('AP-003002', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'in_progress', '2024-11-05', NULL, 12, 45000, 'Printemps', 'Mode haut de gamme - développement'),
('AP-003003', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'in_progress', '2024-11-10', NULL, 8, 63000, 'Maisons du Monde', 'Décoration et mobilier - tests'),
('AP-003004', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'in_progress', '2024-11-15', NULL, 10, 38000, 'Nature et Découvertes', 'Bien-être et nature - validation'),
('AP-003005', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'in_progress', '2024-11-20', NULL, 7, 81000, 'Cultura', 'Loisirs créatifs et culture - intégration'),
('AP-003006', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'in_progress', '2024-11-25', NULL, 5, 54000, 'Truffaut', 'Jardinage et animalerie - déploiement'),
('AP-003007', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'in_progress', '2024-12-01', NULL, 3, 67000, 'Jardiland', 'Jardinage spécialisé - configuration'),
('AP-003008', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'in_progress', '2024-12-05', NULL, 2, 29000, 'Botanic', 'Jardinage bio - démarrage'),

-- Études terminées (completed) - 9 études
('AP-004001', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'completed', '2024-01-05', '2024-01-20', 15, 33000, 'Picard', 'Surgelés - étude terminée'),
('AP-004002', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'completed', '2024-02-01', '2024-02-18', 17, 47000, 'Thiriet', 'Surgelés à domicile - livré'),
('AP-004003', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'completed', '2024-03-01', '2024-03-14', 13, 52000, 'Chronodrive', 'Drive et livraison - finalisé'),
('AP-004004', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'completed', '2024-04-01', '2024-04-16', 15, 28000, 'Houra', 'Courses en ligne - terminé'),
('AP-004005', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'completed', '2024-05-01', '2024-05-19', 18, 64000, 'Ooshop', 'E-commerce alimentaire - clos'),
('AP-004006', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'completed', '2024-06-01', '2024-06-12', 11, 41000, 'Franprix', 'Proximité urbaine - achevé'),
('AP-004007', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'completed', '2024-07-01', '2024-07-20', 19, 56000, 'Monop', 'Convenience store - fini'),
('AP-004008', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'completed', '2024-08-01', '2024-08-15', 14, 35000, 'Naturalia', 'Bio et naturel - livré'),
('AP-004009', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'completed', '2024-09-01', '2024-09-18', 17, 49000, 'Grand Frais', 'Frais et local - terminé'),

-- Études en attente (pending) - 5 études
('AP-005001', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'pending', '2024-12-10', NULL, 0, 85000, 'Amazon France', 'Marketplace géant - en attente validation'),
('AP-005002', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'pending', '2024-12-12', NULL, 0, 92000, 'Rakuten', 'E-commerce japonais - attente budget'),
('AP-005003', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 2), 'pending', '2024-12-15', NULL, 0, 67000, 'Vente-privee', 'Ventes privées - attente décision'),
('AP-005004', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 0), 'pending', '2024-12-18', NULL, 0, 74000, 'Showroomprive', 'Mode privée - en négociation'),
('AP-005005', (SELECT id FROM app_users WHERE email LIKE '%@wiser.com' LIMIT 1 OFFSET 1), 'pending', '2024-12-20', NULL, 0, 58000, 'Rue du Commerce', 'Tech et électronique - attente signature');