import React, { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BarChart, PieChart, Users, MapPin, FileSignature, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // <-- CORRECTION ICI : Import nommé
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Pie, Cell, Bar } from 'recharts';

// Composant de graphique à barres simple (réutilisable)
const SimpleBarChart = ({ data, dataKey, labelKey, barColorClass, title }) => {
  const color = barColorClass.replace('bg-', ''); // Extraire la couleur de la classe Tailwind

  return (
    <div className="h-[250px] w-full">
      <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip formatter={(value) => `${value} ${dataKey === 'amount' ? 'XOF' : ''}`} />
          <Legend />
          <Bar dataKey={dataKey} fill={`#${color}`} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Composant de graphique en secteurs simple (réutilisable)
const SimplePieChart = ({ data, title }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

  return (
    <div className="h-[250px] w-full flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value} ${props.payload.unit || ''}`, props.payload.name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminReportsPage = () => {
  // Loading géré par le hook temps réel
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    userRegistrations: [],
    parcelStatus: [],
    requestTypes: [],
    monthlySales: [],
    totalUsers: 0,
    totalParcels: 0,
    totalRequests: 0,
    totalSalesAmount: 0,
  });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all necessary data
      const [
        usersRes,
        parcelsRes,
        requestsRes,
        transactionsRes,
      ] = await Promise.all([
        supabase.from('users').select('created_at, role'),
        supabase.from('parcels').select('status, area_sqm'),
        supabase.from('requests').select('request_type, status'),
        supabase.from('transactions').select('amount, created_at, status'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (parcelsRes.error) throw parcelsRes.error;
      if (requestsRes.error) throw requestsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      const users = usersRes.data || [];
      const parcels = parcelsRes.data || [];
      const requests = requestsRes.data || [];
      const transactions = transactionsRes.data || [];

      // Process data for charts
      // User Registrations (by month)
      const userRegistrationsMap = users.reduce((acc, user) => {
        const month = new Date(user.created_at).toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      const userRegistrations = Object.keys(userRegistrationsMap).map(month => ({
        name: month,
        value: userRegistrationsMap[month],
      })).sort((a, b) => new Date(a.name) - new Date(b.name));

      // Parcel Status
      const parcelStatusMap = parcels.reduce((acc, parcel) => {
        acc[parcel.status] = (acc[parcel.status] || 0) + 1;
        return acc;
      }, {});
      const parcelStatus = Object.keys(parcelStatusMap).map(status => ({
        name: status,
        value: parcelStatusMap[status],
        unit: 'parcelles',
      }));

      // Request Types
      const requestTypesMap = requests.reduce((acc, req) => {
        acc[req.request_type] = (acc[req.request_type] || 0) + 1;
        return acc;
      }, {});
      const requestTypes = Object.keys(requestTypesMap).map(type => ({
        name: type,
        value: requestTypesMap[type],
        unit: 'demandes',
      }));

      // Monthly Sales
      const monthlySalesMap = transactions
        .filter(t => t.status === 'completed') // Assuming 'completed' for sales
        .reduce((acc, t) => {
          const month = new Date(t.created_at).toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + t.amount;
          return acc;
        }, {});
      const monthlySales = Object.keys(monthlySalesMap).map(month => ({
        name: month,
        amount: monthlySalesMap[month],
      })).sort((a, b) => new Date(a.name) - new Date(b.name));

      setReportData({
        userRegistrations,
        parcelStatus,
        requestTypes,
        monthlySales,
        totalUsers: users.length,
        totalParcels: parcels.length,
        totalRequests: requests.length,
        totalSalesAmount: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      });

    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement des rapports",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && reportData.totalUsers === 0) { // Check a key piece of data for initial loading
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-red-600">
        <p>Erreur: {error}</p>
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
      <h1 className="text-3xl font-bold flex items-center">
        <BarChart className="mr-3 h-8 w-8"/>
        Rapports et Statistiques
      </h1>
      <p className="text-muted-foreground">Analyses détaillées de l'activité de la plateforme.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><Users className="mr-2 h-5 w-5"/>Inscriptions Utilisateurs</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart
              data={reportData.userRegistrations}
              dataKey="value"
              labelKey="name"
              barColorClass="bg-blue-500"
              title="Nouvelles inscriptions"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChart className="mr-2 h-5 w-5"/> Statut des Parcelles</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.parcelStatus}
              title="Répartition par statut"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChart className="mr-2 h-5 w-5"/> Types de Demandes</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.requestTypes}
              title="Répartition par type"
            />
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center text-base"><DollarSign className="mr-2 h-5 w-5"/> Ventes Mensuelles</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart
              data={reportData.monthlySales}
              dataKey="amount"
              labelKey="name"
              barColorClass="bg-green-500"
              title="Montant des ventes"
            />
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
};

export default AdminReportsPage;
