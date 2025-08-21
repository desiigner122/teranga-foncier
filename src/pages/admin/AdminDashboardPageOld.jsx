// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Users, Building, DollarSign, LandPlot, Activity, FileCheck, BarChart, PieChart as PieChartIcon, Landmark, Gavel, UserCheck, CalendarDays } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import SupabaseDataService from '../../services/SupabaseDataService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

// Navigation Items pour le sidebar admin
const ADMIN_NAV_ITEMS = [
  {
    title: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
    description: "Tableau de bord principal"
  },
  {
    title: "Gestion des Utilisateurs",
    icon: Users,
    href: "/dashboard/admin/users",
    description: "Gérer tous les utilisateurs"
  },
  {
    title: "Gestion des Parcelles",
    icon: LandPlot,
    href: "/dashboard/admin/parcels",
    description: "Gérer toutes les parcelles"
  },
  {
    title: "Institutions",
    icon: Building,
    href: "/dashboard/admin/institutions",
    description: "Gérer les institutions"
  },
  {
    title: "Rapports",
    icon: FileText,
    href: "/dashboard/admin/reports",
    description: "Rapports et analytics"
  },
  {
    title: "Demandes",
    icon: FileCheck,
    href: "/dashboard/admin/requests",
    description: "Gérer les demandes"
  },
  {
    title: "Transactions",
    icon: DollarSign,
    href: "/dashboard/admin/transactions",
    description: "Suivi des transactions"
  },
  {
    title: "Rôles & Permissions",
    icon: ShieldCheck,
    href: "/dashboard/admin/roles",
    description: "Gestion des rôles"
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/dashboard/admin/settings",
    description: "Configuration système"
  }
];

// Quick Actions pour l'admin
const QUICK_ACTIONS = [
  {
    title: "Ajouter Utilisateur",
    description: "Créer un nouveau compte utilisateur",
    icon: User,
    href: "/dashboard/admin/users/create",
    color: "bg-blue-500"
  },
  {
    title: "Nouvelle Institution",
    description: "Enregistrer une nouvelle institution",
    icon: Building,
    href: "/dashboard/admin/institutions/create",
    color: "bg-green-500"
  },
  {
    title: "Rapport Analytics",
    description: "Générer un rapport détaillé",
    icon: BarChart,
    href: "/dashboard/admin/reports/generate",
    color: "bg-purple-500"
  },
  {
    title: "Gérer Permissions",
    description: "Configurer les rôles et accès",
    icon: ShieldCheck,
    href: "/dashboard/admin/roles",
    color: "bg-orange-500"
  }
];

// AdminSidebar Component
const AdminSidebar = ({ 
  const [loading, setLoading] = useState(false);
isCollapsed, onToggle }) => {
  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold text-lg ${isCollapsed ? 'hidden' : 'block'}`}>
            Administration
          </h2>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="p-2">
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Composant de graphique à barres simple (réutilisable)
const SimpleBarChart = ({ data, dataKey, labelKey, barColorClass, title }) => {
  const color = barColorClass.replace('bg-', '');

  return (
    <div className="h-[250px] w-full">
      <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip formatter={(value) => `${value} ${dataKey === 'amount' ? 'XOF' : ''}`} />
          <Legend />
          <Bar dataKey={dataKey} fill={`#${color}`} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Composant de graphique en secteurs simple (réutilisable)
const SimplePieChart = ({ data, title }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

  return (
    <div className="h-[250px] w-full flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit || ''}`, props.payload.name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminDashboardPage = () => {
  // Loading géré par le hook temps réel
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    userRegistrations: [],
    parcelStatus: [],
    requestTypes: [],
    monthlySales: [],
    totalUsers: 0,
    totalParcels: 0,
    totalRequests: 0,
    totalSalesAmount: 0,
    upcomingEvents: [],
  });
  const [actorStats, setActorStats] = useState({
    vendeur: { parcellesListees: 0, transactionsReussies: 0 },
    particulier: { demandesSoumises: 0, acquisitions: 0 },
    mairie: { parcellesCommunales: 0, demandesTraitees: 0 },
    banque: { pretsAccordes: 0, garantiesEvaluees: 0 },
    notaire: { dossiersTraites: 0, actesAuthentifies: 0 },
    agent: { clientsAssignes: 0, visitesPlanifiees: 0 },
  });

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Essai RPC unifié d'abord
      let unified = null;
      try { unified = await SupabaseDataService.getAdminDashboardMetricsUnified(); } catch {/* silent */}
      const useLegacy = !unified || !unified.charts?.requestTypes || !unified.charts?.monthlySales; // unifié minimal -> legacy requis
      let totals, charts, newActorStats, upcomingEvents;
      if (useLegacy) {
        const legacy = await SupabaseDataService.getAdminDashboardMetrics();
        totals = legacy.totals; charts = legacy.charts; newActorStats = legacy.actorStats; upcomingEvents = legacy.upcomingEvents;
        if (unified?.totals?.pendingSubmissions) {
          totals.pendingSubmissions = unified.totals.pendingSubmissions;
        }
      } else {
        totals = unified.totals; charts = unified.charts; newActorStats = unified.actorStats || { vendeur:{}, particulier:{}, mairie:{}, banque:{}, notaire:{}, agent:{} }; upcomingEvents = unified.upcomingEvents || [];
      }
      setReportData({
        userRegistrations: charts.userRegistrations,
        parcelStatus: charts.parcelStatus,
        requestTypes: charts.requestTypes,
        monthlySales: charts.monthlySales,
        totalUsers: totals.totalUsers,
        totalParcels: totals.totalParcels,
        totalRequests: totals.totalRequests,
        totalSalesAmount: totals.totalSalesAmount,
        upcomingEvents,
      });
      setActorStats(newActorStats);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement du tableau de bord",
        description: err.message,
      });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'DELETE_USER':
        // Rafraîchir les données après suppression
        await fetchData();
        toast({
          title: "Utilisateur supprimé",
          description: `${result.deletedUser.full_name} a été supprimé du système`,
        });
        break;
      case 'GENERATE_REPORT':
        // Ouvrir un modal avec le rapport ou rediriger
        break;
      default:
        // Rafraîchir les données par défaut
        await fetchData();
    }
  };

  if (loading && reportData.totalUsers === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3 text-blue-600"/>
        Tableau de Bord Administrateur
      </h1>
      <p className="text-muted-foreground">Vue d'overview et statistiques clés de la plateforme Teranga Foncier.</p>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Enregistrés</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total sur la plateforme</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelles Gérées</CardTitle>
            <LandPlot className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalParcels}</div>
            <p className="text-xs text-muted-foreground">Total dans le cadastre</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes Traitées</CardTitle>
            <FileCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Total des requêtes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume des Ventes</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(reportData.totalSalesAmount)}</div>
            <p className="text-xs text-muted-foreground">Montant total des transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><BarChart className="mr-2 h-5 w-5 text-blue-500"/>Nouvelles Inscriptions</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart
              data={reportData.userRegistrations}
              dataKey="value"
              labelKey="name"
              barColorClass="bg-blue-500"
              title="Nouvelles inscriptions par mois"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChartIcon className="mr-2 h-5 w-5 text-orange-500"/>Statut des Parcelles</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.parcelStatus}
              title="Répartition par statut de parcelle"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><CalendarDays className="mr-2 h-5 w-5 text-red-500"/>Événements à Venir</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {reportData.upcomingEvents && reportData.upcomingEvents.length > 0 ? (
                reportData.upcomingEvents.map((event, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} - {event.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Aucun événement à venir.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart and Request Types */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><BarChart className="mr-2 h-5 w-5 text-gray-500"/>Ventes Mensuelles</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart data={reportData.monthlySales} dataKey="amount" labelKey="name" barColorClass="bg-green-500" title="Montant des ventes" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChartIcon className="mr-2 h-5 w-5 text-teal-500"/>Types de Demandes</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.requestTypes}
              title="Répartition par type de demande"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats par Acteur */}
      <h2 className="text-2xl font-bold text-primary mt-8 mb-4 flex items-center">
        <Activity className="h-7 w-7 mr-2 text-blue-600"/>
        Statistiques par Acteur
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card className="hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Store className="mr-2 h-4 w-4"/>Vendeurs</CardTitle>
       {/* Corrected path to include /dashboard prefix */}
       <Link to="/dashboard/admin/users?type=Vendeur"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actorStats.vendeur.parcellesListees} <span className="text-sm text-muted-foreground">parcelles listées</span></div>
            <p className="text-sm text-muted-foreground">{actorStats.vendeur.transactionsReussies} transactions réussies</p>
          </CardContent>
        </Card>
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><User className="mr-2 h-4 w-4"/>Particuliers</CardTitle>
      <Link to="/dashboard/admin/users?type=Particulier"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actorStats.particulier.demandesSoumises} <span className="text-sm text-muted-foreground">demandes soumises</span></div>
            <p className="text-sm text-muted-foreground">{actorStats.particulier.acquisitions} acquisitions</p>
          </CardContent>
        </Card>
  <Card className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Landmark className="mr-2 h-4 w-4"/>Mairies</CardTitle>
       <Link to="/dashboard/admin/users?type=Mairie"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.mairie.parcellesCommunales} <span className="text-sm text-muted-foreground">parcelles communales</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.mairie.demandesTraitees} demandes traitées</p>
          </CardContent>
        </Card>
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Banknote className="mr-2 h-4 w-4"/>Banques</CardTitle>
      <Link to="/dashboard/admin/users?type=Banque"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.banque.pretsAccordes} <span className="text-sm text-muted-foreground">prêts accordés</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.banque.garantiesEvaluees} garanties évaluées</p>
          </CardContent>
        </Card>
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Gavel className="mr-2 h-4 w-4"/>Notaires</CardTitle>
      <Link to="/dashboard/admin/users?type=Notaire"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.notaire.dossiersTraites} <span className="text-sm text-muted-foreground">dossiers traités</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.notaire.actesAuthentifies} actes authentifiés</p>
          </CardContent>
        </Card>
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><UserCheck className="mr-2 h-4 w-4"/>Agents</CardTitle>
      <Link to="/dashboard/admin/users?type=Agent"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.agent.clientsAssignes} <span className="text-sm text-muted-foreground">clients assignés</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.agent.visitesPlanifiees} visites planifiées</p>
          </CardContent>
        </Card>
      </div>

      {/* Assistant IA */}
      <AIAssistantWidget 
        dashboardContext={{
          role: 'admin',
          totalUsers: reportData.totalUsers,
          totalParcels: reportData.totalParcels,
          totalRequests: reportData.totalRequests,
          userStats: actorStats
        }}
        onAction={handleAIAction}
      />

      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>Données mises à jour en temps réel depuis la base de données Supabase.</p>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;
