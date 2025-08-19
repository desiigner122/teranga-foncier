// Dynamic field schema per institutional / actor role for exceptional creation
// Each schema entry: { key, label, type, required, options?, dependsOn?, placeholder }

export const exceptionalRoleSchemas = {
  Particulier: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false }
  ],
  Vendeur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'department', label: 'Département', type: 'select-department', required: true, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: true, dependsOn: 'department' }
  ],
  Investisseur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: false },
    { key: 'portfolio_min', label: 'Budget Min (XOF)', type: 'number', required: false },
    { key: 'portfolio_max', label: 'Budget Max (XOF)', type: 'number', required: false }
  ],
  Promoteur: [
    { key: 'full_name', label: 'Entité / Nom', type: 'text', required: true },
    { key: 'rc_number', label: 'RC / Identifiant', type: 'text', required: false }
  ],
  Agriculteur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'surface_ha', label: 'Surface (ha)', type: 'number', required: false }
  ],
  Banque: [
    { key: 'bank_name', label: 'Banque', type: 'select-bank', required: true },
    { key: 'responsable', label: 'Responsable', type: 'text', required: true },
    { key: 'region', label: 'Région', type: 'select-region', required: false }
  ],
  Notaire: [
    { key: 'study_name', label: 'Étude', type: 'text', required: true },
    { key: 'notaire_speciality', label: 'Spécialité', type: 'select-notaire-speciality', required: true },
    { key: 'approval_number', label: 'N° Agrément', type: 'text', required: false }
  ],
  Mairie: [
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'department', label: 'Département', type: 'select-department', required: true, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: true, dependsOn: 'department' },
    { key: 'agent_referent', label: 'Agent référent', type: 'text', required: false }
  ],
  Agent: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'coverage_zone', label: 'Zone de couverture', type: 'text', required: false },
    { key: 'max_clients', label: 'Quota clients', type: 'number', required: false }
  ],
  Administrateur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'require_mfa', label: 'Forcer 2FA', type: 'checkbox', required: false }
  ]
};

export const defaultExceptionalTypeOrder = [
  'Mairie','Banque','Notaire','Agent','Vendeur','Particulier','Investisseur','Promoteur','Agriculteur','Administrateur'
];
