        {/* Table avancée : demandes municipales */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Demandes municipales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex gap-2 items-center">
              <input type="text" placeholder="Recherche..." value={requestSearch||''} onChange={e=>setRequestSearch(e.target.value)} className="max-w-xs border rounded px-2 py-1 text-sm" />
              <Button size="sm" onClick={()=>exportRequestsCSV()} disabled={filteredRequests.length===0}>Exporter CSV</Button>
              <Button size="sm" variant="outline" onClick={()=>setSelectedRequests(filteredRequests.map(r=>r.id))} disabled={filteredRequests.length===0}>Tout sélectionner</Button>
              <Button size="sm" variant="outline" onClick={()=>setSelectedRequests([])} disabled={selectedRequests.length===0}>Désélectionner</Button>
              <Button size="sm" className="bg-red-600 text-white" disabled={selectedRequests.length===0} onClick={()=>bulkRefuserRequests()}>Refuser sélection</Button>
              <Button size="sm" className="bg-green-600 text-white" disabled={selectedRequests.length===0} onClick={()=>bulkApprouverRequests()}>Approuver sélection</Button>
            </div>
            {filteredRequests.length===0? <p className="text-sm text-gray-500">Aucune demande</p> : (
              <div className="space-y-3">
                {filteredRequests.map(request => (
                  <div key={request.id} className={`border rounded p-3 text-sm ${selectedRequests.includes(request.id)?'bg-green-50':''}`}> 
                    <div className="flex justify-between items-center">
                      <input type="checkbox" checked={selectedRequests.includes(request.id)} onChange={e=>{
                        setSelectedRequests(sel=>e.target.checked?[...sel,request.id]:sel.filter(id=>id!==request.id));
                      }} />
                      <span className="font-medium">{request.type}</span>
                      <Badge variant={request.status==='approved'? 'success': request.status==='pending'? 'secondary':'outline'}>{request.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{request.applicant} • {request.location} • {request.surface} m²</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="xs" variant="outline" onClick={()=>openRequest(request)}>Voir</Button>
                      {request.status==='pending' && <Button size="xs" variant="destructive" onClick={()=>refuserRequest(request.id)}>Refuser</Button>}
                      {request.status!=='approved' && <Button size="xs" variant="outline" onClick={()=>approuverRequest(request.id)}>Approuver</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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

const MairiesDashboard = () => {
  const [loading, setLoading] = useState(true);
  // Etat initial vide (plus de données simulées)
  const [dashboardData, setDashboardData] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    municipalLands: 0,
    buildingPermits: 0,
    disputes: 0,
    securityScore: 0,
    revenueGrowth: 0,
    requestsGrowth: 0,
    landsGrowth: 0,
    permitsGrowth: 0,
    aiInsights: [],
    recentRequests: [],
    landDistribution: [],
    monthlyRevenue: [],
    municipalAssets: [],
    digitalServices: []
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: null, title: '', description: '', data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Advanced table state for municipal requests
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Préparer la liste réelle des demandes (municipalRequests)
  const requests = dashboardData.recentRequests || [];
  const filteredRequests = requests.filter(r => {
    if (!requestSearch) return true;
    const s = requestSearch.toLowerCase();
    return (
      (r.type && r.type.toLowerCase().includes(s)) ||
      (r.applicant && r.applicant.toLowerCase().includes(s)) ||
      (r.status && r.status.toLowerCase().includes(s)) ||
      (r.location && r.location.toLowerCase().includes(s))
    );
  });

  // CSV export
  function exportRequestsCSV() {
    if (!filteredRequests.length) return;
    const header = ['Type','Demandeur','Statut','Surface','Localisation','Date'];
    const rows = filteredRequests.map(r => [r.type, r.applicant, r.status, r.surface, r.location, r.date]);
    const csv = [header, ...rows].map(r=>r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demandes_municipales.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Bulk actions
  async function bulkRefuserRequests() {
    if (!selectedRequests.length) return;
    for (const id of selectedRequests) {
      await refuserRequest(id);
    }
    setSelectedRequests([]);
    toast({ title: 'Demandes refusées', description: `${selectedRequests.length} demandes refusées.` });
  }

  async function bulkApprouverRequests() {
    if (!selectedRequests.length) return;
    for (const id of selectedRequests) {
      await approuverRequest(id);
    }
    setSelectedRequests([]);
    toast({ title: 'Demandes approuvées', description: `${selectedRequests.length} demandes approuvées.` });
  }

  // Single actions (should already exist, but fallback)
  async function refuserRequest(id) {
    // ...API call pour refuser la demande...
    // TODO: connecter au backend
    // Simule le changement local
    setDashboardData(d => ({
      ...d,
      recentRequests: d.recentRequests.map(r => r.id === id ? { ...r, status: 'refused' } : r)
    }));
  }
  async function approuverRequest(id) {
    // ...API call pour approuver la demande...
    // TODO: connecter au backend
    setDashboardData(d => ({
      ...d,
      recentRequests: d.recentRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    }));
  }
  function openRequest(request) {
    setModalContent({ type: 'request', title: request.type, description: '', data: request });
    setIsModalOpen(true);
  }

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

      // Calculer les statistiques (uniquement données réelles)
      const totalRequests = municipalRequests?.length || 0;
      const approvedRequests = municipalRequests?.filter(req => req.status === 'approved').length || 0;
      const pendingRequests = municipalRequests?.filter(req => ['pending','en_attente','in_review'].includes((req.status||'').toLowerCase())).length || 0;
      const totalRevenue = taxRevenue?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0;
      const municipalLandsAvailable = municipalLands?.filter(land => (land.status||'').toLowerCase() === 'available').length || 0;
      const buildingPermitsCount = buildingPermits?.length || 0;
      const disputesCount = landDisputes?.length || 0;

      // Répartition terrains (à partir des zones ou surface)
      let landDistribution = [];
      if (municipalLands && municipalLands.length) {
        const byZone = municipalLands.reduce((acc, l) => {
          const zone = (l.zone || 'Inconnu').trim();
          acc[zone] = (acc[zone] || 0) + 1;
          return acc;
        }, {});
        const total = Object.values(byZone).reduce((a,b)=>a+b,0) || 1;
        landDistribution = Object.entries(byZone).slice(0,8).map(([name, count]) => ({
          name,
            value: Math.round((count/total)*100),
            color: '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')
        }));
      }

      // Revenus mensuels (agrégation tax_collections + frais permis si colonne amount/fee) des 6 derniers mois
      let monthlyRevenue = [];
      if (taxRevenue && taxRevenue.length) {
        const byMonth = {};
        taxRevenue.forEach(tr => {
          const d = new Date(tr.collection_date || tr.created_at || Date.now());
          const key = d.getFullYear()+ '-' + (d.getMonth()+1).toString().padStart(2,'0');
          byMonth[key] = byMonth[key] || { month: d.toLocaleString('fr-FR',{ month: 'short'}), taxes: 0, permits: 0, other: 0 };
          byMonth[key].taxes += (tr.amount || 0);
        });
        // Ajouter revenus permis (si champ fee/amount)
        if (buildingPermits && buildingPermits.length) {
          buildingPermits.forEach(bp => {
            const d = new Date(bp.created_at || Date.now());
            const key = d.getFullYear()+ '-' + (d.getMonth()+1).toString().padStart(2,'0');
            byMonth[key] = byMonth[key] || { month: d.toLocaleString('fr-FR',{ month: 'short'}), taxes: 0, permits: 0, other: 0 };
            const permitVal = bp.fee || bp.amount || 0;
            byMonth[key].permits += permitVal;
          });
        }
        monthlyRevenue = Object.keys(byMonth).sort().slice(-6).map(k => byMonth[k]);
      }

      // Patrimoine municipal (terrains + permis) sans valeurs simulées
      const municipalAssets = [
        {
          category: 'Terrains disponibles',
          count: municipalLandsAvailable,
          value: municipalLands?.reduce((sum,l)=> sum + (l.price || l.estimated_value || 0),0) || 0,
          icon: LandPlot,
          change: 0
        },
        {
          category: 'Permis de construire',
          count: buildingPermitsCount,
          value: buildingPermits?.reduce((s,b)=> s + (b.fee || b.amount || 0),0) || 0,
          icon: Building,
          change: 0
        }
      ].filter(a => a.count > 0);

      // Services numériques (laisser vide tant qu'aucune table dédiée n'est disponible)
      const digitalServices = [];

      // Mettre à jour avec les données réelles uniquement
      setDashboardData(prev => ({
        ...prev,
        totalRequests,
        approvedRequests,
        pendingRequests,
        totalRevenue,
        municipalLands: municipalLandsAvailable,
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
        })) || prev.recentRequests,
        landDistribution,
        monthlyRevenue,
        municipalAssets,
        digitalServices
      }));

      // Générer insights IA
      await generateMunicipalInsights();

    } catch (error) {
      console.error('Erreur chargement données mairie:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Certaines données municipales n'ont pas pu être chargées (aucune donnée simulée utilisée)",
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
