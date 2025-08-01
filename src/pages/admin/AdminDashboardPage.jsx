// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
// --- CORRECTION : Ajout de LayoutDashboard et PieChartIcon ---
import {
  Users, MapPin, FileCheck, DollarSign, Activity, BarChart as BarChartIcon, LayoutDashboard, PieChart as PieChartIcon, LandPlot
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Les composants SimpleBarChart et SimplePieChart restent les mêmes...
const SimpleBarChart = ({ data, dataKey, labelKey, barColor, title }) => (
    <div className="h-[250px] w-full">
        <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
  const [reportData, setReportData] = useState({ totalUsers: 0, totalParcels: 0, totalRequests: 0, totalSalesAmount: 0, parcelStatus: [] });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const { data: users, error: usersError } = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (usersError) throw usersError;

      const { data: parcels, error: parcelsError } = await supabase.from('parcels').select('status', { count: 'exact' });
      if (parcelsError) throw parcelsError;

      const { data: requests, error: requestsError } = await supabase.from('requests').select('id', { count: 'exact', head: true });
      if (requestsError) throw requestsError;

      const { data: transactions, error: transactionsError } = await supabase.from('transactions').select('amount', { count: 'exact' }).eq('status', 'completed');
      if (transactionsError) throw transactionsError;

      const parcelStatusMap = (parcels || []).reduce((acc, parcel) => {
        acc[parcel.status] = (acc[parcel.status] || 0) + 1;
        return acc;
      }, {});
      const parcelStatus = Object.keys(parcelStatusMap).map(status => ({ name: status, value: parcelStatusMap[status] }));
      
      const totalSalesAmount = (transactions || []).reduce((sum, t) => sum + t.amount, 0);

      setReportData({
        totalUsers: users?.count || 0,
        totalParcels: parcels?.length || 0,
        totalRequests: requests?.count || 0,
        totalSalesAmount: totalSalesAmount,
        parcelStatus
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
  }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-full min-h-[500px]"><LoadingSpinner size="large" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3"/> Tableau de Bord Administrateur
      </h1>
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
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;