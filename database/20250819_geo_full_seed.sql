-- Full (expandable) seed for Senegal administrative divisions (sample subset; extend as needed)
-- Regions
INSERT INTO regions (code, name) VALUES
  ('DK','Dakar'),
  ('TH','Thiès'),
  ('SL','Saint-Louis'),
  ('DB','Diourbel'),
  ('KL','Kaolack'),
  ('KD','Kolda'),
  ('FK','Fatick'),
  ('ZG','Ziguinchor'),
  ('TC','Tambacounda'),
  ('MT','Matam'),
  ('LG','Louga'),
  ('SE','Sédhiou'),
  ('KF','Kaffrine'),
  ('KG','Kédougou')
ON CONFLICT (name) DO NOTHING;

-- Example departments (NOT exhaustive)
INSERT INTO departments (region_id, code, name) VALUES
  ((SELECT id FROM regions WHERE code='DK'),'DK1','Dakar'),
  ((SELECT id FROM regions WHERE code='DK'),'DK2','Guédiawaye'),
  ((SELECT id FROM regions WHERE code='DK'),'DK3','Pikine'),
  ((SELECT id FROM regions WHERE code='DK'),'DK4','Rufisque'),
  ((SELECT id FROM regions WHERE code='TH'),'TH1','Thiès'),
  ((SELECT id FROM regions WHERE code='TH'),'TH2','Mbour'),
  ((SELECT id FROM regions WHERE code='TH'),'TH3','Tivaouane'),
  ((SELECT id FROM regions WHERE code='SL'),'SL1','Saint-Louis'),
  ((SELECT id FROM regions WHERE code='SL'),'SL2','Dagana'),
  ((SELECT id FROM regions WHERE code='SL'),'SL3','Podor')
ON CONFLICT DO NOTHING;

-- Example communes (subset; extend)
INSERT INTO communes (department_id, code, name) VALUES
  ((SELECT id FROM departments WHERE code='DK1'),'DK1-PLAT','Dakar Plateau'),
  ((SELECT id FROM departments WHERE code='DK1'),'DK1-MED','Médina'),
  ((SELECT id FROM departments WHERE code='DK3'),'DK3-GUIN','Guinaw Rail'),
  ((SELECT id FROM departments WHERE code='DK3'),'DK3-THIA','Thiaroye'),
  ((SELECT id FROM departments WHERE code='TH2'),'TH2-SALY','Saly Portudal'),
  ((SELECT id FROM departments WHERE code='TH2'),'TH2-MBOUR','Mbour Ville'),
  ((SELECT id FROM departments WHERE code='SL1'),'SL1-NDAR','Ndar Tout'),
  ((SELECT id FROM departments WHERE code='SL3'),'SL3-POD','Podor Ville')
ON CONFLICT DO NOTHING;
