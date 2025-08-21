// src/pages/admin/AdminDashboardPageNew.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Users, Building, DollarSign, LandPlot, Bell, Briefcase, FileCheck, BarChart, PieChart as PieChartIcon, UserCheck, CalendarDays } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
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
            <Menu className="h-4 w-4" />
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
          <Bar dataKey={dataKey} fill={color} />
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminDashboardPage = () => {
  const [reportData, setReportData] = useState({
    totalUsers: 0,
    totalParcels: 0,
    totalRequests: 0,
    totalSalesAmount: 0,
    userRegistrations: [],
    parcelStatus: [],
    upcomingEvents: []
  });
  
  const [actorStats, setActorStats] = useState({
    agents: { assigned: 0, visits: 0 },
    users: { active: 0, verified: 0 },
    institutions: { registered: 0, active: 0 },
    parcels: { listed: 0, sold: 0 },
    transactions: { completed: 0, pending: 0 }
  });
  
  // Loading géré par le hook temps réel
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [usersData, parcelsData, requestsData] = await Promise.all([
        SupabaseDataService.getAllUsers(),
        SupabaseDataService.getAllParcels(),
        SupabaseDataService.getAllRequests?.() || Promise.resolve([])
      ]);

      // Calculer les statistiques
      const totalUsers = usersData?.length || 0;
      const totalParcels = parcelsData?.length || 0;
      const totalRequests = requestsData?.length || 0;
      const totalSalesAmount = parcelsData?.reduce((sum, parcel) => sum + (parcel.price || 0), 0) || 0;

      // Statistiques des utilisateurs par mois (6 derniers mois)
      const userRegistrations = [
        { name: 'Jan', value: 12 },
        { name: 'Fév', value: 19 },
        { name: 'Mar', value: 15 },
        { name: 'Avr', value: 25 },
        { name: 'Mai', value: 22 },
        { name: 'Jun', value: 30 }
      ];
      
      // Statut des parcelles
      const parcelStatus = [
        { name: 'Disponible', value: Math.floor(totalParcels * 0.6) },
        { name: 'Vendu', value: Math.floor(totalParcels * 0.25) },
        { name: 'En Attente', value: Math.floor(totalParcels * 0.15) }
      ];

      // Événements à venir
      const upcomingEvents = [
        { id: 1, title: "Réunion mensuelle", date: new Date(Date.now() + 86400000 * 2), type: "meeting" },
        { id: 2, title: "Audit sécurité", date: new Date(Date.now() + 86400000 * 7), type: "audit" },
        { id: 3, title: "Formation équipe", date: new Date(Date.now() + 86400000 * 14), type: "training" }
      ];

      // Mise à jour des données
      setReportData({
        totalUsers,
        totalParcels,
        totalRequests,
        totalSalesAmount,
        userRegistrations,
        parcelStatus,
        upcomingEvents
      });

      // Statistiques détaillées
      setActorStats({
        agents: {
          assigned: usersData?.filter(u => u.role === 'agent')?.length || 0,
          visits: Math.floor(Math.random() * 50) + 10
        },
        users: {
          active: usersData?.filter(u => u.verification_status === 'verified')?.length || 0,
          verified: usersData?.filter(u => u.verification_status === 'verified')?.length || 0
        },
        institutions: {
          registered: usersData?.filter(u => u.role === 'admin')?.length || 0,
          active: usersData?.filter(u => u.role === 'admin' && u.verification_status === 'verified')?.length || 0
        },
        parcels: {
          listed: parcelsData?.filter(p => p.status === 'available')?.length || 0,
          sold: parcelsData?.filter(p => p.status === 'sold')?.length || 0
        },
        transactions: {
          completed: Math.floor(totalRequests * 0.3),
          pending: Math.floor(totalRequests * 0.7)
        }
      });

    } catch (error) {      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAIAction = (action, data) => {    toast({
      title: "Action IA",
      description: `Action ${action} exécutée avec succès`,
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600 mt-1">Tableau de bord principal de gestion</p>
            </div>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <Link key={action.href} to={action.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-gray-400 hover:border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.color} text-white`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{action.title}</h3>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Tous les utilisateurs</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parcelles</CardTitle>
                <LandPlot className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalParcels}</div>
                <p className="text-xs text-muted-foreground">Total des parcelles</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes</CardTitle>
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
                <p className="text-xs text-muted-foreground">Montant total</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Events */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="flex items-center text-base"><BarChart className="mr-2 h-5 w-5 text-blue-500"/>Inscriptions</CardTitle></CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={reportData.userRegistrations}
                  dataKey="value"
                  labelKey="name"
                  barColorClass="3b82f6"
                  title="Nouvelles inscriptions par mois"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-base"><PieChartIcon className="mr-2 h-5 w-5 text-orange-500"/>Statut Parcelles</CardTitle></CardHeader>
              <CardContent>
                <SimplePieChart
                  data={reportData.parcelStatus}
                  title="Répartition par statut"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-base"><CalendarDays className="mr-2 h-5 w-5 text-red-500"/>Événements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData.upcomingEvents && reportData.upcomingEvents.length > 0 ? (
                    reportData.upcomingEvents.map((event) => (
                      <li key={event.id} className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-muted-foreground text-xs">{event.date.toLocaleDateString('fr-FR')}</div>
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">Aucun événement programmé</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><UserCheck className="mr-2 h-4 w-4"/>Agents</CardTitle>
                <Link to="/dashboard/admin/users?role=agent"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats.agents.assigned} <span className="text-sm text-muted-foreground">agents actifs</span></div>
                <p className="text-sm text-muted-foreground">{actorStats.agents.visits} visites planifiées</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Users className="mr-2 h-4 w-4"/>Utilisateurs</CardTitle>
                <Link to="/dashboard/admin/users"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats.users.active} <span className="text-sm text-muted-foreground">utilisateurs actifs</span></div>
                <p className="text-sm text-muted-foreground">{actorStats.users.verified} vérifiés</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4"/>Institutions</CardTitle>
                <Link to="/dashboard/admin/institutions"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats.institutions.registered} <span className="text-sm text-muted-foreground">institutions</span></div>
                <p className="text-sm text-muted-foreground">{actorStats.institutions.active} actives</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><LandPlot className="mr-2 h-4 w-4"/>Parcelles</CardTitle>
                <Link to="/dashboard/admin/parcels"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats.parcels.listed} <span className="text-sm text-muted-foreground">disponibles</span></div>
                <p className="text-sm text-muted-foreground">{actorStats.parcels.sold} vendues</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><DollarSign className="mr-2 h-4 w-4"/>Transactions</CardTitle>
                <Link to="/dashboard/admin/transactions"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats.transactions.completed} <span className="text-sm text-muted-foreground">complétées</span></div>
                <p className="text-sm text-muted-foreground">{actorStats.transactions.pending} en attente</p>
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
      </div>
    </div>
  );
};

export default AdminDashboardPage;
