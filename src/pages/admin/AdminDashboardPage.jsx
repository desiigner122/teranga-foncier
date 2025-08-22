// src/pages/admin/AdminDashboardPageNew.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users, MapPin, FileCheck, DollarSign, UserCheck, Activity, FileText, BarChart, CalendarDays,
  ShieldCheck, LandPlot, Building, Banknote, Leaf, TrendingUp, Scale, Gavel,
  Home, Store, LayoutDashboard, User, Landmark, Handshake, MessageSquare, PieChart as PieChartIcon,
  Settings, Bell, Database, Briefcase, TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';

// Quick Actions pour l'admin
const QUICK_ACTIONS = [
  {
    title: "Ajouter Utilisateur",
    description: "Créer un nouveau compte utilisateur",
    icon: User,
    href: "/dashboard/admin/users",
    color: "bg-blue-500"
  },
  {
    title: "Nouvelle Institution",
    description: "Enregistrer une nouvelle institution",
    icon: Building,
    href: "/dashboard/admin/institutions",
    color: "bg-green-500"
  },
  {
    title: "Voir Rapports",
    description: "Consulter les rapports détaillés",
    icon: BarChart,
    href: "/dashboard/admin/reports",
    color: "bg-purple-500"
  },
  {
    title: "Gérer Agents",
    description: "Administrer les agents",
    icon: UserCheck,
    href: "/dashboard/admin/agents",
    color: "bg-orange-500"
  }
];

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
    upcomingEvents: [],
    pendingSubmissions: 0
  });
  
  const [actorStats, setActorStats] = useState({
    agents: { assigned: 0, visits: 0 },
    users: { active: 0, verified: 0 },
    institutions: { registered: 0, active: 0 },
    parcels: { listed: 0, sold: 0 },
    transactions: { completed: 0, pending: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données du dashboard
  const location = useLocation();
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const metrics = await SupabaseDataService.getAdminDashboardMetrics();
      setReportData({
        totalUsers: metrics.totals.totalUsers,
        totalParcels: metrics.totals.totalParcels,
        totalRequests: metrics.totals.totalRequests,
        totalSalesAmount: metrics.totals.totalSalesAmount,
        userRegistrations: metrics.charts.userRegistrations,
        parcelStatus: metrics.charts.parcelStatus,
        upcomingEvents: metrics.upcomingEvents,
        pendingSubmissions: metrics.pendingSubmissions || 0
      });
      setActorStats(metrics.actorStats || {});
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAIAction = (action, data) => {
    console.log('Action IA:', action, data);
    toast({
      title: "Action IA",
      description: `Action ${action} exécutée avec succès`,
    });
  };

  useEffect(() => {
    loadDashboardData();
    // recharge à chaque navigation
  }, [loadDashboardData, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Administration
            {reportData.pendingSubmissions > 0 && (
              <span className="inline-flex items-center">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {reportData.pendingSubmissions} en validation
                </span>
              </span>
            )}
          </h1>
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
                <div className="text-2xl font-bold">{actorStats?.agents?.assigned ?? 0} <span className="text-sm text-muted-foreground">agents actifs</span></div>
                <p className="text-sm text-muted-foreground">{actorStats?.agents?.visits ?? 0} visites planifiées</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Users className="mr-2 h-4 w-4"/>Utilisateurs</CardTitle>
                <Link to="/dashboard/admin/users"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats?.users?.active ?? 0} <span className="text-sm text-muted-foreground">utilisateurs actifs</span></div>
                <p className="text-sm text-muted-foreground">{actorStats?.users?.verified ?? 0} vérifiés</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Building className="mr-2 h-4 w-4"/>Institutions</CardTitle>
                <Link to="/dashboard/admin/institutions"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats?.institutions?.registered ?? 0} <span className="text-sm text-muted-foreground">institutions</span></div>
                <p className="text-sm text-muted-foreground">{actorStats?.institutions?.active ?? 0} actives</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><LandPlot className="mr-2 h-4 w-4"/>Parcelles</CardTitle>
                <Link to="/dashboard/admin/parcels"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats?.parcels?.listed ?? 0} <span className="text-sm text-muted-foreground">disponibles</span></div>
                <p className="text-sm text-muted-foreground">{actorStats?.parcels?.sold ?? 0} vendues</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><DollarSign className="mr-2 h-4 w-4"/>Transactions</CardTitle>
                <Link to="/dashboard/admin/transactions"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actorStats?.transactions?.completed ?? 0} <span className="text-sm text-muted-foreground">complétées</span></div>
                <p className="text-sm text-muted-foreground">{actorStats?.transactions?.pending ?? 0} en attente</p>
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
