import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Calculator,
  Search,
  Briefcase,
  ClipboardList,
  BarChart3,
  FileText,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const InvestisseurDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    totalProperties: 0,
    averagePrice: 0,
    priceGrowth: 0,
    bestROI: 0,
    hotZones: []
  });
  const [portfolio, setPortfolio] = useState({
    totalInvestments: 0,
    currentValue: 0,
    totalROI: 0,
    monthlyReturn: 0,
    activeInvestments: []
  });
  const [opportunities, setOpportunities] = useState([]);

  // Données de démonstration pour les graphiques
  const priceEvolutionData = [
    { month: 'Jan', price: 2500000, growth: 2.1 },
    { month: 'Fév', price: 2580000, growth: 3.2 },
    { month: 'Mar', price: 2650000, growth: 2.7 },
    { month: 'Avr', price: 2720000, growth: 2.6 },
    { month: 'Mai', price: 2800000, growth: 2.9 },
    { month: 'Jun', price: 2890000, growth: 3.2 }
  ];

  const portfolioDistribution = [
    { name: 'Résidentiel', value: 45, color: '#3B82F6' },
    { name: 'Commercial', value: 30, color: '#10B981' },
    { name: 'Terrain', value: 20, color: '#F59E0B' },
    { name: 'Agricole', value: 5, color: '#EF4444' }
  ];

  const roiComparison = [
    { zone: 'Dakar Plateau', roi: 12.5, risk: 'Faible' },
    { zone: 'Almadies', roi: 15.2, risk: 'Modéré' },
    { zone: 'Rufisque', roi: 18.7, risk: 'Élevé' },
    { zone: 'Thiès', roi: 14.3, risk: 'Modéré' },
    { zone: 'Mbour', roi: 16.8, risk: 'Modéré' }
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les données du marché
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Récupérer les investissements de l'utilisateur
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*, properties(*)')
        .eq('investor_id', user.id);

      if (investmentsError) throw investmentsError;

      // Calculer les données du marché
      const totalProperties = properties?.length || 0;
      const averagePrice = totalProperties > 0 
        ? properties.reduce((sum, p) => sum + (p.price || 0), 0) / totalProperties 
        : 0;

      // Calculer les données du portfolio
      const totalInvestments = investments?.length || 0;
      const currentValue = investments?.reduce((sum, inv) => sum + (inv.current_value || 0), 0) || 0;
      const initialValue = investments?.reduce((sum, inv) => sum + (inv.initial_investment || 0), 0) || 0;
      const totalROI = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

      setMarketData({
        totalProperties,
        averagePrice,
        priceGrowth: 2.8, // Simulé
        bestROI: 18.7,
        hotZones: ['Dakar Plateau', 'Almadies', 'Rufisque']
      });

      setPortfolio({
        totalInvestments,
        currentValue,
        totalROI,
        monthlyReturn: 2.3, // Simulé
        activeInvestments: investments || []
      });

      // Opportunités récentes (simulées)
      setOpportunities([
        {
          id: 1,
          title: 'Terrain Commercial - Dakar Plateau',
          type: 'Terrain',
          price: 5000000,
          expectedROI: 15.2,
          risk: 'Modéré',
          location: 'Dakar Plateau'
        },
        {
          id: 2,
          title: 'Appartement - Almadies',
          type: 'Résidentiel',
          price: 12000000,
          expectedROI: 12.8,
          risk: 'Faible',
          location: 'Almadies'
        },
        {
          id: 3,
          title: 'Local Commercial - Rufisque',
          type: 'Commercial',
          price: 8500000,
          expectedROI: 18.5,
          risk: 'Élevé',
          location: 'Rufisque'
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRiskBadge = (risk) => {
    const riskConfig = {
      'Faible': { color: 'bg-green-100 text-green-800' },
      'Modéré': { color: 'bg-yellow-100 text-yellow-800' },
      'Élevé': { color: 'bg-red-100 text-red-800' }
    };
    
    const config = riskConfig[risk] || riskConfig['Modéré'];
    return <Badge className={config.color}>{risk}</Badge>;
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
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
            Dashboard Investisseur
          </h1>
          <p className="text-gray-600 mt-1">
            Analysez le marché et gérez vos investissements immobiliers
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard/investisseur/market-analysis')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyse de marché
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/investisseur/opportunities')}
          >
            <Search className="h-4 w-4 mr-2" />
            Opportunités
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur du Portfolio</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.currentValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(portfolio.totalROI)}
              <span className="ml-1">{formatPercentage(portfolio.totalROI)} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(portfolio.totalROI)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(portfolio.monthlyReturn)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investissements Actifs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.totalInvestments}</div>
            <p className="text-xs text-muted-foreground">
              Dans {portfolioDistribution.length} catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur ROI Marché</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(marketData.bestROI)}</div>
            <p className="text-xs text-muted-foreground">
              Zone: Rufisque
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des prix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution des Prix du Marché
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Prix moyen']}
                />
                <Bar dataKey="price" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution du portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribution du Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <PieChart data={portfolioDistribution} cx="50%" cy="50%" outerRadius={80}>
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieChart>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {portfolioDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparaison ROI par zone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              ROI par Zone Géographique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roiComparison.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{zone.zone}</h4>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(zone.risk)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPercentage(zone.roi)}
                    </div>
                    <p className="text-xs text-gray-500">ROI attendu</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunités d'investissement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Opportunités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.slice(0, 3).map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{opportunity.title}</h4>
                    <p className="text-xs text-gray-500">{opportunity.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{opportunity.type}</Badge>
                      {getRiskBadge(opportunity.risk)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(opportunity.price)}
                    </p>
                    <p className="text-xs text-green-600">
                      ROI: {formatPercentage(opportunity.expectedROI)}
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/investisseur/opportunities')}
              >
                Voir toutes les opportunités
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Outils d'Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/investisseur/roi-calculator')}
            >
              <Calculator className="h-6 w-6 mb-2" />
              Calculateur ROI
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/investisseur/market-analysis')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Analyse de Marché
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/investisseur/due-diligence')}
            >
              <ClipboardList className="h-6 w-6 mb-2" />
              Due Diligence
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/investisseur/investissements')}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              Mon Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestisseurDashboard;
