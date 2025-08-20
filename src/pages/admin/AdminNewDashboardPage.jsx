// src/pages/admin/AdminNewDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users, MapPin, FileCheck, DollarSign, UserCheck, Activity, FileText, BarChart, CalendarDays,
  LandPlot, Building, Banknote, Leaf, TrendingUp, Scale, Gavel,
  Home, Store, LayoutDashboard, User, Landmark, Handshake, MessageSquare, PieChart as PieChartIcon,
  Settings, Bell, Database, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';

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
    href: "/dashboard/admin/users",
    color: "bg-green-500"
  },
  {
    title: "Voir Transactions",
    description: "Consulter les transactions",
    icon: DollarSign,
    href: "/dashboard/admin/transactions",
    color: "bg-purple-500"
  },
  {
    title: "Gérer Parcelles",
    description: "Administrer les parcelles",
    icon: LandPlot,
    href: "/dashboard/admin/parcels",
    color: "bg-orange-500"
  }
];

// Composant de graphique à barres simple (réutilisable)
const SimpleBarChart = ({ data, dataKey, labelKey, barColor="#3b82f6", title, formatter = value => value }) => {
  return (
    <div className="h-[250px] w-full">
      <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip formatter={formatter} />
          <Legend />
          <Bar dataKey={dataKey} fill={barColor} />
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
          <Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit || ''}`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminNewDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totals: {
      totalUsers: 0,
      totalParcels: 0,
      totalRequests: 0,
      totalSalesAmount: 0
    },
    charts: {
      userRegistrations: [],
      parcelStatus: [],
      requestTypes: [],
      monthlySales: []
    },
    actorStats: {
      vendeur: {},
      particulier: {},
      mairie: {},
      banque: {},
      notaire: {},
      agent: {}
    },
    upcomingEvents: []
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Appeler la fonction centralisée pour obtenir les données du dashboard
      const metrics = await SupabaseDataService.getAdminDashboardMetrics();
      
      // Si nous n'avons pas reçu de données, utiliser des données fictives
      if (!metrics) {
        throw new Error("Données non disponibles");
      }
      
      // Mettre à jour l'état avec les données réelles
      setDashboardData(metrics);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
      
      // Créer des données simulées en cas d'erreur
      setDashboardData({
        totals: {
          totalUsers: 345,
          totalParcels: 178,
          totalRequests: 96,
          totalSalesAmount: 256789000
        },
        charts: {
          userRegistrations: [
            { name: 'Jan', value: 12 },
            { name: 'Fév', value: 19 },
            { name: 'Mar', value: 15 },
            { name: 'Avr', value: 25 },
            { name: 'Mai', value: 22 },
            { name: 'Jun', value: 30 }
          ],
          parcelStatus: [
            { name: 'Disponible', value: 107, unit: 'parcelles' },
            { name: 'Vendu', value: 45, unit: 'parcelles' },
            { name: 'En Attente', value: 26, unit: 'parcelles' }
          ],
          requestTypes: [
            { name: 'Achat', value: 45, unit: 'demandes' },
            { name: 'Information', value: 32, unit: 'demandes' },
            { name: 'Permis', value: 19, unit: 'demandes' }
          ],
          monthlySales: [
            { name: 'Jan', amount: 25000000 },
            { name: 'Fév', amount: 34500000 },
            { name: 'Mar', amount: 28900000 },
            { name: 'Avr', amount: 41200000 },
            { name: 'Mai', amount: 32800000 },
            { name: 'Jun', amount: 45700000 }
          ]
        },
        actorStats: {
          vendeur: {
            parcellesListees: 87,
            transactionsReussies: 34
          },
          particulier: {
            demandesSoumises: 76,
            acquisitions: 45
          },
          mairie: {
            parcellesCommunales: 32,
            demandesTraitees: 28
          },
          banque: {
            pretsAccordes: 19,
            garantiesEvaluees: 14
          },
          notaire: {
            dossiersTraites: 56,
            actesAuthentifies: 43
          },
          agent: {
            clientsAssignes: 103,
            visitesPlanifiees: 38
          }
        },
        upcomingEvents: [
          { title: "Réunion mensuelle", date: "2025-08-15", time: "10:00" },
          { title: "Audit sécurité", date: "2025-08-20", time: "14:00" },
          { title: "Formation équipe", date: "2025-08-27", time: "09:00" }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Formatage des montants
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-SN', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">Gestion et supervision de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
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
            <div className="text-2xl font-bold">{dashboardData.totals.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Tous les utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelles</CardTitle>
            <LandPlot className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totals.totalParcels}</div>
            <p className="text-xs text-muted-foreground">
              Total des parcelles enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes</CardTitle>
            <FileCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totals.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Total des requêtes en cours
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume des Ventes</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(dashboardData.totals.totalSalesAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Montant total des transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <BarChart className="mr-2 h-5 w-5 text-blue-500"/>
              Inscriptions Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={dashboardData.charts.userRegistrations}
              dataKey="value"
              labelKey="name"
              barColor="#3b82f6"
              title="Nouvelles inscriptions par mois"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <DollarSign className="mr-2 h-5 w-5 text-green-500"/>
              Chiffre d'Affaires Mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={dashboardData.charts.monthlySales}
              dataKey="amount"
              labelKey="name"
              barColor="#22c55e"
              title="Ventes par mois"
              formatter={(value) => formatAmount(value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <PieChartIcon className="mr-2 h-5 w-5 text-orange-500"/>
              Statut des Parcelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart
              data={dashboardData.charts.parcelStatus}
              title="Répartition par statut"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FileCheck className="mr-2 h-5 w-5 text-purple-500"/>
              Types de Demandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart
              data={dashboardData.charts.requestTypes}
              title="Répartition par type"
            />
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par acteur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Performance par Type d'Acteur
          </CardTitle>
          <CardDescription>
            Statistiques détaillées pour chaque type d'utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <Home className="h-4 w-4 mr-2 text-green-600" />
                Vendeurs
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Parcelles listées</span>
                  <span className="font-semibold">{dashboardData.actorStats.vendeur.parcellesListees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transactions réussies</span>
                  <span className="font-semibold">{dashboardData.actorStats.vendeur.transactionsReussies}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Particuliers
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Demandes soumises</span>
                  <span className="font-semibold">{dashboardData.actorStats.particulier.demandesSoumises}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Acquisitions</span>
                  <span className="font-semibold">{dashboardData.actorStats.particulier.acquisitions}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-orange-600" />
                Mairies
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Parcelles communales</span>
                  <span className="font-semibold">{dashboardData.actorStats.mairie.parcellesCommunales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Demandes traitées</span>
                  <span className="font-semibold">{dashboardData.actorStats.mairie.demandesTraitees}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <Landmark className="h-4 w-4 mr-2 text-blue-800" />
                Banques
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Prêts accordés</span>
                  <span className="font-semibold">{dashboardData.actorStats.banque.pretsAccordes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Garanties évaluées</span>
                  <span className="font-semibold">{dashboardData.actorStats.banque.garantiesEvaluees}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <Gavel className="h-4 w-4 mr-2 text-purple-700" />
                Notaires
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Dossiers traités</span>
                  <span className="font-semibold">{dashboardData.actorStats.notaire.dossiersTraites}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Actes authentifiés</span>
                  <span className="font-semibold">{dashboardData.actorStats.notaire.actesAuthentifies}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center text-sm">
                <UserCheck className="h-4 w-4 mr-2 text-teal-600" />
                Agents
              </h3>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Clients assignés</span>
                  <span className="font-semibold">{dashboardData.actorStats.agent.clientsAssignes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Visites planifiées</span>
                  <span className="font-semibold">{dashboardData.actorStats.agent.visitesPlanifiees}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Événements à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <CalendarDays className="mr-2 h-5 w-5 text-red-500"/>
            Événements à Venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
              dashboardData.upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50">
                    Planifié
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Aucun événement planifié
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-muted-foreground text-sm">
        <p>
          Dernière actualisation: {new Date().toLocaleString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default AdminNewDashboardPage;
