// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, LandPlot, FileCheck, DollarSign, Activity, BarChart, CalendarDays, PieChart as PieChartIcon, Store, User, Landmark, Banknote, Gavel, UserCheck as AgentIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Bar } from 'recharts';

// ... (Les composants SimpleBarChart et SimplePieChart ne changent pas)
const SimpleBarChart = ({ data, dataKey, labelKey, barColor, title }) => (
    <div className="h-[250px] w-full">
        <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${new Intl.NumberFormat('fr-FR').format(value)} ${dataKey === 'amount' ? 'XOF' : ''}`} />
                <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
        </ResponsiveContainer>
    </div>
);

const SimplePieChart = ({ data, title }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    return (
        <div className="h-[250px] w-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    userRegistrations: [], parcelStatus: [], requestTypes: [], monthlySales: [],
    totalUsers: 0, totalParcels: 0, totalRequests: 0, totalSalesAmount: 0,
  });
  const [actorStats, setActorStats] = useState({});
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [ usersRes, parcelsRes, requestsRes, transactionsRes, contractsRes ] = await Promise.all([
        supabase.from('users').select('created_at, role, type, id'),
        supabase.from('parcels').select('status, owner_id'),
        supabase.from('requests').select('request_type, status, user_id'),
        supabase.from('transactions').select('amount, created_at, status, buyer_id, seller_id'),
        supabase.from('contracts').select('status'),
      ]);

      if (usersRes.error) throw usersRes.error;
      // ... (autres vérifications d'erreur)

      const users = usersRes.data || [];
      const parcels = parcelsRes.data || [];
      const requests = requestsRes.data || [];
      const transactions = transactionsRes.data || [];
      
      // ... (Toute la logique de calcul que vous aviez déjà)
      const totalUsers = users.length;
      const totalParcels = parcels.length;
      const totalRequests = requests.length;
      const totalSalesAmount = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

      const parcelStatusMap = parcels.reduce((acc, parcel) => {
        acc[parcel.status] = (acc[parcel.status] || 0) + 1;
        return acc;
      }, {});
      const parcelStatus = Object.keys(parcelStatusMap).map(status => ({ name: status, value: parcelStatusMap[status] }));

      setReportData({
        totalUsers, totalParcels, totalRequests, totalSalesAmount, parcelStatus
      });

    } catch (err) {
      setError(err.message);
      toast({ variant: "destructive", title: "Erreur de chargement", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        toast({ title: "Données mises à jour en temps réel." });
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[500px]"><LoadingSpinner size="large" /></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full min-h-[500px] text-red-600"><p>Erreur: {error}</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3"/> Tableau de Bord Administrateur
      </h1>
      <p className="text-muted-foreground">Vue d'ensemble de l'activité de la plateforme.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Utilisateurs</CardTitle><Users className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalUsers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Parcelles</CardTitle><LandPlot className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalParcels}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Demandes</CardTitle><FileCheck className="h-5 w-5 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalRequests}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Volume Ventes</CardTitle><DollarSign className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(reportData.totalSalesAmount)}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center"><PieChartIcon className="mr-2 h-5 w-5"/>Statut des Parcelles</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart data={reportData.parcelStatus} title="Répartition par statut" />
          </CardContent>
        </Card>
        {/* Vous pouvez ajouter un autre graphique ici si vous le souhaitez */}
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;