-- Normalize inconsistent user.type / role casing and synonyms
-- Run once in SQL editor (Supabase) BEFORE relying on sidebar role detection.

BEGIN;

-- Standard canonical types we support
-- Particulier, Mairie, Banque, Notaire, Agent, Vendeur, Admin

UPDATE users SET type = 'Particulier' WHERE LOWER(type) IN ('particulier','part','particulairs');
UPDATE users SET type = 'Mairie' WHERE LOWER(type) IN ('mairie','mairies','municipalite','municipalité','municipal');
UPDATE users SET type = 'Banque' WHERE LOWER(type) IN ('banque','bank','banq');
UPDATE users SET type = 'Notaire' WHERE LOWER(type) IN ('notaire','notary','notaires');
UPDATE users SET type = 'Agent' WHERE LOWER(type) IN ('agent','agence','agents');
UPDATE users SET type = 'Vendeur' WHERE LOWER(type) IN ('vendeur','seller','vendeurs','particulier_vendeur');
UPDATE users SET type = 'Admin' WHERE LOWER(type) IN ('admin','administrator','superadmin');

-- Clean stray whitespace
UPDATE users SET type = INITCAP(TRIM(type)) WHERE type IS NOT NULL;

COMMIT;

-- Verification queries (optional)
-- SELECT type, COUNT(*) FROM users GROUP BY 1 ORDER BY 2 DESC;
