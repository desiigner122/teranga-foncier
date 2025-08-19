// Hierarchical administrative divisions for Senegal (Regions -> Départements -> Communes)
// NOTE: Liste partielle (exemples). Étendre selon besoin.
// Structure: regions: [ { code, name, departments: [ { code, name, communes: [ { code, name } ] } ] } ]

export const senegalAdministrativeDivisions = [
  {
    code: 'DK',
    name: 'Dakar',
    departments: [
      { code: 'DK-DK', name: 'Dakar', communes: [
        { code: 'DK-DK-PLATEAU', name: 'Plateau' },
        { code: 'DK-DK-MEDINA', name: 'Médina' },
        { code: 'DK-DK-FANN', name: 'Fann-Point E' },
        { code: 'DK-DK-YOFF', name: 'Yoff' },
        { code: 'DK-DK-NGOR', name: 'Ngor' }
      ]},
      { code: 'DK-GUE', name: 'Guédiawaye', communes: [
        { code: 'DK-GUE-WAKHINANE', name: 'Wakhinane' },
        { code: 'DK-GUE-GOLF', name: 'Golf Sud' }
      ]},
      { code: 'DK-PIK', name: 'Pikine', communes: [
        { code: 'DK-PIK-THIAROYE', name: 'Thiaroye' },
        { code: 'DK-PIK-GUINAW', name: 'Guinaw-Rails' }
      ]},
      { code: 'DK-RUF', name: 'Rufisque', communes: [
        { code: 'DK-RUF-DIAMNIADIO', name: 'Diamniadio' },
        { code: 'DK-RUF-BARGNY', name: 'Bargny' }
      ]}
    ]
  },
  {
    code: 'TH',
    name: 'Thiès',
    departments: [
      { code: 'TH-TH', name: 'Thiès', communes: [
        { code: 'TH-TH-NIACOURAB', name: 'Niacourab' },
        { code: 'TH-TH-KEURCHEIKH', name: 'Keur Cheikh' }
      ]},
      { code: 'TH-MBO', name: 'Mbour', communes: [
        { code: 'TH-MBO-SALY', name: 'Saly' },
        { code: 'TH-MBO-NGAPAROU', name: 'Ngaparou' }
      ]},
      { code: 'TH-TIV', name: 'Tivaouane', communes: [
        { code: 'TH-TIV-TIVAOUANE', name: 'Tivaouane' },
        { code: 'TH-TIV-MERINA', name: 'Mékhé' }
      ]}
    ]
  },
  {
    code: 'SL',
    name: 'Saint-Louis',
    departments: [
      { code: 'SL-SL', name: 'Saint-Louis', communes: [
        { code: 'SL-SL-SLB', name: 'Saint-Louis (Barre)' },
        { code: 'SL-SL-SLS', name: 'Saint-Louis (Sor)' }
      ]},
      { code: 'SL-DAG', name: 'Dagana', communes: [
        { code: 'SL-DAG-RICHARD', name: 'Richard-Toll' },
        { code: 'SL-DAG-ROSS', name: 'Ross-Béthio' }
      ]}
    ]
  },
  {
    code: 'ZG',
    name: 'Ziguinchor',
    departments: [
      { code: 'ZG-ZIG', name: 'Ziguinchor', communes: [
        { code: 'ZG-ZIG-ZIG', name: 'Ziguinchor' },
        { code: 'ZG-ZIG-ENAMPOR', name: 'Enampor' }
      ]},
      { code: 'ZG-OUS', name: 'Oussouye', communes: [
        { code: 'ZG-OUS-CAP', name: 'Cap Skirring' },
        { code: 'ZG-OUS-OUS', name: 'Oussouye' }
      ]}
    ]
  }
];

export const senegalBanks = [
  'BICIS', 'Société Générale Sénégal', 'Banque Atlantique', 'Ecobank', 'UBA', 'CBAO', 'La Banque Agricole', 'Orabank'
];

export const notaireSpecialities = [
  'Transactions Immobilières',
  'Successions & Donations',
  'Baux & Locations',
  'Droit des Affaires',
  'Contentieux Foncier'
];
