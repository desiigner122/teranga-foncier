// src/data/administrativeDivisions.js
// Hierarchie administrative simplifiée du Sénégal. Étendre selon besoin réel.
// Structure: Région -> Départements -> Communes principales.

export const administrativeDivisions = [
  {
    region: 'Dakar',
    code: 'DK',
    departments: [
      { name: 'Dakar', communes: ['Dakar-Plateau','Fann-Point E','Gorée','Gueule Tapée','Hann Bel-Air'] },
      { name: 'Pikine', communes: ['Pikine Nord','Pikine Ouest','Thiaroye Gare','Diamaguène','Keur Massar'] },
      { name: 'Guédiawaye', communes: ['Golf Sud','Médina Gounass','Ndiarème Limamoulaye'] },
      { name: 'Rufisque', communes: ['Rufisque Est','Rufisque Ouest','Bargny','Sangalkam'] }
    ]
  },
  {
    region: 'Thiès',
    code: 'TH',
    departments: [
      { name: 'Thiès', communes: ['Thiès Ouest','Thiès Est','Fandène'] },
      { name: 'Mbour', communes: ['Mbour','Saly Portudal','Ngaparou','Somone'] },
      { name: 'Tivaouane', communes: ['Tivaouane','Mékhé','Pambal'] }
    ]
  },
  {
    region: 'Ziguinchor',
    code: 'ZG',
    departments: [
      { name: 'Ziguinchor', communes: ['Ziguinchor','Niaguis','Tenghory'] },
      { name: 'Bignona', communes: ['Bignona','Diouloulou','Thionck Essyl'] }
    ]
  },
  {
    region: 'Saint-Louis',
    code: 'SL',
    departments: [
      { name: 'Saint-Louis', communes: ['Saint-Louis','Gandon'] },
      { name: 'Dagana', communes: ['Dagana','Richard Toll'] }
    ]
  }
];

export function getRegions(){
  return administrativeDivisions.map(r=>r.region);
}

export function getDepartments(region){
  return administrativeDivisions.find(r=>r.region===region)?.departments.map(d=>d.name) || [];
}

export function getCommunes(region, department){
  const dept = administrativeDivisions.find(r=>r.region===region)?.departments.find(d=>d.name===department);
  return dept?.communes || [];
}
