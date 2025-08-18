import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
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
  Activity,
  Brain,
  Zap,
  Shield,
  Eye,
  Star,
  Beaker,
  Truck,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIAssistantWidget from '../../components/ui/AIAssistantWidget';
import AntiFraudDashboard from '../../components/ui/AntiFraudDashboard';
import LoadingSpinner from '../../components/ui/spinner';
import { hybridAI } from '../../lib/hybridAI';
import { antiFraudAI } from '../../lib/antiFraudAI';

const AgriculteurDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lands, setLands] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 65,
    rainfall: 12,
    forecast: 'Ensoleillé',
    windSpeed: 15,
    uvIndex: 8,
    soilMoisture: 45
  });
  const [stats, setStats] = useState({
    totalLands: 0,
    totalArea: 0,
    activeCrops: 0,
    harvestReady: 0,
    soilQuality: 'Bon',
    irrigation: 85,
    productivity: 92,
    revenue: 0,
    expenses: 0,
    profit: 0,
    waterUsage: 0
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState({
    carbonFootprint: 0,
    waterEfficiency: 0,
    biodiversityScore: 0,
    sustainabilityRating: 'A'
  });

  // Données de démonstration enrichies
  const cropDistribution = [
    { name: 'Mil', area: 25, color: '#F59E0B', yield: 1200, price: 450, revenue: 540000 },
    { name: 'Maïs', area: 20, color: '#10B981', yield: 950, price: 380, revenue: 361000 },
    { name: 'Arachide', area: 15, color: '#3B82F6', yield: 800, price: 650, revenue: 520000 },
    { name: 'Riz', area: 10, color: '#EF4444', yield: 1500, price: 420, revenue: 630000 },
    { name: 'Légumes', area: 30, color: '#8B5CF6', yield: 2200, price: 280, revenue: 616000 }
  ];

  const productivityData = [
    { month: 'Jan', mil: 120, mais: 95, arachide: 80, rainfall: 5, temperature: 26 },
    { month: 'Fév', mil: 125, mais: 100, arachide: 85, rainfall: 8, temperature: 28 },
    { month: 'Mar', mil: 130, mais: 110, arachide: 90, rainfall: 15, temperature: 30 },
    { month: 'Avr', mil: 140, mais: 115, arachide: 95, rainfall: 25, temperature: 32 },
    { month: 'Mai', mil: 135, mais: 120, arachide: 100, rainfall: 45, temperature: 31 },
    { month: 'Jun', mil: 145, mais: 125, arachide: 105, rainfall: 65, temperature: 29 }
  ];

  const soilAnalysisData = [
    { nutrient: 'Azote (N)', level: 78, optimal: 80, status: 'bon', trend: 2 },
    { nutrient: 'Phosphore (P)', level: 65, optimal: 70, status: 'moyen', trend: -5 },
    { nutrient: 'Potassium (K)', level: 85, optimal: 75, status: 'excellent', trend: 8 },
    { nutrient: 'pH', level: 6.8, optimal: 6.5, status: 'bon', trend: 0.2 },
    { nutrient: 'Matière org.', level: 3.2, optimal: 3.0, status: 'excellent', trend: 0.5 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'Plantation',
      crop: 'Maïs',
      area: '5 ha',
      date: '2024-01-15',
      status: 'Terminé',
      cost: 125000,
      duration: 3
    },
    {
      id: 2,
      type: 'Irrigation',
      crop: 'Légumes',
      area: '3 ha',
      date: '2024-01-14',
      status: 'En cours',
      cost: 45000,
      duration: 1
    },
    {
      id: 3,
      type: 'Fertilisation',
      crop: 'Arachide',
      area: '4 ha',
      date: '2024-01-12',
      status: 'Planifié',
      cost: 89000,
      duration: 2
    }
  ];

  const equipmentStatus = [
    { name: 'Tracteur John Deere', status: 'Opérationnel', maintenance: '2024-02-15', efficiency: 92, hours: 245 },
    { name: 'Système d\'irrigation', status: 'Maintenance', maintenance: '2024-01-18', efficiency: 78, hours: 1250 },
    { name: 'Moissonneuse', status: 'Opérationnel', maintenance: '2024-03-01', efficiency: 88, hours: 189 },
    { name: 'Pulvérisateur', status: 'Opérationnel', maintenance: '2024-02-10', efficiency: 95, hours: 156 }
  ];

  const marketAnalysis = [
    { crop: 'Mil', currentPrice: 450, weekChange: 5.2, monthChange: 12.8, demand: 'Élevée' },
    { crop: 'Maïs', currentPrice: 380, weekChange: -2.1, monthChange: 8.4, demand: 'Moyenne' },
    { crop: 'Arachide', currentPrice: 650, weekChange: 8.7, monthChange: 18.9, demand: 'Très Élevée' },
    { crop: 'Riz', currentPrice: 420, weekChange: 1.8, monthChange: 6.2, demand: 'Élevée' }
  ];

  const sustainabilityData = {
    waterEfficiency: 85,
    carbonReduction: 15,
    biodiversityIndex: 78,
    organicCertification: true,
    sustainablePractices: 12
  };

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
      generateAIInsights();
      fetchWeatherData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les terres de l'agriculteur avec détails complets
      const { data: landsData, error: landsError } = await supabase
        .from('agricultural_lands')
        .select(`
          *,
          crops(
            id,
            crop_type,
            planting_date,
            expected_harvest,
            growth_stage,
            yield_estimate,
            status
          ),
          soil_analyses(
            ph_level,
            nitrogen_level,
            phosphorus_level,
            potassium_level,
            organic_matter,
            analysis_date
          )
        `)
        .eq('farmer_id', user.id);

      if (landsError) throw landsError;

      // Récupérer les cultures actives avec détails
      const { data: cropsData, error: cropsError } = await supabase
        .from('crops')
        .select(`
          *,
          agricultural_lands(area, location),
          harvest_records(quantity, harvest_date, quality_grade)
        `)
        .eq('farmer_id', user.id)
        .eq('status', 'active');

      if (cropsError) throw cropsError;

      // Récupérer les équipements agricoles
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('agricultural_equipment')
        .select('*')
        .eq('owner_id', user.id);

      if (equipmentError) throw equipmentError;

      // Récupérer les données financières
      const { data: financialData, error: financialError } = await supabase
        .from('agricultural_finances')
        .select('*')
        .eq('farmer_id', user.id)
        .gte('transaction_date', new Date(new Date().getFullYear(), 0, 1).toISOString());

      if (financialError) throw financialError;

      // Récupérer les données météorologiques locales
      const { data: weatherHistoryData, error: weatherError } = await supabase
        .from('weather_data')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(30);

      if (weatherError) throw weatherError;

      // Calculer les statistiques avec données réelles
      const totalLands = landsData?.length || 0;
      const totalArea = landsData?.reduce((sum, land) => sum + (land.area || 0), 0) || 0;
      const activeCrops = cropsData?.length || 0;
      const harvestReady = cropsData?.filter(crop => crop.growth_stage === 'harvest_ready').length || 0;

      // Calculer revenus, dépenses et profits
      const revenue = financialData?.filter(f => f.transaction_type === 'income')
        ?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      const expenses = financialData?.filter(f => f.transaction_type === 'expense')
        ?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      const profit = revenue - expenses;

      // Calculer efficacité irrigation et usage eau
      const waterUsage = calculateWaterUsage(landsData, cropsData);
      const irrigationEfficiency = calculateIrrigationEfficiency(landsData, waterUsage);

      // Évaluer qualité du sol moyenne
      const avgSoilQuality = assessAverageSoilQuality(landsData);

      // Calculer productivité moyenne
      const productivity = calculateProductivity(cropsData, landsData);

      setStats({
        totalLands,
        totalArea,
        activeCrops,
        harvestReady,
        soilQuality: avgSoilQuality,
        irrigation: irrigationEfficiency,
        productivity,
        revenue,
        expenses,
        profit,
        waterUsage
      });

      setLands(landsData || []);

      // Analyser les données pour recommandations IA
      await analyzeCropRecommendations(landsData, cropsData, weatherHistoryData);
      
      // Récupérer prix du marché
      await fetchMarketPrices();

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback avec données de démonstration enrichies
      setStats({
        totalLands: 8,
        totalArea: 120,
        activeCrops: 15,
        harvestReady: 3,
        soilQuality: 'Bon',
        irrigation: 85,
        productivity: 92,
        revenue: 25000000,
        expenses: 15000000,
        profit: 10000000,
        waterUsage: 2450
      });

      setSustainabilityMetrics({
        carbonFootprint: 2.8,
        waterEfficiency: 85,
        biodiversityScore: 78,
        sustainabilityRating: 'A'
      });
    } finally {
      setLoading(false);
    }
  };

  // Récupérer données météorologiques en temps réel
  const fetchWeatherData = async () => {
    try {
      // En production, intégrer avec une API météo réelle
      // Pour la démo, utiliser données simulées enrichies
      const weatherAlerts = [];
      
      if (weatherData.temperature > 35) {
        weatherAlerts.push({
          type: 'heat',
          severity: 'high',
          message: 'Alerte canicule - Protection des cultures recommandée'
        });
      }
      
      if (weatherData.rainfall < 10) {
        weatherAlerts.push({
          type: 'drought',
          severity: 'medium',
          message: 'Niveau de précipitations faible - Irrigation nécessaire'
        });
      }

      setWeatherAlerts(weatherAlerts);
    } catch (error) {
      console.error('Erreur données météo:', error);
    }
  };

  // Générer recommandations de cultures avec IA
  const analyzeCropRecommendations = async (lands, crops, weather) => {
    try {
      const context = {
        landArea: lands?.reduce((sum, l) => sum + l.area, 0) || 0,
        currentCrops: crops?.map(c => c.crop_type) || [],
        soilTypes: lands?.map(l => l.soil_type) || [],
        climateData: weather?.slice(0, 7) || [], // 7 derniers jours
        season: getCurrentSeason()
      };

      const query = `En tant qu'expert agronome au Sénégal, analyse mes ${context.landArea} hectares de terres agricoles:
      - Cultures actuelles: ${context.currentCrops.join(', ')}
      - Types de sol: ${context.soilTypes.join(', ')}
      - Saison: ${context.season}
      
      Recommande 3 cultures optimales pour maximiser le rendement et la durabilité, en tenant compte du climat local et de la rotation des cultures.`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'agricultural_expert', 
        domain: 'crop_optimization',
        context: context
      });
      
      setCropRecommendations(response.suggestions || []);
    } catch (error) {
      console.error('Erreur recommandations IA:', error);
    }
  };

  // Générer insights IA pour l'agriculture
  const generateAIInsights = async () => {
    try {
      const context = {
        productivity: stats.productivity,
        profitMargin: stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0,
        waterEfficiency: sustainabilityMetrics.waterEfficiency,
        activeCrops: stats.activeCrops,
        totalArea: stats.totalArea
      };

      const query = `Analyse ma ferme agricole au Sénégal:
      - Productivité: ${context.productivity}%
      - Marge bénéficiaire: ${context.profitMargin.toFixed(1)}%
      - Efficacité hydrique: ${context.waterEfficiency}%
      - ${context.activeCrops} cultures sur ${context.totalArea} hectares
      
      Fournis 3 recommandations pour optimiser la production et 2 alertes importantes à surveiller.`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'agricultural_advisor', 
        domain: 'farm_optimization' 
      });
      
      setAiInsights(response);
    } catch (error) {
      console.error('Erreur génération insights IA:', error);
    }
  };

  // Récupérer prix du marché en temps réel
  const fetchMarketPrices = async () => {
    try {
      const { data: pricesData, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('price_date', { ascending: false })
        .limit(20);

      if (!error && pricesData) {
        setMarketPrices(pricesData);
      } else {
        // Fallback avec données simulées
        setMarketPrices(marketAnalysis);
      }
    } catch (error) {
      console.error('Erreur prix marché:', error);
      setMarketPrices(marketAnalysis);
    }
  };

  // Fonctions utilitaires
  const calculateWaterUsage = (lands, crops) => {
    // Calcul basé sur superficie et types de cultures
    return lands?.reduce((sum, land) => {
      const cropWaterNeed = crops?.filter(c => c.land_id === land.id)
        ?.reduce((cropSum, crop) => cropSum + getCropWaterNeed(crop.crop_type), 0) || 0;
      return sum + (land.area * cropWaterNeed);
    }, 0) || 2450; // Fallback
  };

  const calculateIrrigationEfficiency = (lands, waterUsage) => {
    // Efficacité basée sur systèmes d'irrigation et consommation
    const avgEfficiency = lands?.reduce((sum, land) => {
      const systemEfficiency = getIrrigationSystemEfficiency(land.irrigation_system);
      return sum + systemEfficiency;
    }, 0) || 0;
    return lands?.length > 0 ? avgEfficiency / lands.length : 85;
  };

  const assessAverageSoilQuality = (lands) => {
    if (!lands || lands.length === 0) return 'Bon';
    
    const qualityScores = lands.map(land => {
      const soilAnalysis = land.soil_analyses?.[0]; // Plus récente
      if (!soilAnalysis) return 3; // Score moyen
      
      let score = 0;
      if (soilAnalysis.ph_level >= 6.0 && soilAnalysis.ph_level <= 7.0) score += 1;
      if (soilAnalysis.nitrogen_level > 70) score += 1;
      if (soilAnalysis.phosphorus_level > 60) score += 1;
      if (soilAnalysis.potassium_level > 70) score += 1;
      if (soilAnalysis.organic_matter > 3.0) score += 1;
      
      return score;
    });
    
    const avgScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    if (avgScore >= 4) return 'Excellent';
    if (avgScore >= 3) return 'Bon';
    if (avgScore >= 2) return 'Moyen';
    return 'Faible';
  };

  const calculateProductivity = (crops, lands) => {
    if (!crops || crops.length === 0) return 92; // Fallback
    
    const totalProduction = crops.reduce((sum, crop) => {
      const landArea = crop.agricultural_lands?.area || 0;
      const yieldPerHa = crop.yield_estimate || 0;
      return sum + (landArea * yieldPerHa);
    }, 0);
    
    const totalPotential = lands?.reduce((sum, land) => {
      return sum + (land.area * getMaxYieldForSoil(land.soil_type));
    }, 0) || 1;
    
    return totalPotential > 0 ? (totalProduction / totalPotential) * 100 : 92;
  };

  const getCropWaterNeed = (cropType) => {
    const waterNeeds = {
      'mil': 0.8,
      'mais': 1.2,
      'arachide': 0.9,
      'riz': 2.5,
      'legumes': 1.5
    };
    return waterNeeds[cropType?.toLowerCase()] || 1.0;
  };

  const getIrrigationSystemEfficiency = (system) => {
    const efficiencies = {
      'drip': 95,
      'sprinkler': 85,
      'flood': 65,
      'none': 40
    };
    return efficiencies[system] || 70;
  };

  const getMaxYieldForSoil = (soilType) => {
    const maxYields = {
      'clay': 1500,
      'loam': 1800,
      'sandy': 1200,
      'silt': 1600
    };
    return maxYields[soilType] || 1400;
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 10) return 'Hivernage';
    return 'Saison sèche';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
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

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
  };

  const getMarketSentiment = (weekChange) => {
    if (weekChange > 5) return { text: 'Très positif', color: 'text-green-600' };
    if (weekChange > 0) return { text: 'Positif', color: 'text-blue-600' };
    if (weekChange > -5) return { text: 'Stable', color: 'text-gray-600' };
    return { text: 'Négatif', color: 'text-red-600' };
  };

  const getSustainabilityBadge = (rating) => {
    const ratingConfig = {
      'A': { color: 'bg-green-100 text-green-800' },
      'B': { color: 'bg-blue-100 text-blue-800' },
      'C': { color: 'bg-yellow-100 text-yellow-800' },
      'D': { color: 'bg-red-100 text-red-800' }
    };
    
    const config = ratingConfig[rating] || ratingConfig['C'];
    return <Badge className={config.color}>Durabilité {rating}</Badge>;
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'CROP_RECOMMENDATION':
        await analyzeCropRecommendations();
        break;
      case 'WEATHER_ANALYSIS':
        await fetchWeatherData();
        break;
      case 'MARKET_FORECAST':
        await fetchMarketPrices();
        break;
      default:
        console.log('Action IA:', actionType, result);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Tableau de Bord Agriculteur
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Gérez vos exploitations avec des insights IA avancés et un suivi en temps réel
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Revenus Totaux",
              value: formatCurrency(dashboardData.totalRevenue),
              change: dashboardData.revenueGrowth,
              icon: TrendingUp,
              color: "from-green-500 to-emerald-600"
            },
            {
              title: "Surface Cultivée",
              value: `${formatNumber(dashboardData.totalArea)} ha`,
              change: dashboardData.areaGrowth,
              icon: TreePine,
              color: "from-blue-500 to-cyan-600"
            },
            {
              title: "Rendement Moyen",
              value: `${dashboardData.averageYield} T/ha`,
              change: dashboardData.yieldGrowth,
              icon: BarChart3,
              color: "from-purple-500 to-pink-600"
            },
            {
              title: "Durabilité",
              value: dashboardData.sustainabilityScore,
              change: dashboardData.sustainabilityGrowth,
              icon: Leaf,
              color: "from-emerald-500 to-green-600"
            }
          ].map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                <div className={`absolute inset-0 bg-gradient-to-r ${kpi.color} opacity-5`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <div className="flex items-center mt-2">
                        {getTrendIcon(kpi.change)}
                        <span className={`text-sm ml-1 ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(kpi.change)}% ce mois
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${kpi.color}`}>
                      <kpi.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weather and AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5" />
                  Conditions Météorologiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {dashboardData.weatherData.map((day, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      {getWeatherIcon(day.forecast)}
                      <p className="font-medium mt-2">{day.day}</p>
                      <p className="text-sm text-gray-600">{day.forecast}</p>
                      <p className="text-lg font-bold">{day.temperature}°C</p>
                      <p className="text-xs text-blue-600">{day.rainfall}mm</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.aiInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <insight.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <p className="text-xs text-blue-600 mt-2">Confiance: {insight.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Crops Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Gestion des Cultures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.crops.map((crop, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                      {getStatusBadge(crop.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Surface:</span>
                        <span className="text-sm font-medium">{crop.area} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rendement prévu:</span>
                        <span className="text-sm font-medium">{crop.expectedYield} T/ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valeur estimée:</span>
                        <span className="text-sm font-medium">{formatCurrency(crop.estimatedValue)}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progression</span>
                          <span>{crop.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${crop.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Soil Analysis & Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soil Analysis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Analyse du Sol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.soilAnalysis.map((nutrient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <nutrient.icon className={`h-5 w-5 ${getSoilStatusColor(nutrient)}`} />
                        <div>
                          <p className="font-medium">{nutrient.name}</p>
                          <p className="text-sm text-gray-600">Optimal: {nutrient.optimal} ppm</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getSoilStatusColor(nutrient)}`}>
                          {nutrient.level} ppm
                        </p>
                        <p className="text-xs text-gray-500">{nutrient.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Equipment Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  État des Équipements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(item.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          Dernière maintenance: {item.lastMaintenance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Market Prices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Prix du Marché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.marketPrices.map((product, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {getTrendIcon(product.weekChange)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(product.currentPrice)}
                      </p>
                      <p className="text-sm text-gray-600">par tonne</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">7 jours:</span>
                        <span className={`text-xs font-medium ${product.weekChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.weekChange > 0 ? '+' : ''}{formatPercentage(product.weekChange)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs ${getMarketSentiment(product.weekChange).color}`}>
                          {getMarketSentiment(product.weekChange).text}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sustainability Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Métriques de Durabilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.sustainabilityMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                    <metric.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">{metric.name}</h3>
                    <p className="text-2xl font-bold text-green-600">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.unit}</p>
                    {getSustainabilityBadge(metric.rating)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Chatbot Integration */}
        <GlobalChatbot 
          onActionRequest={handleAIAction}
          contextData={{
            userType: 'agriculteur',
            dashboardData: dashboardData,
            currentWeather: dashboardData.weatherData[0],
            marketTrends: dashboardData.marketPrices
          }}
        />
      </div>
    </div>
  );
};

export default AgriculteurDashboard;
