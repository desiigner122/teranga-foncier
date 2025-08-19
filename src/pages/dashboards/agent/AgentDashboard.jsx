import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Home,
  Calendar,
  Target,
  Award,
  Users
} from 'lucide-react';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    clients: [],
    properties: [],
    sales: [],
    commissions: 0,
    appointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [clients, properties, sales, appointments] = await Promise.all([
        SupabaseDataService.getAgentClients(user.id),
        SupabaseDataService.getAgentProperties(user.id),
        SupabaseDataService.getAgentSales(user.id),
        SupabaseDataService.getAgentAppointments(user.id)
      ]);

      const totalCommissions = sales?.reduce((sum, sale) => sum + (sale.commission || 0), 0) || 0;

      setDashboardData({
        clients: clients || [],
        properties: properties || [],
        sales: sales || [],
        commissions: totalCommissions,
        appointments: appointments || []
      });
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getThisMonthStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthSales = dashboardData.sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const thisMonthAppointments = dashboardData.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear;
    });

    return {
      sales: thisMonthSales.length,
      appointments: thisMonthAppointments.length,
      revenue: thisMonthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    };
  };

  const monthStats = getThisMonthStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCheck className="h-8 w-8" />
          Dashboard Agent Immobilier
        </h1>
        <p className="text-muted-foreground">
          Bienvenue {user?.full_name || user?.email}, voici votre vue d'ensemble
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients actifs</p>
                <p className="text-3xl font-bold">{dashboardData.clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Propriétés gérées</p>
                <p className="text-3xl font-bold">{dashboardData.properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventes totales</p>
                <p className="text-3xl font-bold">{dashboardData.sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commissions totales</p>
                <p className="text-3xl font-bold">{formatPrice(dashboardData.commissions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance This Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ce mois-ci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventes</span>
                <span className="font-semibold">{monthStats.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rendez-vous</span>
                <span className="font-semibold">{monthStats.appointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenus</span>
                <span className="font-semibold">{formatPrice(monthStats.revenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prochains RDV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.appointments.slice(0, 3).length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun rendez-vous prévu</p>
              ) : (
                dashboardData.appointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{appointment.client_name}</p>
                      <p className="text-muted-foreground">{appointment.property_title}</p>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taux de conversion</span>
                <span className="font-semibold">
                  {dashboardData.clients.length > 0 
                    ? Math.round((dashboardData.sales.length / dashboardData.clients.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vente moyenne</span>
                <span className="font-semibold">
                  {dashboardData.sales.length > 0
                    ? formatPrice(dashboardData.sales.reduce((sum, sale) => sum + (sale.amount || 0), 0) / dashboardData.sales.length)
                    : formatPrice(0)
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission moy.</span>
                <span className="font-semibold">
                  {dashboardData.sales.length > 0
                    ? formatPrice(dashboardData.commissions / dashboardData.sales.length)
                    : formatPrice(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dernières ventes</CardTitle>
            <CardDescription>Vos ventes les plus récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.sales.slice(0, 5).length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune vente récente</p>
              ) : (
                dashboardData.sales.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{sale.property_title}</p>
                      <p className="text-sm text-muted-foreground">{sale.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(sale.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
            <CardDescription>Clients ajoutés récemment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.clients.slice(0, 5).length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun nouveau client</p>
              ) : (
                dashboardData.clients.slice(0, 5).map((client, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{client.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AgentDashboard;
