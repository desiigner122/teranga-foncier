// src/components/layout/sidebarConfig.js
import {
    LayoutDashboard, User, Settings, Users, UserCheck, BarChart, FileSignature, FileCheck as FileCheckIcon,
    LandPlot, Briefcase, ClipboardList, Search, ShieldCheck, TrendingUp, Calculator, Leaf, Tractor, CloudSun,
    Banknote, Scale, FolderCheck, Landmark, Map, AlertTriangle, Gavel, Archive, Home, Heart, Bell, MessageSquare, UploadCloud, Receipt, FolderArchive,
    Handshake, Activity, LogOut,
    PieChart, Globe, Palette, Package, ShoppingCart, Calendar, FileText, BookOpen, Layers,
    Store, Sprout, Shield, PlusCircle, Building,
    DollarSign,
    MessageSquareText
} from 'lucide-react';

const commonLinks = {
    profile: { label: 'Mon Profil', href: '/profile', icon: User, end: true },
    settings: { label: 'Paramètres', href: '/settings', icon: Settings, end: true },
    notifications: { label: 'Notifications', href: '/notifications', icon: Bell, end: true },
    messaging: { label: 'Messagerie', href: '/messaging', icon: MessageSquare, end: true },
    logout: { label: 'Déconnexion', href: '/logout', icon: LogOut, end: true }
};

const adminConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION PRINCIPALE' },
    {
        label: 'Utilisateurs & Accès',
        icon: Users,
        subItems: [
            { label: 'Tous les Utilisateurs', href: '/dashboard/users', icon: Users, end: true },
            { label: 'Administrateurs', href: '/dashboard/users?type=Administrateur', icon: ShieldCheck, end: true },
            { label: 'Agents Fonciers', href: '/dashboard/agents', icon: UserCheck, end: true },
            { label: 'Particuliers', href: '/dashboard/users?type=Particulier', icon: User, end: true },
            { label: 'Vendeurs', href: '/dashboard/users?type=Vendeur', icon: Store, end: true },
            { label: 'Mairies', href: '/dashboard/users?type=Mairie', icon: Building, end: true },
            { label: 'Banques', href: '/dashboard/users?type=Banque', icon: Banknote, end: true },
            { label: 'Notaires', href: '/dashboard/users?type=Notaire', icon: Gavel, end: true },
            { label: 'Promoteurs', href: '/dashboard/users?type=Promoteur', icon: Home, end: true },
            { label: 'Agriculteurs', href: '/dashboard/users?type=Agriculteur', icon: Leaf, end: true },
            { label: 'Investisseurs', href: '/dashboard/users?type=Investisseur', icon: TrendingUp, end: true },
        ]
    },
    { label: 'Parcelles', href: '/dashboard/parcels', icon: LandPlot, end: true },
    { label: 'Demandes', href: '/dashboard/requests', icon: FileSignature, end: true },
    { label: 'Contrats', href: '/dashboard/contracts', icon: FileText, end: true },
    { label: 'Transactions', href: '/dashboard/transactions', icon: Receipt, end: true },
    { label: 'Conformité', href: '/dashboard/compliance', icon: ShieldCheck, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'CONTENU & ANALYSES' },
    { label: 'Blog', href: '/dashboard/blog', icon: BookOpen, end: true },
    { label: 'Rapports & Stats', href: '/dashboard/reports', icon: BarChart, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const agentConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION AGENT' },
    { label: 'Mes Clients', href: '/dashboard/clients', icon: Users, end: true },
    { label: 'Mes Parcelles', href: '/dashboard/parcels', icon: LandPlot, end: true },
    { label: 'Mes Tâches', href: '/dashboard/tasks', icon: ClipboardList, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const particulierConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MES BIENS & DEMANDES' },
    { label: 'Mes Acquisitions', href: '/dashboard/my-acquisitions', icon: FolderCheck, end: true },
    { label: 'Mes Demandes', href: '/dashboard/my-requests', icon: FileSignature, end: true },
    { label: 'Mes Litiges', href: '/dashboard/my-disputes', icon: AlertTriangle, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'EXPLORER LE FONCIER' },
    { label: 'Terrains Disponibles', href: '/dashboard/land-management', icon: LandPlot, end: true },
    { label: 'Plan d\'Urbanisme', href: '/dashboard/urban-plan', icon: Landmark, end: true },
    { label: 'Cadastre Numérique', href: '/dashboard/cadastre', icon: Map, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const vendeurConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MES PROPRIÉTÉS' },
    { label: 'Mes Annonces', href: '/dashboard/my-listings', icon: LandPlot, end: true },
    { label: 'Mes Transactions', href: '/dashboard/my-transactions', icon: Receipt, end: true },
    { label: 'Soumettre une Parcelle', href: '/dashboard/submit-parcel', icon: UploadCloud, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const investisseurConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'INVESTISSEMENTS' },
    { label: 'Opportunités', href: '/dashboard/investment-opportunities', icon: TrendingUp, end: true },
    { label: 'Mon Portefeuille', href: '/dashboard/portfolio', icon: Briefcase, end: true },
    { label: 'Évaluations Foncières', href: '/dashboard/land-valuation', icon: Scale, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const promoteurConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'PROJETS IMMOBILIERS' },
    { label: 'Mes Projets', href: '/dashboard/my-projects', icon: Building, end: true },
    { label: 'Acquisition Foncière', href: '/dashboard/land-acquisition', icon: LandPlot, end: true },
    { label: 'Financements', href: '/dashboard/funding-requests', icon: Banknote, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const agriculteurConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION AGRICOLE' },
    { label: 'Mes Terres', href: '/dashboard/my-lands', icon: Leaf, end: true },
    { label: 'Demandes de Subventions', href: '/dashboard/subsidies', icon: DollarSign, end: true },
    { label: 'Météo Agricole', href: '/dashboard/weather', icon: CloudSun, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const banqueConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION DES GARANTIES' },
    { label: 'Évaluations Foncières', href: '/dashboard/land-valuation', icon: Scale, end: true },
    { label: 'Demandes de Financement', href: '/dashboard/funding-requests', icon: Banknote, end: true },
    { label: 'Gestion des Garanties', href: '/dashboard/guarantees', icon: ShieldCheck, end: true },
    { label: 'Rapports de Conformité', href: '/dashboard/compliance', icon: FileCheckIcon, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const mairieConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'GESTION COMMUNALE' },
    { label: 'Gestion Foncière', href: '/dashboard/land-management', icon: LandPlot, end: true },
    { label: 'Demandes Citoyens', href: '/dashboard/mairie-requests', icon: FileSignature, end: true },
    { label: 'Plan d\'Urbanisme', href: '/dashboard/urban-plan', icon: Landmark, end: true },
    { label: 'Cadastre Numérique', href: '/dashboard/cadastre', icon: Map, end: true },
    { label: 'Litiges Fonciers', href: '/dashboard/disputes', icon: AlertTriangle, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'MON COMPTE' },
    commonLinks.profile,
    commonLinks.settings,
    commonLinks.notifications,
    commonLinks.messaging,
    commonLinks.logout,
];

const notaireConfig = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
    { isSeparator: true },
    { isHeader: true, label: 'DOSSIERS & ACTES' },
    { label: 'Gestion des Dossiers', href: '/dashboard/cases', icon: Briefcase, end: true },
    { label: 'Authentification des Actes', href: '/dashboard/authentication', icon: Handshake, end: true },
    { label: 'Archives Notariales', href: '/dashboard/archives', icon: Archive, end: true },
    { label: 'Évaluations Foncières', href: '/dashboard/land-valuation', icon: Scale, end: true },
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

    if (user.role === 'admin') {
        return adminConfig;
    }
    if (user.role === 'agent') {
        return agentConfig;
    }

    switch (user.type) {
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
                { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, end: true },
                commonLinks.profile,
                commonLinks.settings,
                commonLinks.notifications,
                commonLinks.messaging,
                commonLinks.logout,
            ];
    }
};
