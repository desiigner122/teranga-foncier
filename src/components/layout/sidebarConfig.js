// src/components/layout/sidebarConfig.js
import {
    LayoutDashboard, User, Settings, Users, UserCheck, BarChart, FileSignature, FileCheck as FileCheckIcon,
    LandPlot, Briefcase, ClipboardList, Search, ShieldCheck, TrendingUp, Calculator, Leaf, Tractor, CloudSun,
    Banknote, Scale, FolderCheck, Landmark, Map, AlertTriangle, Gavel, Archive, Home, Heart, Bell, MessageSquare, UploadCloud, Receipt, FolderArchive,
    Handshake, Activity, LogOut,
    PieChart, Globe, Palette, Package, ShoppingCart, Calendar, FileText, BookOpen, Layers,
    Store, Sprout, Shield, Building, DollarSign, Receipt // Ajoutez toutes les icônes nécessaires
} from 'lucide-react';

const commonLinks = {
    profile: { label: 'Mon Profil', href: '/dashboard/profile', icon: User, end: true },
    settings: { label: 'Paramètres', href: '/dashboard/settings', icon: Settings, end: true },
    notifications: { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, end: true },
    messaging: { label: 'Messagerie', href: '/dashboard/messaging', icon: MessageSquare, end: true },
    logout: { label: 'Déconnexion', href: '/logout', icon: LogOut, end: true }
};

const adminConfig = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION' },
    {
        label: 'Utilisateurs & Accès',
        icon: Users,
        subItems: [
            { label: 'Tous les Utilisateurs', href: '/dashboard/admin/users', icon: Users, end: true },
            { label: 'Administrateurs', href: '/dashboard/admin/users?type=Administrateur', icon: Shield, end: true },
            { label: 'Agents Fonciers', href: '/dashboard/admin/users?type=Agent', icon: UserCheck, end: true },
            { label: 'Particuliers', href: '/dashboard/admin/users?type=Particulier', icon: User, end: true },
            { label: 'Vendeurs', href: '/dashboard/admin/users?type=Vendeur', icon: Store, end: true },
            { label: 'Mairies', href: '/dashboard/admin/users?type=Mairie', icon: Landmark, end: true },
            { label: 'Banques', href: '/dashboard/admin/users?type=Banque', icon: Banknote, end: true },
            { label: 'Notaires', href: '/dashboard/admin/users?type=Notaire', icon: Gavel, end: true },
            { label: 'Promoteurs', href: '/dashboard/admin/users?type=Promoteur', icon: Building, end: true },
            { label: 'Agriculteurs', href: '/dashboard/admin/users?type=Agriculteur', icon: Leaf, end: true },
            { label: 'Investisseurs', href: '/dashboard/admin/users?type=Investisseur', icon: TrendingUp, end: true },
        ],
    },
    { label: 'Parcelles', href: '/dashboard/admin/parcels', icon: LandPlot, end: true },
    { label: 'Demandes', href: '/dashboard/admin/requests', icon: FileSignature, end: true },
    { label: 'Contrats', href: '/dashboard/admin/contracts', icon: Receipt, end: true },
    { label: 'Transactions', href: '/dashboard/admin/transactions', icon: DollarSign, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'RÉGULATION & SURVEILLANCE' },
    { label: 'Conformité', href: '/dashboard/admin/compliance', icon: ShieldCheck, end: true },
    { label: 'Rapports & Stats', href: '/dashboard/admin/reports', icon: BarChart, end: true },
    { label: 'Litiges', href: '/dashboard/admin/disputes', icon: AlertTriangle, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'OUTILS' },
    { label: 'Assistant IA', href: '/dashboard/admin/ai-assistant', icon: LifeBuoy, end: true },
    { label: 'Gestion du Blog', href: '/dashboard/admin/blog', icon: BookOpen, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const agentConfig = [
    { label: 'Dashboard', href: '/dashboard/agent', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION QUOTIDIENNE' },
    { label: 'Mes Clients', href: '/dashboard/agent/clients', icon: Users, end: true },
    { label: 'Mes Parcelles', href: '/dashboard/agent/parcels', icon: LandPlot, end: true },
    { label: 'Mes Tâches', href: '/dashboard/agent/tasks', icon: ClipboardList, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const particulierConfig = [
    { label: 'Dashboard', href: '/dashboard/particulier', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MES BIENS & DEMANDES' },
    { label: 'Mes Demandes', href: '/dashboard/my-requests', icon: FileSignature, end: true },
    { label: 'Mes Annonces', href: '/dashboard/my-listings', icon: UploadCloud, end: true },
    { label: 'Mes Favoris', href: '/dashboard/favorites', icon: Heart, end: true },
    { label: 'Mon Coffre Numérique', href: '/dashboard/digital-vault', icon: FolderArchive, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'TRANSACTIONS & PAIEMENTS' },
    { label: 'Mes Transactions', href: '/dashboard/transactions', icon: DollarSign, end: true },
    { label: 'Mes Paiements', href: '/dashboard/payment', icon: Banknote, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const vendeurConfig = [
    { label: 'Dashboard', href: '/dashboard/vendeur', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MES ANNONCES' },
    { label: 'Mes Annonces', href: '/dashboard/my-listings', icon: UploadCloud, end: true },
    { label: 'Vendre une Propriété', href: '/dashboard/sell-property', icon: Handshake, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DES VENTES' },
    { label: 'Suivi des Demandes', href: '/dashboard/my-requests', icon: FileSignature, end: true },
    { label: 'Mes Transactions', href: '/dashboard/transactions', icon: DollarSign, end: true },
    { label: 'Mes Contrats', href: '/dashboard/contracts', icon: Receipt, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const investisseurConfig = [
    { label: 'Dashboard', href: '/dashboard/investisseur', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'ANALYSE & OPPORTUNITÉS' },
    { label: 'Analyse de Marché', href: '/dashboard/investisseur/market-analysis', icon: TrendingUp, end: true },
    { label: 'Opportunités', href: '/dashboard/investisseur/opportunities', icon: Search, end: true },
    { label: 'Calculateur ROI', href: '/dashboard/investisseur/roi-calculator', icon: Calculator, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MES INVESTISSEMENTS' },
    { label: 'Mes Investissements', href: '/dashboard/investisseur/investments', icon: Briefcase, end: true },
    { label: 'Due Diligence', href: '/dashboard/investisseur/due-diligence', icon: ClipboardList, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const promoteurConfig = [
    { label: 'Dashboard', href: '/dashboard/promoteur', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DE PROJETS' },
    { label: 'Mes Projets', href: '/dashboard/promoteur/projects', icon: Building, end: true },
    { label: 'Suivi Construction', href: '/dashboard/promoteur/construction-tracking', icon: ClipboardList, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'VENTES & FINANCES' },
    { label: 'Ventes', href: '/dashboard/promoteur/sales', icon: DollarSign, end: true },
    { label: 'Transactions', href: '/dashboard/transactions', icon: Banknote, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const agriculteurConfig = [
    { label: 'Dashboard', href: '/dashboard/agriculteur', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DES TERRES' },
    { label: 'Mes Terres', href: '/dashboard/agriculteur/my-lands', icon: Leaf, end: true },
    { label: 'Analyse du Sol', href: '/dashboard/agriculteur/soil-analysis', icon: Scale, end: true },
    { label: 'Météo & Climat', href: '/dashboard/agriculteur/weather', icon: CloudSun, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'OPÉRATIONS' },
    { label: 'Journal de Bord', href: '/dashboard/agriculteur/logbook', icon: BookOpen, end: true },
    { label: 'Équipement', href: '/dashboard/agriculteur/equipment', icon: Tractor, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const banqueConfig = [
    { label: 'Dashboard', href: '/dashboard/banque', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DES GARANTIES' },
    { label: 'Mes Garanties', href: '/dashboard/banque/guarantees', icon: ShieldCheck, end: true },
    { label: 'Évaluation Foncière', href: '/dashboard/banque/land-valuation', icon: Scale, end: true },
    { label: 'Demandes de Financement', href: '/dashboard/banque/funding-requests', icon: Banknote, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'CONFORMITÉ & RAPPORTS' },
    { label: 'Conformité', href: '/dashboard/banque/compliance', icon: FolderCheck, end: true },
    { label: 'Rapports & Analyses', href: '/dashboard/banque/reports', icon: BarChart, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const mairieConfig = [
    { label: 'Dashboard', href: '/dashboard/mairie', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION FONCIÈRE' },
    { label: 'Gestion des Terres', href: '/dashboard/mairie/land-management', icon: LandPlot, end: true },
    { label: 'Cadastre Numérique', href: '/dashboard/mairie/cadastre', icon: Map, end: true },
    { label: 'Plan d\'Urbanisme', href: '/dashboard/mairie/urban-plan', icon: Landmark, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'DEMANDES & LITIGES' },
    { label: 'Gestion des Demandes', href: '/dashboard/mairie/requests', icon: FileSignature, end: true },
    { label: 'Litiges Fonciers', href: '/dashboard/mairie/disputes', icon: AlertTriangle, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const notaireConfig = [
    { label: 'Dashboard', href: '/dashboard/notaire', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DES DOSSIERS' },
    { label: 'Dossiers en Cours', href: '/dashboard/notaire/cases', icon: Briefcase, end: true },
    { label: 'Authentification d\'Actes', href: '/dashboard/notaire/authentication', icon: Gavel, end: true },
    { label: 'Archives', href: '/dashboard/notaire/archives', icon: Archive, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'OUTILS' },
    { label: 'Vérification de Conformité', href: '/dashboard/notaire/compliance-check', icon: ShieldCheck, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];


export const getSidebarConfig = (user) => {
    if (!user) {
        return [
            { label: 'Accueil', href: '/', icon: Home, end: true },
        ];
    }
    
    const userRole = user.role;
    const userType = user.type;

    if (userRole === 'admin' || userType === 'Administrateur') {
        return adminConfig;
    }
    if (userRole === 'agent' || userType === 'Agent') {
        return agentConfig;
    }

    switch (userType) {
        case 'Vendeur':
            return vendeurConfig;
        case 'Investisseur':
            return investisseurConfig;
        case 'Promoteur':
            return promoteurConfig;
        case 'Agriculteur':
            return agriculteurConfig;
        case 'Banque':
            return banqueConfig;
        case 'Mairie':
            return mairieConfig;
        case 'Notaire':
            return notaireConfig;
        case 'Particulier':
            return particulierConfig;
        default:
            return [
                { label: 'Dashboard', href: '/dashboard/particulier', icon: LayoutDashboard, end: true },
                commonLinks.profile,
                commonLinks.settings,
                commonLinks.notifications,
                commonLinks.messaging,
                commonLinks.logout,
            ];
    }
};
