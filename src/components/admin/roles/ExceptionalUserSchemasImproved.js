// Dynamic field schema per institutional / actor role for exceptional creation
// Each schema entry: { key, label, type, required, options?, dependsOn?, placeholder?, description? }

export const exceptionalRoleSchemas = {
  Particulier: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false, description: 'Région de résidence principale' },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'additional_info', label: 'Informations complémentaires', type: 'textarea', required: false }
  ],
  Vendeur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'department', label: 'Département', type: 'select-department', required: true, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: true, dependsOn: 'department' },
    { key: 'has_verified_land', label: 'Possède titre foncier', type: 'checkbox', required: false },
    { key: 'additional_info', label: 'Informations complémentaires', type: 'textarea', required: false }
  ],
  Investisseur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région d\'intérêt', type: 'select-region', required: false },
    { key: 'portfolio_min', label: 'Budget Min (XOF)', type: 'number', required: false },
    { key: 'portfolio_max', label: 'Budget Max (XOF)', type: 'number', required: false },
    { key: 'investment_preferences', label: 'Préférences d\'investissement', type: 'textarea', required: false, placeholder: 'Types de propriétés recherchées, localisation préférée, etc.' }
  ],
  Promoteur: [
    { key: 'full_name', label: 'Entité / Nom', type: 'text', required: true },
    { key: 'rc_number', label: 'RC / Identifiant', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région principale', type: 'select-region', required: false },
    { key: 'project_types', label: 'Types de projets', type: 'textarea', required: false, placeholder: 'Immeubles, lotissements, villas, etc.' },
    { key: 'portfolio_size', label: 'Taille portfolio (XOF)', type: 'number', required: false }
  ],
  Agriculteur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'department', label: 'Département', type: 'select-department', required: true, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: true, dependsOn: 'department' },
    { key: 'surface_ha', label: 'Surface (ha)', type: 'number', required: false },
    { key: 'cultivation_type', label: 'Type de culture', type: 'text', required: false }
  ],
  Banque: [
    { key: 'bank_name', label: 'Banque', type: 'select-bank', required: true },
    { key: 'responsable', label: 'Responsable', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'services', label: 'Services proposés', type: 'textarea', required: false, placeholder: 'Prêts immobiliers, financement agricole, etc.' }
  ],
  Notaire: [
    { key: 'study_name', label: 'Étude', type: 'text', required: true },
    { key: 'full_name', label: 'Nom du notaire', type: 'text', required: false },
    { key: 'notaire_speciality', label: 'Spécialité', type: 'select-notaire-speciality', required: true },
    { key: 'approval_number', label: 'N° Agrément', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' }
  ],
  Mairie: [
    { key: 'region', label: 'Région', type: 'select-region', required: true },
    { key: 'department', label: 'Département', type: 'select-department', required: true, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: true, dependsOn: 'department' },
    { key: 'agent_referent', label: 'Agent référent', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'authorized_services', label: 'Services autorisés', type: 'textarea', required: false, placeholder: 'Permis de construire, Certificats fonciers, etc.' }
  ],
  Agent: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'coverage_zone', label: 'Zone de couverture', type: 'text', required: false },
    { key: 'max_clients', label: 'Quota clients', type: 'number', required: false },
    { key: 'region', label: 'Région principale', type: 'select-region', required: false },
    { key: 'professionnel_type', label: 'Type de professionnel', type: 'select-professionnel-type', required: false },
    { key: 'specialization', label: 'Spécialisation', type: 'text', required: false }
  ],
  Administrateur: [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'require_mfa', label: 'Forcer 2FA', type: 'checkbox', required: false },
    { key: 'admin_level', label: 'Niveau administrateur', type: 'text', required: false, placeholder: 'Super, Standard, Support, etc.' },
    { key: 'access_restrictions', label: 'Restrictions d\'accès', type: 'textarea', required: false }
  ],
  'Géomètre': [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'study_name', label: 'Cabinet', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'license_number', label: 'N° Licence', type: 'text', required: false },
    { key: 'services', label: 'Services proposés', type: 'textarea', required: false }
  ],
  'Agent Immobilier': [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'agency_name', label: 'Agence', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'license_number', label: 'N° Carte professionnelle', type: 'text', required: false },
    { key: 'specialization', label: 'Spécialisation', type: 'text', required: false }
  ],
  'Expert Immobilier': [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'firm_name', label: 'Cabinet', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'certification', label: 'Certification', type: 'text', required: false },
    { key: 'expertise_domains', label: 'Domaines d\'expertise', type: 'textarea', required: false }
  ],
  'Avocat': [
    { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
    { key: 'law_firm', label: 'Cabinet', type: 'text', required: false },
    { key: 'phone', label: 'Téléphone', type: 'text', required: false },
    { key: 'region', label: 'Région', type: 'select-region', required: false },
    { key: 'department', label: 'Département', type: 'select-department', required: false, dependsOn: 'region' },
    { key: 'commune', label: 'Commune', type: 'select-commune', required: false, dependsOn: 'department' },
    { key: 'bar_number', label: 'N° Barreau', type: 'text', required: false },
    { key: 'legal_specialties', label: 'Spécialités juridiques', type: 'textarea', required: false, placeholder: 'Droit foncier, litiges immobiliers, etc.' }
  ]
};

export const defaultExceptionalTypeOrder = [
  'Mairie',
  'Banque',
  'Notaire',
  'Agent',
  'Agent Immobilier',
  'Géomètre',
  'Expert Immobilier',
  'Avocat',
  'Vendeur',
  'Particulier',
  'Investisseur',
  'Promoteur',
  'Agriculteur',
  'Administrateur'
];
