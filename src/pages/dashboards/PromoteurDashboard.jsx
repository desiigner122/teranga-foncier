import React, { useState, useEffect } from 'react';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  PieChart as PieChartIcon,
  Brain,
  Zap,
  Shield,
  Activity,
  Settings,
  Eye,
  Star,
  Truck,
  HardHat
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIAssistantWidget from '../../components/ui/AIAssistantWidget';
import AntiFraudDashboard from '../../components/ui/AntiFraudDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { hybridAI } from '../../lib/hybridAI';
import { antiFraudAI } from '../../lib/antiFraudAI';

const PromoteurDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  // Loading géré par le hook temps réel
  const { data: projects, loading: projectsLoading, error: projectsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (projects) {
      setFilteredData(projects);
    }
  }, [projects]);
  
  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
      generateAIInsights();
      checkConstructionAlerts();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les projets du promoteur avec détails complets
      const { data: projectsData, error: projectsError } = await supabase
        .from('development_projects')
        .select(`
          *,
          project_sales(count),
          construction_phases(
            phase_name,
            completion_percentage,
            budget_allocated,
            budget_spent
          ),
          project_team(
            user_id,
            role,
            profiles(full_name)
          )
        `)
        .eq('developer_id', user.id);

      if (projectsError) throw projectsError;

      // Récupérer les ventes liées aux projets avec détails
      const { data: salesData, error: salesError } = await supabase
        .from('project_sales')
        .select(`
          *,
          development_projects(name, type),
          buyers:profiles!project_sales_buyer_id_fkey(full_name, email)
        `)
        .in('project_id', projectsData?.map(p => p.id) || []);

      if (salesError) throw salesError;

      // Récupérer les phases de construction
      const { data: constructionData, error: constructionError } = await supabase
        .from('construction_phases')
        .select('*')
        .in('project_id', projectsData?.map(p => p.id) || []);

      if (constructionError) throw constructionError;

      // Récupérer les fournisseurs/contractants
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('project_suppliers')
        .select(`
          *,
          suppliers(name, category, rating)
        `)
        .in('project_id', projectsData?.map(p => p.id) || []);

      if (suppliersError) throw suppliersError;

      // Calculer les statistiques avancées
      const totalProjects = projectsData?.length || 0;
      const activeProjects = projectsData?.filter(p => p.status === 'active' || p.status === 'En cours').length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed' || p.status === 'Terminé').length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      const totalUnits = projectsData?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;
      const soldUnits = salesData?.length || 0;

      // Calculer la marge moyenne
      const totalBudget = projectsData?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const totalSpent = constructionData?.reduce((sum, phase) => sum + (phase.budget_spent || 0), 0) || 0;
      const averageMargin = totalBudget > 0 ? ((totalRevenue - totalSpent) / totalRevenue) * 100 : 0;

      // Calculer le progrès de construction moyen
      const totalPhases = constructionData?.length || 0;
      const avgCompletion = totalPhases > 0 
        ? constructionData.reduce((sum, phase) => sum + (phase.completion_percentage || 0), 0) / totalPhases 
        : 0;

      // Calculer l'équipe totale
      const teamMembers = projectsData?.reduce((sum, p) => sum + (p.project_team?.length || 0), 0) || 0;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue,
        averageMargin,
        totalUnits,
        soldUnits,
        pendingSales: Math.floor(soldUnits * 0.1), // Estimé
        constructionProgress: avgCompletion,
        teamMembers
      });

      setSalesMetrics({
        conversionRate: totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0,
        averageSaleTime: 45, // Simulé - jours
        customerSatisfaction: 4.2, // Simulé - sur 5
        leadGeneration: salesProgressData[salesProgressData.length - 1]?.leads || 0
      });

      setProjects(projectsData || recentProjects);
      setSuppliers(suppliersData || []);

      // Analyser les risques des projets
      await analyzeProjectRisks(projectsData, constructionData);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback avec données de démonstration enrichies
      setStats({
        totalProjects: 18,
        activeProjects: 7,
        completedProjects: 8,
        totalRevenue: 8700000000,
        averageMargin: 19.2,
        totalUnits: 156,
        soldUnits: 128,
        pendingSales: 12,
        constructionProgress: 67,
        teamMembers: 85
      });

      setSalesMetrics({
        conversionRate: 82.1,
        averageSaleTime: 45,
        customerSatisfaction: 4.2,
        leadGeneration: 156
      });

      setProjects(recentProjects);
    } finally {
      setLoading(false);
    }
  };

  // Génération d'insights IA pour les promoteurs
  const generateAIInsights = async () => {
    try {
      const context = {
        totalProjects: stats.totalProjects,
        activeProjects: stats.activeProjects,
        averageMargin: stats.averageMargin,
        constructionProgress: stats.constructionProgress,
        salesConversion: salesMetrics.conversionRate
      };

      const query = `En tant qu'expert en promotion immobilière au Sénégal, analyse ma performance:
      - ${context.totalProjects} projets au total, ${context.activeProjects} actifs
      - Marge moyenne: ${context.averageMargin}%
      - Progression construction: ${context.constructionProgress}%
      - Taux de conversion ventes: ${context.salesConversion}%
      
      Fournis 3 recommandations stratégiques pour optimiser mes projets et identifier 2 risques potentiels à surveiller.`;

      const response = await hybridAI.generateResponse(query, [], { 
        role: 'real_estate_developer', 
        domain: 'project_management' 
      });
      
      setAiInsights(response);
    } catch (error) {
      console.error('Erreur génération insights IA:', error);
    }
  };

  // Vérification des alertes de construction
  const checkConstructionAlerts = async () => {
    try {
      const alerts = [];
      
      // Analyser les retards potentiels
      recentProjects.forEach(project => {
        const expectedProgress = calculateExpectedProgress(project.completion_date);
        if (project.progress < expectedProgress - 10) {
          alerts.push({
            type: 'delay',
            severity: 'high',
            project: project.name,
            message: `Retard potentiel détecté - Progression: ${project.progress}% vs attendu: ${expectedProgress}%`
          });
        }

        // Analyser les dépassements budgétaires
        const spentRatio = (project.spent / project.budget) * 100;
        if (spentRatio > project.progress + 15) {
          alerts.push({
            type: 'budget',
            severity: 'medium',
            project: project.name,
            message: `Dépassement budgétaire potentiel - Dépensé: ${spentRatio.toFixed(1)}% vs progression: ${project.progress}%`
          });
        }
      });

      setConstructionAlerts(alerts);
    } catch (error) {
      console.error('Erreur vérification alertes:', error);
    }
  };

  // Analyser les risques des projets avec IA
  const analyzeProjectRisks = async (projects, constructionData) => {
    try {
      const risks = projects?.map(project => {
        let riskScore = 0;
        const factors = [];

        // Facteur budget
        const budgetUsed = project.spent ? (project.spent / project.budget) * 100 : 0;
        if (budgetUsed > 80) {
          riskScore += 30;
          factors.push('Budget élevé');
        }

        // Facteur délai
        const expectedProgress = calculateExpectedProgress(project.completion_date);
        if (project.progress < expectedProgress - 10) {
          riskScore += 25;
          factors.push('Retard calendaire');
        }

        // Facteur ventes
        const salesRatio = project.totalUnits > 0 ? (project.soldUnits / project.totalUnits) * 100 : 0;
        if (salesRatio < 50 && project.progress > 70) {
          riskScore += 20;
          factors.push('Ventes insuffisantes');
        }

        // Facteur complexité
        if (project.type === 'Commercial' || project.type === 'Mixte') {
          riskScore += 15;
          factors.push('Complexité technique');
        }

        return {
          projectId: project.id,
          projectName: project.name,
          riskScore: Math.min(riskScore, 100),
          riskLevel: riskScore > 70 ? 'Élevé' : riskScore > 40 ? 'Moyen' : 'Faible',
          factors: factors
        };
      }) || [];

      setProjectRisks(risks);
    } catch (error) {
      console.error('Erreur analyse risques:', error);
    }
  };

  // Fonction utilitaire pour calculer la progression attendue
  const calculateExpectedProgress = (completionDate) => {
    const now = new Date();
    const completion = new Date(completionDate);
    const projectStart = new Date(completion);
    projectStart.setMonth(completion.getMonth() - 18); // Supposons 18 mois de projet
    
    const totalDuration = completion - projectStart;
    const elapsed = now - projectStart;
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
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

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Planification': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'Livraison': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Terminé': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      'active': { color: 'bg-blue-100 text-blue-800', icon: Wrench },
      'completed': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      'delayed': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Planification'];
    return <Badge className={config.color}>{status}</Badge>;
  };

  const getRiskBadge = (risk) => {
    const riskConfig = {
      'Faible': { color: 'bg-green-100 text-green-800' },
      'Moyen': { color: 'bg-yellow-100 text-yellow-800' },
      'Élevé': { color: 'bg-red-100 text-red-800' }
    };
    
    const config = riskConfig[risk] || riskConfig['Moyen'];
    return <Badge className={config.color}>{risk}</Badge>;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAlertBadge = (severity) => {
    const severityConfig = {
      'high': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'medium': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      'low': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    };
    
    const config = severityConfig[severity] || severityConfig['medium'];
    return <Badge className={config.color}>{severity}</Badge>;
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'ANALYZE_PROJECT':
        await analyzeProjectRisks();
        break;
      case 'OPTIMIZE_CONSTRUCTION':
        await checkConstructionAlerts();
        break;
      case 'SALES_FORECAST':
        await generateAIInsights();
        break;
      default:
        console.log('Action IA:', actionType, result);
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

      {/* Alertes de construction */}
      {constructionAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <strong className="text-orange-800">Alertes de Construction ({constructionAlerts.length})</strong>
              {constructionAlerts.slice(0, 2).map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-orange-700">{alert.message}</span>
                  {getAlertBadge(alert.severity)}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                <CardTitle className="text-blue-900">Insights IA Promotion - {aiInsights.modelUsed?.toUpperCase()}</CardTitle>
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

      {/* Dashboard Anti-Fraude */}
      <AntiFraudDashboard userRole="promoteur" />

      {/* Cartes de statistiques enrichies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              Marge: {formatPercentage(stats.averageMargin)}
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
            <CardTitle className="text-sm font-medium">Progression Construction</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.constructionProgress)}</div>
            <p className="text-xs text-muted-foreground">
              Moyenne générale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Collaborateurs actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de vente avancées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taux de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatPercentage(salesMetrics.conversionRate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Temps de Vente Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{salesMetrics.averageSaleTime} jours</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Satisfaction Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{salesMetrics.customerSatisfaction}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Leads Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{salesMetrics.leadGeneration}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progression des ventes avec revenus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ventes & Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value / 1000000000}Md`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'vendu' ? 'Vendues' : 
                    name === 'prevision' ? 'Prévision' : 
                    name === 'revenue' ? 'Revenus' : 'Leads'
                  ]}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="vendu" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Vendues"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="prevision" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Prévision"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statut des projets avec budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Projets par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const item = projectStatusData.find(p => p.status === label);
                    return `${label} - Budget: ${formatCurrency(item?.budget || 0)}`;
                  }}
                />
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
                  <div className="flex-1">
                    <span className="text-sm">{item.status} ({item.count})</span>
                    <p className="text-xs text-gray-500">{formatCurrency(item.budget)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nouvelles sections avancées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyse des risques de projet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Analyse des Risques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAnalysis.map((risk, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{risk.category}</h4>
                    <p className="text-sm text-gray-500">{risk.mitigation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${
                        risk.impact === 'Très Élevé' ? 'bg-red-100 text-red-800' :
                        risk.impact === 'Élevé' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        Impact: {risk.impact}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(risk.probability * 100)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    {getRiskBadge(risk.risk)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phases de construction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              Suivi Construction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {constructionMilestones.map((milestone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{milestone.phase}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={milestone.onTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {milestone.onTime ? 'À temps' : 'Retard'}
                      </Badge>
                      <span className="text-sm">{formatPercentage(milestone.completion)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(milestone.completion)}`}
                      style={{ width: `${milestone.completion}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progression</span>
                    <span>Budget: {formatPercentage(milestone.budget)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets récents améliorés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Projets en Cours ({recentProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{project.type}</Badge>
                        {getStatusBadge(project.status)}
                        {getRiskBadge(project.riskLevel)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{project.teamSize}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression améliorée */}
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

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Unités vendues</p>
                      <p className="font-semibold">{project.soldUnits}/{project.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget utilisé</p>
                      <p className="font-semibold">
                        {formatCurrency(project.spent)}/{formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>

                  {/* Détails supplémentaires */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Prochaine étape: {project.nextMilestone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span>Contractant: {project.contractor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span>Architecte: {project.architecte}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/promoteur/project/${project.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/dashboard/promoteur/construction/${project.id}`)}
                    >
                      <HardHat className="h-3 w-3 mr-1" />
                      Suivi
                    </Button>
                  </div>
                </motion.div>
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

        {/* Revenus par type avec performance */}
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{type.type}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Marge: {formatPercentage(type.margin)}</span>
                      <span>•</span>
                      <span>{type.units} unités</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Prix moyen: {formatCurrency(type.avgPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(type.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">Revenus totaux</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides améliorées */}
      <Card>
        <CardHeader>
          <CardTitle>Outils de Gestion</CardTitle>
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
              onClick={() => navigate('/dashboard/promoteur/analytics')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Analytics Avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assistant IA Hybride */}
      <AIAssistantWidget 
        dashboardContext={{
          role: 'promoteur',
          totalProjects: stats.totalProjects,
          activeProjects: stats.activeProjects,
          averageMargin: stats.averageMargin,
          constructionProgress: stats.constructionProgress,
          salesMetrics: salesMetrics,
          projectRisks: projectRisks,
          constructionAlerts: constructionAlerts,
          aiInsights: aiInsights
        }}
        onAction={handleAIAction}
        aiService="hybrid"
      />
    </div>
  );
};

export default PromoteurDashboard;
