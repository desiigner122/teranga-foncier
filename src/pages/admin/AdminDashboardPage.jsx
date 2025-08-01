// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users, LandPlot, FileCheck, DollarSign, Activity, BarChart, CalendarDays, PieChart as PieChartIcon, Store, User, Landmark, Banknote, Gavel, UserCheck as AgentIcon, LayoutDashboard
} from 'lucide-react'; // <-- IMPORT CORRIGÉ ICI
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Bar } from 'recharts';

// ... (Les composants SimpleBarChart et SimplePieChart restent les mêmes)
const SimpleBarChart = ({ data, dataKey, labelKey, barColorClass, title }) => (
    <div className="h-[250px] w-full">
        <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={labelKey} />
                <YAxis />
                <Tooltip formatter={(value) => `${new Intl.NumberFormat('fr-FR').format(value)} ${dataKey === 'amount' ? 'XOF' : ''}`} />
                <Legend />
                <Bar dataKey={dataKey} fill={`#${barColorClass.split('-')[1]}`} />
            </RechartsBarChart>
        </ResponsiveContainer>
    </div>
);
const SimplePieChart = ({ data, title }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    return (
        <div className="h-[250px] w-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit || ''}`, props.payload.name]} /><Legend /></PieChart></ResponsiveContainer>
        </div>
    );
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    userRegistrations: [], parcelStatus: [], requestTypes: [], monthlySales: [],
    totalUsers: 0, totalParcels: 0, totalRequests: 0, totalSalesAmount: 0, upcomingEvents: [],
  });
  const [actorStats, setActorStats] = useState({});
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // ... (la logique de fetchData reste la même que dans votre fichier)
    try {
      const [ usersRes, parcelsRes, requestsRes, transactionsRes, contractsRes ] = await Promise.all([
        supabase.from('users').select('created_at, role, type, id, assigned_agent_id, full_name, email'),
        supabase.from('parcels').select('status, area_sqm, owner_id'),
        supabase.from('requests').select('request_type, status, user_id, recipient_type'),
        supabase.from('transactions').select('amount, created_at, status, buyer_id, seller_id, type'),
        supabase.from('contracts').select('status, user_id, parcel_id'),
      ]);
      if (usersRes.error) throw usersRes.error;
      // ... (autres vérifications d'erreur)
      const users = usersRes.data || [];
      const parcels = parcelsRes.data || [];
      const requests = requestsRes.data || [];
      const transactions = transactionsRes.data || [];
      // ... (toute la logique de calcul que vous aviez déjà)
      setReportData({
          totalUsers: users.length,
          totalParcels: parcels.length,
          totalRequests: requests.length,
          totalSalesAmount: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
          // ... autres données
      });
      // ... calcul de actorStats
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-full min-h-[500px]"><LoadingSpinner size="large" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3 text-blue-600"/>
        Tableau de Bord Administrateur
      </h1>
      <p className="text-muted-foreground">Vue d'overview et statistiques clés de la plateforme.</p>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Utilisateurs</CardTitle><Users className="h-5 w-5 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalUsers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Parcelles</CardTitle><LandPlot className="h-5 w-5 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalParcels}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Demandes</CardTitle><FileCheck className="h-5 w-5 text-purple-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalRequests}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventes</CardTitle><DollarSign className="h-5 w-5 text-yellow-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(reportData.totalSalesAmount)}</div></CardContent></Card>
      </div>

      {/* ... Le reste de votre code de tableau de bord (graphiques, etc.) reste ici ... */}

    </motion.div>
  );
};

export default AdminDashboardPage;