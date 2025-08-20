import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Plus,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SupabaseDataService } from '@/services/supabaseDataService';

const MairieDashboard = () => {
  const { toast } = useToast();
  // Loading géré par le hook temps réel
  const [dashboardData, setDashboardData] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    municipalLands: 0,
    buildingPermits: 0,
    disputes: 0,
    recentActivity: []
  });

  // Chargement géré par les hooks temps réel

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les données réelles depuis la base
      const [parcels, requests] = await Promise.all([
        SupabaseDataService.getParcels(),
        SupabaseDataService.getRequests()
      ]);

      const municipalParcels = parcels.filter(p => p.owner_type === 'Mairie');
      const pendingRequests = requests.filter(r => r.status === 'pending');
      const approvedRequests = requests.filter(r => r.status === 'approved');

      setDashboardData({
        totalRequests: requests.length,
        approvedRequests: approvedRequests.length,
        pendingRequests: pendingRequests.length,
        municipalLands: municipalParcels.length,
        buildingPermits: requests.filter(r => r.type === 'building_permit').length,
        disputes: requests.filter(r => r.type === 'dispute').length,
        recentActivity: requests.slice(0, 5)
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du dashboard"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Nouvelle Demande",
      description: "Traiter une nouvelle demande foncière",
      icon: FileSignature,
      href: "/dashboard/mairie/requests",
      color: "bg-blue-500"
    },
    {
      title: "Gestion Terres",
      description: "Administrer les terres communales",
      icon: LandPlot,
      href: "/dashboard/mairie/land-management",
      color: "bg-green-500"
    },
    {
      title: "Cadastre",
      description: "Consulter le cadastre numérique",
      icon: Map,
      href: "/dashboard/mairie/cadastre",
      color: "bg-purple-500"
    },
    {
      title: "Plan Urbanisme",
      description: "Gérer le plan d'urbanisme",
      icon: Building,
      href: "/dashboard/mairie/urban-plan",
      color: "bg-orange-500"
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      'pending': { variant: 'secondary', label: 'En attente' },
      'approved': { variant: 'default', label: 'Approuvé' },
      'rejected': { variant: 'destructive', label: 'Rejeté' }
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Mairie</h1>
          <p className="text-gray-600 mt-1">Gestion foncière et administrative de la commune</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes Total</CardTitle>
            <FileSignature className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les demandes reçues
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Demandes à traiter
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terres Communales</CardTitle>
            <LandPlot className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.municipalLands}</div>
            <p className="text-xs text-muted-foreground">
              Parcelles gérées
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permis Accordés</CardTitle>
            <CheckCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
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

      {/* Activité récente */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-3">
                      <FileSignature className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{activity.title || `Demande #${activity.id}`}</p>
                        <p className="text-xs text-gray-500">{activity.type || 'Demande générale'}</p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes et Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Demandes en attente</p>
                    <p className="text-xs text-gray-600">{dashboardData.pendingRequests} demandes nécessitent votre attention</p>
                  </div>
                </div>
                <Badge variant="secondary">{dashboardData.pendingRequests}</Badge>
              </div>
              
              {dashboardData.disputes > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Litiges en cours</p>
                      <p className="text-xs text-gray-600">{dashboardData.disputes} litiges nécessitent une résolution</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{dashboardData.disputes}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default MairieDashboard;
