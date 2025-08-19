-- Seed baseline roles & payment methods (idempotent)
-- Date: 2025-08-19

-- ROLES (Insert only if key not exists)
INSERT INTO roles(key,label,description,is_system,is_protected)
SELECT v.key, v.label, v.description, v.is_system, v.is_protected
FROM (
  VALUES
    ('admin','Administrateur','Accès complet plateforme',true,true),
    ('agent','Agent','Gestion relation clients & parcelles',false,false),
    ('mairie','Mairie','Administration foncière locale',false,false),
    ('banque','Banque','Evaluation garanties & crédits',false,false),
    ('notaire','Notaire','Traitement dossiers notariés',false,false),
    ('vendeur','Vendeur','Propriétaire mettant en vente',false,false),
    ('particulier','Particulier','Acquéreur / utilisateur final',false,false),
    ('investisseur','Investisseur','Placement & portefeuille',false,false),
    ('promoteur','Promoteur','Développement projets structurés',false,false),
    ('agriculteur','Agriculteur','Utilisation agricole',false,false)
) AS v(key,label,description,is_system,is_protected)
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.key = v.key);

-- PAYMENT METHODS (catalog)
INSERT INTO payment_methods(id,name,icon,providers,enabled)
SELECT v.id, v.name, v.icon, v.providers, true
FROM (
  VALUES
    ('mobile','Mobile Money','Smartphone',ARRAY['Wave','Orange Money']::text[]),
    ('transfer','Virement Bancaire','Landmark',NULL),
    ('check','Chèque de banque','FileCheck2',NULL)
) AS v(id,name,icon,providers)
WHERE NOT EXISTS (SELECT 1 FROM payment_methods p WHERE p.id = v.id);

-- MOBILE MONEY PROVIDERS
INSERT INTO mobile_money_providers(name,enabled)
SELECT v.name, true
FROM (VALUES ('Wave'),('Orange Money'),('Free Money')) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM mobile_money_providers m WHERE m.name = v.name);
