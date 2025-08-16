import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  LayoutDashboard, 
  Building,
  ClipboardList,
  DollarSign,
  Users,
  Calendar,
  Wrench,
  FileText,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Target,
  PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const PromoteurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    averageMargin: 0,
    totalUnits: 0,
    soldUnits: 0,
    pendingSales: 0
  });

  // Données de démonstration
  const projectStatusData = [
    { status: 'Planification', count: 3, color: '#F59E0B' },
    { status: 'En cours', count: 5, color: '#3B82F6' },
    { status: 'Livraison', count: 2, color: '#10B981' },
    { status: 'Terminé', count: 8, color: '#6B7280' }
  ];

  const salesProgressData = [
    { month: 'Jan', vendu: 12, prevision: 15 },
    { month: 'Fév', vendu: 18, prevision: 20 },
    { month: 'Mar', vendu: 22, prevision: 25 },
    { month: 'Avr', vendu: 28, prevision: 30 },
    { month: 'Mai', vendu: 35, prevision: 35 },
    { month: 'Jun', vendu: 42, prevision: 40 }
  ];

  const revenueByProjectType = [
    { type: 'Résidentiel', revenue: 2500000000, margin: 18.5 },
    { type: 'Commercial', revenue: 1800000000, margin: 22.3 },
    { type: 'Mixte', revenue: 3200000000, margin: 16.8 },
    { type: 'Luxe', revenue: 1200000000, margin: 25.2 }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Résidence Les Almadies',
      type: 'Résidentiel',
      status: 'En cours',
      progress: 65,
      totalUnits: 48,
      soldUnits: 32,
      budget: 2400000000,
      location: 'Almadies, Dakar',
      completion_date: '2024-12-15'
    },
    {
      id: 2,
      name: 'Centre Commercial Plateau',
      type: 'Commercial',
      status: 'Planification',
      progress: 15,
      totalUnits: 24,
      soldUnits: 8,
      budget: 1800000000,
      location: 'Plateau, Dakar',
      completion_date: '2025-06-30'
    },
    {
      id: 3,
      name: 'Villa Premium Saly',
      type: 'Luxe',
      status: 'Livraison',
      progress: 90,
      totalUnits: 12,
      soldUnits: 11,
      budget: 960000000,
      location: 'Saly, Mbour',
      completion_date: '2024-08-30'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les projets du promoteur
      const { data: projectsData, error: projectsError } = await supabase
        .from('development_projects')
        .select('*')
        .eq('developer_id', user.id);

      if (projectsError) throw projectsError;

      // Récupérer les ventes liées aux projets
      const { data: salesData, error: salesError } = await supabase
        .from('project_sales')
        .select('*, development_projects(*)')
        .eq('development_projects.developer_id', user.id);

      if (salesError) throw salesError;

      // Calculer les statistiques
      const totalProjects = projectsData?.length || 0;
      const activeProjects = projectsData?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      const totalUnits = projectsData?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;
      const soldUnits = salesData?.length || 0;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue,
        averageMargin: 19.2, // Simulé
        totalUnits,
        soldUnits,
        pendingSales: Math.floor(soldUnits * 0.1) // Simulé
      });

      setProjects(projectsData || recentProjects);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données de démonstration
      setStats({
        totalProjects: 18,
        activeProjects: 7,
        completedProjects: 8,
        totalRevenue: 8700000000,
        averageMargin: 19.2,
        totalUnits: 156,
        soldUnits: 128,
        pendingSales: 12
      });
      setProjects(recentProjects);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Planification': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'Livraison': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Terminé': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      'active': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'completed': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Planification'];
    return <Badge className={config.color}>{status}</Badge>;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Dashboard Promoteur
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos projets immobiliers et suivez vos performances
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard/promoteur/construction-tracking')}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Suivi Construction
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/promoteur/projects')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Totaux</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Marge moy: {formatPercentage(stats.averageMargin)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unités Vendues</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldUnits}/{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((stats.soldUnits / stats.totalUnits) * 100)} de réussite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes en Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSales}</div>
            <p className="text-xs text-muted-foreground">
              À finaliser
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progression des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progression des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="vendu" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Vendu"
                />
                <Line 
                  type="monotone" 
                  dataKey="prevision" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Prévision"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statut des projets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Répartition par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <PieChart data={projectStatusData} cx="50%" cy="50%" outerRadius={80}>
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieChart>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {projectStatusData.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.status} ({item.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Projets en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Unités vendues</p>
                      <p className="font-semibold">{project.soldUnits}/{project.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-semibold">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/promoteur/projects')}
              >
                Voir tous les projets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenus par type de projet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance par Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByProjectType.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{type.type}</h4>
                    <p className="text-sm text-gray-500">
                      Marge: {formatPercentage(type.margin)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(type.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">Revenus totaux</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/promoteur/projects')}
            >
              <Plus className="h-6 w-6 mb-2" />
              Nouveau Projet
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/promoteur/construction-tracking')}
            >
              <ClipboardList className="h-6 w-6 mb-2" />
              Suivi Construction
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/promoteur/sales')}
            >
              <Users className="h-6 w-6 mb-2" />
              Gestion Ventes
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/transactions')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Finances
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoteurDashboard;
