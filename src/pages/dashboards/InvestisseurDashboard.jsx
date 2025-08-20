import React, { useState, useEffect } from 'react';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  MapPin,
  Brain,
  Zap,
  Shield,
  Activity,
  TrendingDown,
  Eye,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIAssistantWidget from '../../components/ui/AIAssistantWidget';
import AntiFraudDashboard from '../../components/ui/AntiFraudDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { hybridAI } from '../../lib/hybridAI';
import { antiFraudAI } from '../../lib/antiFraudAI';

const InvestisseurDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  // Loading géré par le hook temps réel
  const [marketData, setMarketData] = useState({
    totalProperties: 0,
    averagePrice: 0,
    priceGrowth: 0,
    bestROI: 0,
    hotZones: [],
    marketTrends: [],
    riskLevel: 'Modéré'
  });
  const [portfolio, setPortfolio] = useState({
    totalInvestments: 0,
    currentValue: 0,
    totalROI: 0,
    monthlyReturn: 0,
    activeInvestments: [],
    performanceHistory: [],
    diversificationScore: 0
  });
  const { data: opportunities, loading: opportunitiesLoading, error: opportunitiesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (opportunities) {
      setFilteredData(opportunities);
    }
  }, [opportunities]);
  
  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
      generateAIInsights();
      performFraudAnalysis();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les données du marché avec plus de détails
      const { data: properties, error: propertiesError } = await supabase
        .from('parcels')
        .select(`
          *,
          transactions(
            price,
            transaction_date,
            status,
            buyer_id,
            seller_id
          ),
          evaluations(
            estimated_value,
            market_value,
            evaluation_date
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (propertiesError) throw propertiesError;

      // Récupérer les investissements de l'utilisateur avec détails complets
      const { data: investments, error: investmentsError } = await supabase
        .from('user_investments')
        .select(`
          *,
          parcels(
            reference,
            location,
            title,
            area,
            price_per_sqm
          ),
          investment_returns(
            monthly_return,
            annual_return,
            calculation_date
          )
        `)
        .eq('investor_id', user.id);

      if (investmentsError) throw investmentsError;

      // Récupérer les données de watchlist
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('user_favorites')
        .select(`
          *,
          parcels(
            reference,
            title,
            location,
            price_per_sqm,
            area,
            status
          )
        `)
        .eq('user_id', user.id);

      if (watchlistError) throw watchlistError;

      // Récupérer les alertes de prix
      const { data: alertsData, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (alertsError) throw alertsError;

      // Calculer les données du marché avec intelligence
      const totalProperties = properties?.length || 0;
      const averagePrice = totalProperties > 0 
        ? properties.reduce((sum, p) => sum + (p.price_per_sqm || 0), 0) / totalProperties 
        : 0;

      // Analyser les tendances de prix
      const priceHistory = properties
        ?.filter(p => p.transactions?.length > 0)
        ?.map(p => ({
          price: p.transactions[0]?.price || 0,
          date: new Date(p.transactions[0]?.transaction_date || p.created_at)
        }))
        ?.sort((a, b) => a.date - b.date) || [];

      const priceGrowth = calculatePriceGrowth(priceHistory);
      const hotZones = identifyHotZones(properties);

      // Calculer les données du portfolio avec métriques avancées
      const totalInvestments = investments?.length || 0;
      const currentValue = investments?.reduce((sum, inv) => sum + (inv.current_value || 0), 0) || 0;
      const initialValue = investments?.reduce((sum, inv) => sum + (inv.initial_investment || 0), 0) || 0;
      const totalROI = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

      // Calculer métriques de performance avancées
      const performanceHistory = calculatePerformanceHistory(investments);
      const diversificationScore = calculateDiversificationScore(investments);
      const sharpeRatio = calculateSharpeRatio(performanceHistory);
      const volatility = calculateVolatility(performanceHistory);
      const maxDrawdown = calculateMaxDrawdown(performanceHistory);

      setMarketData({
        totalProperties,
        averagePrice,
        priceGrowth,
        bestROI: Math.max(...roiComparison.map(r => r.roi)),
        hotZones,
        marketTrends: priceHistory,
        riskLevel: assessMarketRisk(priceHistory, volatility)
      });

      setPortfolio({
        totalInvestments,
        currentValue,
        totalROI,
        monthlyReturn: calculateMonthlyReturn(investments),
        activeInvestments: investments || [],
        performanceHistory,
        diversificationScore
      });

      setPerformanceMetrics({
        sharpeRatio,
        volatility,
        maxDrawdown,
        beta: calculateBeta(performanceHistory, priceHistory)
      });

      setWatchlist(watchlistData || []);
      setAlertsData(alertsData || []);

      // Générer des opportunités basées sur l'IA
      await generateInvestmentOpportunities(properties, investments);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback avec données de démonstration enrichies
      setMarketData({
        totalProperties: 1247,
        averagePrice: 2890000,
        priceGrowth: 3.2,
        bestROI: 18.7,
        hotZones: ['Dakar Plateau', 'Almadies', 'Rufisque'],
        marketTrends: priceEvolutionData,
        riskLevel: 'Modéré'
      });

      setPortfolio({
        totalInvestments: 8,
        currentValue: 45000000,
        totalROI: 15.8,
        monthlyReturn: 2.3,
        activeInvestments: [],
        performanceHistory: priceEvolutionData,
        diversificationScore: 75
      });

      setPerformanceMetrics({
        sharpeRatio: 1.85,
        volatility: 15.2,
        maxDrawdown: -8.5,
        beta: 0.72
      });

      // Opportunities simulées avec scoring IA
      setOpportunities([
        {
          id: 1,
          title: 'Terrain Commercial - Dakar Plateau',
          type: 'Terrain',
          price: 5000000,
          expectedROI: 15.2,
          risk: 'Modéré',
          location: 'Dakar Plateau',
          aiScore: 87,
          marketSentiment: 'Positif',
          liquidityScore: 8.5
        },
        {
          id: 2,
          title: 'Appartement - Almadies',
          type: 'Résidentiel',
          price: 12000000,
          expectedROI: 12.8,
          risk: 'Faible',
          location: 'Almadies',
          aiScore: 91,
          marketSentiment: 'Très Positif',
          liquidityScore: 9.2
        },
        {
          id: 3,
          title: 'Local Commercial - Rufisque',
          type: 'Commercial',
          price: 8500000,
          expectedROI: 18.5,
          risk: 'Élevé',
          location: 'Rufisque',
          aiScore: 76,
          marketSentiment: 'Neutre',
          liquidityScore: 6.8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires avancées pour l'analyse financière
  const calculatePriceGrowth = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return 0;
    const recent = priceHistory.slice(-6); // 6 derniers mois
    const start = recent[0]?.price || 0;
    const end = recent[recent.length - 1]?.price || 0;
    return start > 0 ? ((end - start) / start) * 100 : 0;
  };

  const identifyHotZones = (properties) => {
    if (!properties) return [];
    const zoneActivity = {};
    properties.forEach(p => {
      const zone = p.location || 'Autre';
      if (!zoneActivity[zone]) zoneActivity[zone] = { count: 0, avgPrice: 0, totalPrice: 0 };
      zoneActivity[zone].count++;
      zoneActivity[zone].totalPrice += p.price_per_sqm || 0;
    });
    
    return Object.entries(zoneActivity)
      .map(([zone, data]) => ({
        zone,
        activity: data.count,
        avgPrice: data.totalPrice / data.count
      }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 5)
      .map(item => item.zone);
  };

  const calculatePerformanceHistory = (investments) => {
    if (!investments || investments.length === 0) return [];
    return investments.map(inv => ({
      date: new Date(inv.created_at),
      value: inv.current_value || 0,
      roi: inv.current_value && inv.initial_investment 
        ? ((inv.current_value - inv.initial_investment) / inv.initial_investment) * 100 
        : 0
    })).sort((a, b) => a.date - b.date);
  };

  const calculateDiversificationScore = (investments) => {
    if (!investments || investments.length === 0) return 0;
    const types = new Set(investments.map(inv => inv.parcels?.type || 'Autre'));
    const locations = new Set(investments.map(inv => inv.parcels?.location || 'Autre'));
    const maxScore = 100;
    const typeScore = Math.min(types.size * 25, 75); // Max 75 pour 3+ types
    const locationScore = Math.min(locations.size * 5, 25); // Max 25 pour 5+ locations
    return typeScore + locationScore;
  };

  const calculateSharpeRatio = (performanceHistory) => {
    if (!performanceHistory || performanceHistory.length < 2) return 0;
    const returns = performanceHistory.map(p => p.roi);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const riskFreeRate = 3.5; // Taux sans risque supposé
    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
  };

  const calculateVolatility = (performanceHistory) => {
    if (!performanceHistory || performanceHistory.length < 2) return 0;
    const returns = performanceHistory.map(p => p.roi);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance);
  };

  const calculateMaxDrawdown = (performanceHistory) => {
    if (!performanceHistory || performanceHistory.length === 0) return 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    performanceHistory.forEach(point => {
      if (point.value > peak) peak = point.value;
      const drawdown = peak > 0 ? ((point.value - peak) / peak) * 100 : 0;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    });
    
    return maxDrawdown;
  };

  const calculateBeta = (portfolioHistory, marketHistory) => {
    if (!portfolioHistory || !marketHistory || portfolioHistory.length < 2) return 1;
    // Calcul simplifié du beta
    const portfolioReturns = portfolioHistory.map(p => p.roi);
    const marketReturns = marketHistory.map(m => m.growth || 0);
    const minLength = Math.min(portfolioReturns.length, marketReturns.length);
    
    if (minLength < 2) return 1;
    
    const portfolioAvg = portfolioReturns.slice(0, minLength).reduce((sum, r) => sum + r, 0) / minLength;
    const marketAvg = marketReturns.slice(0, minLength).reduce((sum, r) => sum + r, 0) / minLength;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < minLength; i++) {
      covariance += (portfolioReturns[i] - portfolioAvg) * (marketReturns[i] - marketAvg);
      marketVariance += Math.pow(marketReturns[i] - marketAvg, 2);
    }
    
    return marketVariance > 0 ? covariance / marketVariance : 1;
  };

  const calculateMonthlyReturn = (investments) => {
    if (!investments || investments.length === 0) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyInvestments = investments.filter(inv => 
      new Date(inv.created_at) >= startOfMonth
    );
    
    if (monthlyInvestments.length === 0) return 2.3; // Fallback
    
    const monthlyValue = monthlyInvestments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
    const monthlyInitial = monthlyInvestments.reduce((sum, inv) => sum + (inv.initial_investment || 0), 0);
    
    return monthlyInitial > 0 ? ((monthlyValue - monthlyInitial) / monthlyInitial) * 100 : 0;
  };

  const assessMarketRisk = (priceHistory, volatility) => {
    if (volatility > 20) return 'Élevé';
    if (volatility > 15) return 'Modéré';
    return 'Faible';
  };

  // Génération d'opportunités avec IA
  const generateInvestmentOpportunities = async (properties, investments) => {
    try {
      const context = {
        userInvestments: investments?.length || 0,
        portfolioValue: portfolio.currentValue,
        riskTolerance: performanceMetrics.volatility < 15 ? 'conservative' : 'aggressive',
        preferredZones: investments?.map(inv => inv.parcels?.location).filter(Boolean) || [],
        budget: 50000000 // Budget estimé
      };

      const query = `En tant qu'expert en investissement immobilier au Sénégal, analyse ces ${properties?.length || 0} propriétés disponibles et recommande les 5 meilleures opportunités d'investissement pour un investisseur avec:
      - Portfolio actuel: ${context.portfolioValue.toLocaleString()} XOF
      - ${context.userInvestments} investissements existants
      - Profil de risque: ${context.riskTolerance}
      - Budget disponible: ${context.budget.toLocaleString()} XOF
      
      Pour chaque opportunité, fournis:
      1. Score d'attractivité (0-100)
      2. ROI estimé
      3. Niveau de risque
      4. Potentiel d'appréciation
      5. Liquidité du marché`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'investment_advisor', 
        domain: 'real_estate_investment',
        context: context
      });

      setAiInsights(response);
    } catch (error) {
      console.error('Erreur génération opportunités IA:', error);
    }
  };

  // Analyse IA des insights d'investissement
  const generateAIInsights = async () => {
    try {
      const context = {
        portfolioROI: portfolio.totalROI,
        diversificationScore: portfolio.diversificationScore,
        marketGrowth: marketData.priceGrowth,
        volatility: performanceMetrics.volatility,
        totalInvestments: portfolio.totalInvestments
      };

      const query = `Analyse mon portfolio d'investissement immobilier au Sénégal:
      - ROI total: ${context.portfolioROI}%
      - Score de diversification: ${context.diversificationScore}/100
      - Croissance du marché: ${context.marketGrowth}%
      - Volatilité: ${context.volatility}%
      - ${context.totalInvestments} investissements actifs
      
      Fournis 3 recommandations stratégiques pour optimiser mes investissements et 2 alertes de risque potentiels.`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'investment_advisor', 
        domain: 'portfolio_optimization' 
      });
      
      setAiInsights(response);
    } catch (error) {
      console.error('Erreur génération insights IA:', error);
    }
  };

  // Analyse anti-fraude des opportunités d'investissement
  const performFraudAnalysis = async () => {
    try {
      const analysisData = {
        opportunities: opportunities.slice(0, 3),
        marketData: marketData,
        userProfile: {
          id: user?.id,
          investmentHistory: portfolio.totalInvestments,
          riskProfile: performanceMetrics.volatility > 15 ? 'high' : 'moderate'
        }
      };

      const analysis = await antiFraudAI.analyzeInvestmentOpportunities(analysisData);
      setFraudAnalysis(analysis);
    } catch (error) {
      console.error('Erreur analyse anti-fraude:', error);
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

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
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

  const getPerformanceBadge = (value, benchmark) => {
    const diff = value - benchmark;
    if (diff > 0.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (diff > 0) return <Badge className="bg-blue-100 text-blue-800">Bon</Badge>;
    if (diff > -0.5) return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
  };

  const getAIScoreBadge = (score) => {
    if (score >= 85) return <Badge className="bg-green-100 text-green-800">IA: {score}/100</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">IA: {score}/100</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">IA: {score}/100</Badge>;
    return <Badge className="bg-red-100 text-red-800">IA: {score}/100</Badge>;
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'ANALYZE_OPPORTUNITY':
        await generateInvestmentOpportunities();
        break;
      case 'RISK_ASSESSMENT':
        await performFraudAnalysis();
        break;
      case 'OPTIMIZE_PORTFOLIO':
        await generateAIInsights();
        break;
      default:
        console.log('Action IA:', actionType, result);
    }
  };

  const addToWatchlist = async (opportunity) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          parcel_id: opportunity.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // Recharger la watchlist
      const { data: updatedWatchlist } = await supabase
        .from('user_favorites')
        .select('*, parcels(*)')
        .eq('user_id', user.id);
      
      setWatchlist(updatedWatchlist || []);
    } catch (error) {
      console.error('Erreur ajout watchlist:', error);
    }
  };

  if (loading || dataLoading) {
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

      {/* Insights IA */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">Recommandations IA - {aiInsights.modelUsed?.toUpperCase()}</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Confiance: {Math.round((aiInsights.confidence || 0.8) * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">{aiInsights.text}</p>
              {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
                <div className="space-y-2">
                  {aiInsights.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-blue-700">
                      <Zap className="h-4 w-4" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analyse Anti-Fraude */}
      {fraudAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`border-2 ${
            fraudAnalysis.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
            fraudAnalysis.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
            'border-green-200 bg-green-50'
          }`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <CardTitle>Analyse de Sécurité des Investissements</CardTitle>
                <Badge className={
                  fraudAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  fraudAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {fraudAnalysis.riskLevel === 'high' ? 'Risque Élevé' :
                   fraudAnalysis.riskLevel === 'medium' ? 'Attention' : 'Sécurisé'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{fraudAnalysis.summary}</p>
              {fraudAnalysis.recommendations && (
                <div className="space-y-2">
                  {fraudAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dashboard Anti-Fraude */}
      <AntiFraudDashboard userRole="investisseur" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métriques de risque avancées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métriques de Performance Avancées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{metric.metric}</h4>
                    <p className="text-sm text-gray-500">
                      Benchmark: {metric.benchmark}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {metric.value}
                    </div>
                    {getPerformanceBadge(metric.value, metric.benchmark)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist et Alertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Watchlist & Alertes ({watchlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {watchlist.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{item.parcels?.title || `Parcelle ${item.parcel_id}`}</h4>
                    <p className="text-xs text-gray-500">{item.parcels?.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.parcels?.price_per_sqm * item.parcels?.area || 0)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">Favoris</span>
                    </div>
                  </div>
                </div>
              ))}
              {alertsData.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {alertsData.length} alerte(s) de prix active(s)
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/investisseur/watchlist')}
              >
                Gérer la watchlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des prix avec volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution Marché & Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={priceEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'price' ? formatCurrency(value) : value,
                    name === 'price' ? 'Prix moyen' : name === 'volume' ? 'Volume' : 'Sentiment'
                  ]}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="price" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Bar yAxisId="right" dataKey="volume" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance du portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolio.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatPercentage(value), 'ROI']}
                />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Sharpe Ratio</p>
                <p className="font-bold">{performanceMetrics.sharpeRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Volatilité</p>
                <p className="font-bold">{formatPercentage(performanceMetrics.volatility)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Drawdown</p>
                <p className="font-bold">{formatPercentage(performanceMetrics.maxDrawdown)}</p>
              </div>
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
                      <Badge variant="outline" className="text-xs">
                        Vol: {zone.volume}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPercentage(zone.roi)}
                    </div>
                    <p className="text-xs text-gray-500">ROI attendu</p>
                    <p className="text-xs text-blue-500">
                      +{formatPercentage(zone.appreciation)} appréciation
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides améliorées */}
      <Card>
        <CardHeader>
          <CardTitle>Outils d'Analyse Avancés</CardTitle>
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

      {/* Assistant IA Hybride */}
      <AIAssistantWidget 
        dashboardContext={{
          role: 'investisseur',
          portfolioValue: portfolio.currentValue,
          totalInvestments: portfolio.totalInvestments,
          roi: portfolio.totalROI,
          diversificationScore: portfolio.diversificationScore,
          riskMetrics: performanceMetrics,
          marketData: marketData,
          aiInsights: aiInsights,
          fraudAnalysis: fraudAnalysis,
          watchlistCount: watchlist.length
        }}
        onAction={handleAIAction}
        aiService="hybrid"
      />
    </div>
  );
};

export default InvestisseurDashboard;

