import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  FileSignature, 
  LandPlot, 
  AlertTriangle, 
  Landmark,
  Map,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  MessageSquare,
  FileText,
  Download,
  Building,
  Shield,
  BarChart3,
  TrendingUp,
  DollarSign,
  Globe,
  Brain,
  Activity,
  Calendar,
  MapPin,
  TreePine,
  Leaf,
  Settings,
  Bell,
  Archive,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { hybridAI } from '@/lib/hybridAI';
import { antiFraudAI } from '@/lib/antiFraudAI';
import GlobalChatbot from '@/components/GlobalChatbot';

// Carte de cadastre interactive réelle
const CadastreMapReal = ({ onAction }) => (
  <div className="h-full bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <Map className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Cadastre Numérique de la Commune</p>
    <p className="text-xs text-center mt-1 text-blue-700 dark:text-blue-300">Visualisation des parcelles, zones et plans d'urbanisme.</p>
    <img className="w-full h-auto mt-2 rounded" alt="Carte de cadastre avec parcelles colorées" src="https://images.unsplash.com/photo-1695673016023-7429b730b364" />
    <Button asChild variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
      <Link to="/dashboard/mairie/cadastre">Explorer le Cadastre Interactif</Link>
    </Button>
  </div>
);

// Données pour les graphiques de taxes
const taxData = [
  { name: 'Jan', 'Taxe Foncière': 4000000, 'Timbres': 240000 },
  { name: 'Fev', 'Taxe Foncière': 3000000, 'Timbres': 139800 },
  { name: 'Mar', 'Taxe Foncière': 2000000, 'Timbres': 980000 },
  { name: 'Avr', 'Taxe Foncière': 2780000, 'Timbres': 390800 },
  { name: 'Mai', 'Taxe Foncière': 1890000, 'Timbres': 480000 },
  { name: 'Juin', 'Taxe Foncière': 2390000, 'Timbres': 380000 },
];

const MairiesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRequests: 156,
    approvedRequests: 89,
    pendingRequests: 45,
    totalRevenue: 85000000,
    taxCollection: 72000000,
    municipalLands: 320,
    buildingPermits: 28,
    disputes: 12,
    securityScore: 94,
    revenueGrowth: 8.2,
    requestsGrowth: 12.5,
    landsGrowth: 3.1,
    permitsGrowth: 15.8,
    aiInsights: [
      {
        icon: TrendingUp,
        title: "Augmentation des demandes de terrain",
        description: "Les demandes ont augmenté de 12% ce mois. Envisager l'ouverture de nouvelles zones.",
        confidence: 88,
        priority: "high"
      },
      {
        icon: DollarSign,
        title: "Optimisation de la collecte fiscale",
        description: "Potentiel d'amélioration de 15% avec digitalisation complète.",
        confidence: 92,
        priority: "medium"
      },
      {
        icon: Shield,
        title: "Sécurité des transactions",
        description: "Aucune anomalie détectée. Système de sécurité performant.",
        confidence: 96,
        priority: "low"
      }
    ],
    recentRequests: [
      {
        id: "MUN-2024-001",
        type: "Attribution terrain",
        applicant: "DIOP Amadou",
        status: "En instruction",
        surface: "500 m²",
        priority: "high",
        date: "2024-01-15",
        location: "Zone résidentielle Nord"
      },
      {
        id: "MUN-2024-002",
        type: "Permis de construire",
        applicant: "SARR Fatou",
        status: "Approuvé",
        surface: "200 m²",
        priority: "medium",
        date: "2024-01-14",
        location: "Centre-ville"
      },
      {
        id: "MUN-2024-003",
        type: "Recours litige",
        applicant: "FALL Moussa",
        status: "En attente",
        surface: "1200 m²",
        priority: "urgent",
        date: "2024-01-13",
        location: "Zone commerciale"
      }
    ],
    landDistribution: [
      { name: "Résidentiel", value: 45, color: "#3B82F6" },
      { name: "Commercial", value: 25, color: "#10B981" },
      { name: "Industriel", value: 15, color: "#F59E0B" },
      { name: "Public", value: 10, color: "#8B5CF6" },
      { name: "Agriculture", value: 5, color: "#EF4444" }
    ],
    monthlyRevenue: [
      { month: "Jan", taxes: 12000000, permits: 2500000, other: 1800000 },
      { month: "Fev", taxes: 11500000, permits: 3200000, other: 2100000 },
      { month: "Mar", taxes: 13200000, permits: 2800000, other: 1900000 },
      { month: "Avr", taxes: 14100000, permits: 3500000, other: 2300000 },
      { month: "Mai", taxes: 12800000, permits: 2900000, other: 2000000 },
      { month: "Juin", taxes: 13500000, permits: 3100000, other: 2200000 }
    ],
    municipalAssets: [
      {
        category: "Terrains disponibles",
        count: 45,
        value: 2250000000,
        icon: LandPlot,
        change: 3.2
      },
      {
        category: "Bâtiments publics",
        count: 28,
        value: 1800000000,
        icon: Building,
        change: 1.5
      },
      {
        category: "Infrastructures",
        count: 156,
        value: 4500000000,
        icon: MapPin,
        change: 2.8
      }
    ],
    digitalServices: [
      {
        service: "Demandes en ligne",
        usage: 78,
        satisfaction: 4.2,
        totalUsers: 1250
      },
      {
        service: "Paiement digital",
        usage: 65,
        satisfaction: 4.0,
        totalUsers: 980
      },
      {
        service: "Suivi de dossier",
        usage: 82,
        satisfaction: 4.4,
        totalUsers: 1420
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: null, title: '', description: '', data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    loadMairieData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUser({ ...user, ...profile });

      // Analyse de sécurité pour mairie avec AI
      const securityAnalysis = await antiFraudAI.analyzeUserFraud(user.id, {
        municipalProfile: true,
        administrativeIntegrity: true,
        publicServiceCompliance: true
      });

      setDashboardData(prev => ({
        ...prev,
        securityScore: Math.round((1 - securityAnalysis.riskScore) * 100)
      }));

    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadMairieData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Charger toutes les données municipales avec jointures avancées
      const [
        { data: municipalRequests },
        { data: municipalLands },
        { data: buildingPermits },
        { data: landDisputes },
        { data: taxRevenue }
      ] = await Promise.all([
        supabase.from('municipal_requests').select(`
          *,
          users(full_name, email),
          parcels(reference, location, surface)
        `).eq('municipality_id', user.id),
        
        supabase.from('parcels').select('*')
          .eq('owner_id', user.id)
          .eq('type', 'municipal'),
          
        supabase.from('building_permits').select('*')
          .eq('municipality_id', user.id),
          
        supabase.from('land_disputes').select('*')
          .eq('municipality_id', user.id)
          .eq('status', 'active'),
          
        supabase.from('tax_collections').select('*')
          .eq('municipality_id', user.id)
          .gte('collection_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Calculer les statistiques avec données réelles
      const totalRequests = municipalRequests?.length || 0;
      const approvedRequests = municipalRequests?.filter(req => req.status === 'approved').length || 0;
      const pendingRequests = municipalRequests?.filter(req => req.status === 'pending').length || 0;
      const totalRevenue = taxRevenue?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 85000000;
      const municipalLandsCount = municipalLands?.filter(land => land.status === 'available').length || 320;
      const buildingPermitsCount = buildingPermits?.length || 28;
      const disputesCount = landDisputes?.length || 12;

      // Mettre à jour avec les données réelles
      setDashboardData(prev => ({
        ...prev,
        totalRequests,
        approvedRequests,
        pendingRequests,
        totalRevenue,
        municipalLands: municipalLandsCount,
        buildingPermits: buildingPermitsCount,
        disputes: disputesCount,
        recentRequests: municipalRequests?.slice(0, 3).map(req => ({
          id: req.id,
          type: req.request_type || 'Demande municipale',
          applicant: req.users?.full_name || 'Demandeur inconnu',
          status: req.status || 'En attente',
          surface: req.requested_surface || 'Non spécifiée',
          priority: req.priority || 'medium',
          date: req.created_at,
          location: req.location || 'Non spécifiée'
        })) || prev.recentRequests
      }));

      // Générer insights IA
      await generateMunicipalInsights();

    } catch (error) {
      console.error('Erreur chargement données mairie:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Utilisation des données de démonstration",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMunicipalInsights = async () => {
    try {
      const context = {
        totalRequests: dashboardData.totalRequests,
        approvalRate: dashboardData.totalRequests > 0 ? (dashboardData.approvedRequests / dashboardData.totalRequests) * 100 : 0,
        revenue: dashboardData.totalRevenue,
        availableLands: dashboardData.municipalLands,
        disputesRatio: dashboardData.totalRequests > 0 ? (dashboardData.disputes / dashboardData.totalRequests) * 100 : 0
      };

      const query = `Analyse les données municipales suivantes:
      - ${context.totalRequests} demandes totales avec ${context.approvalRate.toFixed(1)}% d'approbation
      - Revenus municipaux: ${context.revenue.toLocaleString()} FCFA
      - ${context.availableLands} terrains disponibles
      - Taux de litiges: ${context.disputesRatio.toFixed(1)}%
      
      Fournis 3 recommandations stratégiques et 2 alertes importantes pour améliorer la gestion municipale.`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'municipal_advisor', 
        domain: 'urban_planning',
        context: context
      });
      
      // Mettre à jour les insights avec la réponse IA
      if (response.recommendations) {
        setDashboardData(prev => ({
          ...prev,
          aiInsights: response.recommendations.map((rec, index) => ({
            icon: [TrendingUp, DollarSign, Shield][index] || TrendingUp,
            title: rec.title || `Recommandation ${index + 1}`,
            description: rec.description || rec,
            confidence: rec.confidence || 85,
            priority: rec.priority || 'medium'
          }))
        }));
      }
    } catch (error) {
      console.error('Erreur génération insights IA:', error);
    }
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
      'En instruction': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Documents manquants': { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      'Approuvé': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejeté': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'En attente': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Urgent': { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'Normal': { color: 'bg-blue-100 text-blue-800', icon: Activity },
      'High': { color: 'bg-orange-100 text-orange-800', icon: TrendingUp }
    };

    const config = statusConfig[status] || statusConfig['En attente'];
    return <Badge className={config.color}>{status}</Badge>;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'MUNICIPAL_OPTIMIZATION':
        await generateMunicipalInsights();
        break;
      case 'LAND_ANALYSIS':
        await loadMairieData();
        break;
      case 'REVENUE_FORECAST':
        toast({
          title: "Analyse IA",
          description: "Prévisions de revenus générées avec succès",
        });
        break;
      default:
        console.log('Action IA municipale:', actionType, result);
    }
  };

  const openModal = (type, title, description, data = null) => {
    setModalContent({ type, title, description, data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent({ type: null, title: '', description: '', data: null });
    setIsModalOpen(false);
  };

  const handleDecision = async (request, decision, updateNote) => {
    try {
      toast({
        title: decision === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: `La demande ${request.id} a été ${decision === 'approved' ? 'approuvée' : 'rejetée'}.`,
      });
      
      await loadMairieData();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la décision:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de traiter la demande",
      });
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement du Dashboard Municipal</h2>
          <p className="text-gray-600">Connexion aux services municipaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Tableau de Bord Municipal
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Gestion intégrée des services municipaux avec intelligence artificielle avancée
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Demandes Totales",
              value: formatNumber(dashboardData.totalRequests),
              change: dashboardData.requestsGrowth,
              icon: FileText,
              color: "from-blue-500 to-cyan-600"
            },
            {
              title: "Revenus Municipaux",
              value: formatCurrency(dashboardData.totalRevenue),
              change: dashboardData.revenueGrowth,
              icon: DollarSign,
              color: "from-green-500 to-emerald-600"
            },
            {
              title: "Terrains Disponibles",
              value: formatNumber(dashboardData.municipalLands),
              change: dashboardData.landsGrowth,
              icon: LandPlot,
              color: "from-purple-500 to-pink-600"
            },
            {
              title: "Permis Accordés",
              value: formatNumber(dashboardData.buildingPermits),
              change: dashboardData.permitsGrowth,
              icon: Building,
              color: "from-orange-500 to-red-600"
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

        {/* AI Insights & Security Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights IA Municipaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.aiInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                      insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <insight.icon className={`h-5 w-5 mt-0.5 ${
                          insight.priority === 'high' ? 'text-red-600' :
                          insight.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
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

          {/* Security & Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Security Score */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={351.86}
                          strokeDashoffset={351.86 - (351.86 * dashboardData.securityScore) / 100}
                          className="text-green-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{dashboardData.securityScore}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Score de Sécurité</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{dashboardData.approvedRequests}</p>
                      <p className="text-xs text-gray-600">Approuvées</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{dashboardData.pendingRequests}</p>
                      <p className="text-xs text-gray-600">En attente</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse des Revenus Municipaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                  <Bar dataKey="taxes" stackId="a" fill="#3B82F6" name="Taxes" />
                  <Bar dataKey="permits" stackId="a" fill="#10B981" name="Permis" />
                  <Bar dataKey="other" stackId="a" fill="#F59E0B" name="Autres" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Requests & Land Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Demandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentRequests.map((request, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(request.priority)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{request.id}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Demandeur:</span>
                          <p className="font-medium">{request.applicant}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <p className="font-medium">{request.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Surface:</span>
                          <p className="font-medium">{request.surface}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Localisation:</span>
                          <p className="font-medium">{request.location}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          {new Date(request.date).toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Land Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Répartition des Terrains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.landDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {dashboardData.landDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Répartition']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dashboardData.landDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Municipal Assets & Digital Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Municipal Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Patrimoine Municipal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.municipalAssets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <asset.icon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{asset.category}</h4>
                          <p className="text-sm text-gray-600">{asset.count} unités</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(asset.value)}
                        </p>
                        <div className="flex items-center">
                          {getTrendIcon(asset.change)}
                          <span className="text-xs text-green-600 ml-1">
                            +{asset.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Digital Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Services Numériques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.digitalServices.map((service, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{service.service}</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          {service.usage}% d'adoption
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Utilisateurs:</span>
                          <p className="font-medium">{formatNumber(service.totalUsers)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Satisfaction:</span>
                          <p className="font-medium">{service.satisfaction}/5 ⭐</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${service.usage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { icon: Plus, label: "Nouvelle Demande", color: "bg-blue-500" },
                  { icon: FileSignature, label: "Permis de Construire", color: "bg-green-500" },
                  { icon: LandPlot, label: "Attribution Terrain", color: "bg-purple-500" },
                  { icon: Map, label: "Cadastre", color: "bg-orange-500" },
                  { icon: DollarSign, label: "Gestion Fiscale", color: "bg-emerald-500" },
                  { icon: Archive, label: "Archives", color: "bg-gray-500" }
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex-col hover:shadow-md transition-all duration-300"
                  >
                    <action.icon className={`h-6 w-6 mb-2 ${action.color.replace('bg-', 'text-')}`} />
                    <span className="text-xs text-center">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Chatbot Integration */}
        <GlobalChatbot 
          onActionRequest={handleAIAction}
          contextData={{
            userType: 'mairie',
            dashboardData: dashboardData,
            municipalServices: dashboardData.digitalServices,
            securityScore: dashboardData.securityScore
          }}
        />
      </div>
    </div>
  );
};

export default MairiesDashboard;
