// src/services/authRoutingService.js
/**
 * Service de Routage Intelligent selon le Type d'Utilisateur
 * Empêche les redirections incorrectes après connexion
 */

/**
 * Détermine la route de dashboard appropriée selon le profil utilisateur
 */
export const getDashboardRoute = (profile) => {
  if (!profile) {
    return '/login';
  }

  // Admin : toujours vers le dashboard admin
  if (profile.role === 'admin' || profile.type === 'Administrateur') {
    return '/dashboard/admin';
  }

  // Selon le type d'utilisateur
  switch (profile.type?.toLowerCase()) {
    case 'particulier':
      return '/dashboard/particulier';
    
    case 'vendeur':
      return '/dashboard/vendeur';
    
    case 'banque':
      return '/dashboard/banque';
    
    case 'mairie':
      return '/dashboard/mairie';
    
    case 'notaire':
      return '/dashboard/notaire';
    
    case 'promoteur':
      return '/dashboard/promoteur';
    
    case 'agriculteur':
      return '/dashboard/agriculteur';
    
    case 'investisseur':
      return '/dashboard/investisseur';
    
    case 'agent':
      return '/dashboard/agent';
    
    // Types d'agent spécialisés
    case 'agent_immobilier':
      return '/dashboard/agent';
    
    case 'geometre':
      return '/dashboard/geometre';
    
    default:
      // Par défaut, redirection vers particulier si type non reconnu
      console.warn(`Type d'utilisateur non reconnu: ${profile.type}, redirection vers particulier`);
      return '/dashboard/particulier';
  }
};

/**
 * Vérifie si l'utilisateur peut accéder à une route donnée
 */
export const canAccessRoute = (profile, route) => {
  if (!profile) return false;

  // Admin peut accéder à tout
  if (profile.role === 'admin' || profile.type === 'Administrateur') {
    return true;
  }

  // Vérifier la correspondance type/route
  const expectedRoute = getDashboardRoute(profile);
  
  // Si la route demandée correspond à celle attendue
  if (route === expectedRoute) {
    return true;
  }

  // Routes publiques accessibles à tous
  const publicRoutes = [
    '/parcels',
    '/search',
    '/profile',
    '/settings',
    '/help',
    '/notifications'
  ];

  return publicRoutes.some(publicRoute => route.startsWith(publicRoute));
};

/**
 * Titre du dashboard selon le type d'utilisateur
 */
export const getDashboardTitle = (profile) => {
  if (!profile) return 'Dashboard';

  if (profile.role === 'admin') {
    return 'Administration';
  }

  switch (profile.type?.toLowerCase()) {
    case 'particulier':
      return 'Mon Espace Personnel';
    case 'vendeur':
      return 'Espace Vendeur';
    case 'banque':
      return 'Espace Bancaire';
    case 'mairie':
      return 'Espace Municipal';
    case 'notaire':
      return 'Office Notarial';
    case 'promoteur':
      return 'Espace Promoteur';
    case 'agriculteur':
      return 'Espace Agricole';
    case 'investisseur':
      return 'Espace Investisseur';
    case 'agent':
    case 'agent_immobilier':
      return 'Espace Agent';
    case 'geometre':
      return 'Bureau Géomètre';
    default:
      return 'Dashboard';
  }
};

/**
 * Icône appropriée selon le type d'utilisateur
 */
export const getDashboardIcon = (profile) => {
  if (!profile) return 'User';

  if (profile.role === 'admin') {
    return 'Shield';
  }

  switch (profile.type?.toLowerCase()) {
    case 'particulier':
      return 'User';
    case 'vendeur':
      return 'ShoppingCart';
    case 'banque':
      return 'Landmark';
    case 'mairie':
      return 'Building2';
    case 'notaire':
      return 'FileText';
    case 'promoteur':
      return 'TrendingUp';
    case 'agriculteur':
      return 'TreePine';
    case 'investisseur':
      return 'DollarSign';
    case 'agent':
    case 'agent_immobilier':
      return 'UserCog';
    case 'geometre':
      return 'MapPin';
    default:
      return 'User';
  }
};

/**
 * Couleur thématique selon le type d'utilisateur
 */
export const getDashboardTheme = (profile) => {
  if (!profile) return 'blue';

  if (profile.role === 'admin') {
    return 'red';
  }

  switch (profile.type?.toLowerCase()) {
    case 'particulier':
      return 'blue';
    case 'vendeur':
      return 'green';
    case 'banque':
      return 'blue';
    case 'mairie':
      return 'green';
    case 'notaire':
      return 'purple';
    case 'promoteur':
      return 'orange';
    case 'agriculteur':
      return 'green';
    case 'investisseur':
      return 'yellow';
    case 'agent':
    case 'agent_immobilier':
      return 'teal';
    case 'geometre':
      return 'indigo';
    default:
      return 'gray';
  }
};

/**
 * Fonctionnalités disponibles selon le type d'utilisateur
 */
export const getAvailableFeatures = (profile) => {
  if (!profile) return [];

  if (profile.role === 'admin') {
    return [
      'user_management',
      'content_moderation',
      'analytics',
      'system_settings',
      'security_monitoring',
      'all_features'
    ];
  }

  const baseFeatures = ['profile_management', 'notifications', 'help_support'];

  switch (profile.type?.toLowerCase()) {
    case 'particulier':
      return [
        ...baseFeatures,
        'search_parcels',
        'favorites',
        'saved_searches',
        'document_verification',
        'transition_to_seller'
      ];

    case 'vendeur':
      return [
        ...baseFeatures,
        'create_listings',
        'manage_listings',
        'view_inquiries',
        'sales_analytics',
        'document_management'
      ];

    case 'banque':
      return [
        ...baseFeatures,
        'loan_applications',
        'credit_evaluation',
        'financial_verification',
        'partnership_requests'
      ];

    case 'mairie':
      return [
        ...baseFeatures,
        'urban_planning',
        'permits_management',
        'tax_assessment',
        'municipal_services'
      ];

    case 'notaire':
      return [
        ...baseFeatures,
        'contract_preparation',
        'document_authentication',
        'legal_consultation',
        'transaction_supervision'
      ];

    case 'promoteur':
      return [
        ...baseFeatures,
        'project_management',
        'development_planning',
        'investor_relations',
        'construction_monitoring'
      ];

    case 'agriculteur':
      return [
        ...baseFeatures,
        'land_management',
        'crop_planning',
        'agricultural_finance',
        'market_access'
      ];

    case 'investisseur':
      return [
        ...baseFeatures,
        'investment_opportunities',
        'portfolio_management',
        'market_analysis',
        'roi_tracking'
      ];

    case 'agent':
    case 'agent_immobilier':
      return [
        ...baseFeatures,
        'client_management',
        'property_evaluation',
        'commission_tracking',
        'marketing_tools'
      ];

    case 'geometre':
      return [
        ...baseFeatures,
        'land_surveying',
        'mapping_services',
        'boundary_determination',
        'technical_reports'
      ];

    default:
      return baseFeatures;
  }
};

export default {
  getDashboardRoute,
  canAccessRoute,
  getDashboardTitle,
  getDashboardIcon,
  getDashboardTheme,
  getAvailableFeatures
};
