import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  LayoutDashboard, 
  Leaf,
  Tractor,
  Scale,
  CloudSun,
  BookOpen,
  Sprout,
  Droplets,
  Thermometer,
  Calendar,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AgriculteurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lands, setLands] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 65,
    rainfall: 12,
    forecast: 'Ensoleillé'
  });
  const [stats, setStats] = useState({
    totalLands: 0,
    totalArea: 0,
    activeCrops: 0,
    harvestReady: 0,
    soilQuality: 'Bon',
    irrigation: 85,
    productivity: 92,
    revenue: 0
  });

  // Données de démonstration
  const cropDistribution = [
    { name: 'Mil', area: 25, color: '#F59E0B', yield: 1200 },
    { name: 'Maïs', area: 20, color: '#10B981', yield: 950 },
    { name: 'Arachide', area: 15, color: '#3B82F6', yield: 800 },
    { name: 'Riz', area: 10, color: '#EF4444', yield: 1500 },
    { name: 'Légumes', area: 30, color: '#8B5CF6', yield: 2200 }
  ];

  const productivityData = [
    { month: 'Jan', mil: 120, mais: 95, arachide: 80 },
    { month: 'Fév', mil: 125, mais: 100, arachide: 85 },
    { month: 'Mar', mil: 130, mais: 110, arachide: 90 },
    { month: 'Avr', mil: 140, mais: 115, arachide: 95 },
    { month: 'Mai', mil: 135, mais: 120, arachide: 100 },
    { month: 'Jun', mil: 145, mais: 125, arachide: 105 }
  ];

  const soilAnalysisData = [
    { nutrient: 'Azote (N)', level: 78, optimal: 80, status: 'bon' },
    { nutrient: 'Phosphore (P)', level: 65, optimal: 70, status: 'moyen' },
    { nutrient: 'Potassium (K)', level: 85, optimal: 75, status: 'excellent' },
    { nutrient: 'pH', level: 6.8, optimal: 6.5, status: 'bon' },
    { nutrient: 'Matière org.', level: 3.2, optimal: 3.0, status: 'excellent' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'Plantation',
      crop: 'Maïs',
      area: '5 ha',
      date: '2024-01-15',
      status: 'Terminé'
    },
    {
      id: 2,
      type: 'Irrigation',
      crop: 'Légumes',
      area: '3 ha',
      date: '2024-01-14',
      status: 'En cours'
    },
    {
      id: 3,
      type: 'Fertilisation',
      crop: 'Arachide',
      area: '4 ha',
      date: '2024-01-12',
      status: 'Planifié'
    }
  ];

  const equipmentStatus = [
    { name: 'Tracteur John Deere', status: 'Opérationnel', maintenance: '2024-02-15' },
    { name: 'Système d\'irrigation', status: 'Maintenance', maintenance: '2024-01-18' },
    { name: 'Moissonneuse', status: 'Opérationnel', maintenance: '2024-03-01' },
    { name: 'Pulvérisateur', status: 'Opérationnel', maintenance: '2024-02-10' }
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les terres de l'agriculteur
      const { data: landsData, error: landsError } = await supabase
        .from('agricultural_lands')
        .select('*')
        .eq('farmer_id', user.id);

      if (landsError) throw landsError;

      // Récupérer les cultures actives
      const { data: cropsData, error: cropsError } = await supabase
        .from('crops')
        .select('*, agricultural_lands(*)')
        .eq('agricultural_lands.farmer_id', user.id)
        .eq('status', 'active');

      if (cropsError) throw cropsError;

      // Calculer les statistiques
      const totalLands = landsData?.length || 0;
      const totalArea = landsData?.reduce((sum, land) => sum + (land.area || 0), 0) || 0;
      const activeCrops = cropsData?.length || 0;
      const harvestReady = cropsData?.filter(crop => crop.growth_stage === 'harvest_ready').length || 0;

      setStats({
        totalLands,
        totalArea,
        activeCrops,
        harvestReady,
        soilQuality: 'Bon',
        irrigation: 85,
        productivity: 92,
        revenue: 25000000 // Simulé
      });

      setLands(landsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Utiliser les données de démonstration en cas d'erreur
      setStats({
        totalLands: 8,
        totalArea: 120,
        activeCrops: 15,
        harvestReady: 3,
        soilQuality: 'Bon',
        irrigation: 85,
        productivity: 92,
        revenue: 25000000
      });
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Opérationnel': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Maintenance': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'Panne': { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'Terminé': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: Activity },
      'Planifié': { color: 'bg-gray-100 text-gray-800', icon: Calendar }
    };
    
    const config = statusConfig[status] || statusConfig['Planifié'];
    return <Badge className={config.color}>{status}</Badge>;
  };

  const getSoilStatusColor = (nutrient) => {
    const level = nutrient.level;
    const optimal = nutrient.optimal;
    const ratio = level / optimal;
    
    if (ratio >= 0.9 && ratio <= 1.1) return 'text-green-600';
    if (ratio >= 0.7 && ratio <= 1.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWeatherIcon = (forecast) => {
    switch (forecast.toLowerCase()) {
      case 'ensoleillé':
        return <CloudSun className="h-8 w-8 text-yellow-500" />;
      case 'nuageux':
        return <CloudSun className="h-8 w-8 text-gray-500" />;
      case 'pluvieux':
        return <Droplets className="h-8 w-8 text-blue-500" />;
      default:
        return <CloudSun className="h-8 w-8 text-yellow-500" />;
    }
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
            Dashboard Agriculteur
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos terres agricoles et optimisez vos cultures
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard/agriculteur/weather')}
          >
            <CloudSun className="h-4 w-4 mr-2" />
            Météo & Climat
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/agriculteur/logbook')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Journal de Bord
          </Button>
        </div>
      </div>

      {/* Alerte météo */}
      <Alert>
        <CloudSun className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Conditions météorologiques favorables</strong>
              <p className="text-sm mt-1">
                Température idéale pour la croissance des cultures. Irrigation recommandée dans 2 jours.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <Thermometer className="h-4 w-4 mx-auto" />
                <span>{weatherData.temperature}°C</span>
              </div>
              <div className="text-center">
                <Droplets className="h-4 w-4 mx-auto" />
                <span>{weatherData.humidity}%</span>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Superficie Totale</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArea} ha</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLands} parcelles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultures Actives</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrops}</div>
            <p className="text-xs text-muted-foreground">
              {stats.harvestReady} prêtes à récolter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productivity}%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs année dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Annuels</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              Estimation 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des cultures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Répartition des Cultures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip formatter={(value) => [`${value} ha`, 'Surface']} />
                <PieChart data={cropDistribution} cx="50%" cy="50%" outerRadius={80}>
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieChart>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {cropDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name} ({item.area} ha)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productivité par culture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution de la Productivité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="mil" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Mil (kg/ha)"
                />
                <Line 
                  type="monotone" 
                  dataKey="mais" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Maïs (kg/ha)"
                />
                <Line 
                  type="monotone" 
                  dataKey="arachide" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Arachide (kg/ha)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyse du sol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Analyse du Sol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {soilAnalysisData.map((nutrient, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{nutrient.nutrient}</h4>
                    <p className="text-sm text-gray-500">
                      Optimal: {nutrient.optimal}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getSoilStatusColor(nutrient)}`}>
                      {nutrient.level}
                    </p>
                    <Badge 
                      className={
                        nutrient.status === 'excellent' ? 'bg-green-100 text-green-800' :
                        nutrient.status === 'bon' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {nutrient.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/agriculteur/soil-analysis')}
              >
                Analyse détaillée
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{activity.type}</h4>
                    <p className="text-sm text-gray-500">
                      {activity.crop} - {activity.area}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/agriculteur/logbook')}
              >
                Voir le journal complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statut de l'équipement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tractor className="h-5 w-5" />
            État de l'Équipement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipmentStatus.map((equipment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{equipment.name}</h4>
                  {getStatusBadge(equipment.status)}
                </div>
                <p className="text-xs text-gray-500">
                  Maintenance: {new Date(equipment.maintenance).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/agriculteur/equipment')}
          >
            Gérer l'équipement
          </Button>
        </CardContent>
      </Card>

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
              onClick={() => navigate('/dashboard/agriculteur/my-lands')}
            >
              <Leaf className="h-6 w-6 mb-2" />
              Mes Terres
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/agriculteur/soil-analysis')}
            >
              <Scale className="h-6 w-6 mb-2" />
              Analyse Sol
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/agriculteur/weather')}
            >
              <CloudSun className="h-6 w-6 mb-2" />
              Météo
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/agriculteur/equipment')}
            >
              <Tractor className="h-6 w-6 mb-2" />
              Équipement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgriculteurDashboard;
