// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users, LandPlot, FileCheck, DollarSign, Activity, BarChart as BarChartIcon, LayoutDashboard, PieChart as PieChartIcon, Store, User, Landmark, Banknote, Gavel, UserCheck as AgentIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const SimplePieChart = ({ data, title }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    return (
        <div className="h-[250px] w-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-center mb-2">{title}</h3>
            <ResponsiveContainer width="100%" height="100%"><PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie><Tooltip formatter={(value, name) => [value, name]} /><Legend />
            </PieChart></ResponsiveContainer>
        </div>
    );
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({ totalUsers: 0, totalParcels: 0, totalRequests: 0, totalSalesAmount: 0, parcelStatus: [] });
  const [actorStats, setActorStats] = useState({});
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [ usersRes, parcelsRes, requestsRes, transactionsRes, contractsRes ] = await Promise.all([
        supabase.from('users').select('created_at, role, type, id, assigned_agent_id'),
        supabase.from('parcels').select('status, owner_id'),
        supabase.from('requests').select('request_type, status, user_id, recipient_type'),
        supabase.from('transactions').select('amount, created_at, status, buyer_id, seller_id, type'),
        supabase.from('contracts').select('status'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (parcelsRes.error) throw parcelsRes.error;
      if (requestsRes.error) throw requestsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (contractsRes.error) throw contractsRes.error;

      const users = usersRes.data || [];
      const parcels = parcelsRes.data || [];
      const requests = requestsRes.data || [];
      const transactions = transactionsRes.data || [];
      const contracts = contractsRes.data || [];
      
      const parcelStatusMap = parcels.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
      const parcelStatus = Object.keys(parcelStatusMap).map(s => ({ name: s, value: parcelStatusMap[s] }));
      
      const vendeurUsers = users.filter(u => u.type === 'Vendeur');
      const particulierUsers = users.filter(u => u.type === 'Particulier');
      const mairieUsers = users.filter(u => u.type === 'Mairie');
      const banqueUsers = users.filter(u => u.type === 'Banque');
      const notaireUsers = users.filter(u => u.type === 'Notaire');
      const agentUsers = users.filter(u => u.role === 'agent');

      setReportData({
        totalUsers: users.length,
        totalParcels: parcels.length,
        totalRequests: requests.length,
        totalSalesAmount: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
        parcelStatus,
      });

      setActorStats({
        vendeur: { parcellesListees: parcels.filter(p => p.owner_id && vendeurUsers.some(vu => vu.id === p.owner_id)).length, transactionsReussies: transactions.filter(t => t.status === 'completed' && t.seller_id && vendeurUsers.some(vu => vu.id === t.seller_id)).length },
        particulier: { demandesSoumises: requests.filter(r => r.user_id && particulierUsers.some(pu => pu.id === r.user_id)).length, acquisitions: transactions.filter(t => t.status === 'completed' && t.buyer_id && particulierUsers.some(pu => pu.id === t.buyer_id)).length },
        mairie: { parcellesCommunales: parcels.filter(p => p.owner_id && mairieUsers.some(mu => mu.id === p.owner_id)).length, demandesTraitees: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Mairie').length },
        banque: { pretsAccordes: transactions.filter(t => t.type === 'loan' && t.status === 'completed').length, garantiesEvaluees: parcels.filter(p => p.status === 'evaluated_as_guarantee').length },
        notaire: { dossiersTraites: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Notaire').length, actesAuthentifies: contracts.filter(c => c.status === 'signed').length },
        agent: { clientsAssignes: users.filter(u => u.assigned_agent_id && agentUsers.some(au => au.id === u.assigned_agent_id)).length, visitesPlanifiees: requests.filter(r => r.request_type === 'visit' && r.status === 'pending').length },
      });

    } catch (err) {
      setError(err.message);
      toast({ variant: "destructive", title: "Erreur de chargement des données", description: err.message });
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
      <h1 className="text-3xl font-bold text-primary flex items-center"><LayoutDashboard className="h-8 w-8 mr-3"/>Tableau de Bord Administrateur</h1>
      <p className="text-muted-foreground">Vue d'overview et statistiques clés de la plateforme.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Utilisateurs</CardTitle><Users className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalUsers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Parcelles</CardTitle><LandPlot className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalParcels}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Demandes</CardTitle><FileCheck className="h-5 w-5 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.totalRequests}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ventes</CardTitle><DollarSign className="h-5 w-5 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(reportData.totalSalesAmount)}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center text-base"><PieChartIcon className="mr-2 h-5 w-5"/>Statut des Parcelles</CardTitle></CardHeader><CardContent><SimplePieChart data={reportData.parcelStatus} title="Répartition par statut" /></CardContent></Card>
        {/* Vous pouvez ajouter un autre graphique ici */}
      </div>

      <h2 className="text-2xl font-bold text-primary mt-8 mb-4 flex items-center"><Activity className="h-7 w-7 mr-2"/>Statistiques par Acteur</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><Store className="mr-2 h-4 w-4"/>Vendeurs</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.vendeur?.parcellesListees} <span className="text-sm">parcelles</span></p><p className="text-sm text-muted-foreground">{actorStats.vendeur?.transactionsReussies} ventes</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><User className="mr-2 h-4 w-4"/>Particuliers</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.particulier?.demandesSoumises} <span className="text-sm">demandes</span></p><p className="text-sm text-muted-foreground">{actorStats.particulier?.acquisitions} acquisitions</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><Landmark className="mr-2 h-4 w-4"/>Mairies</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.mairie?.parcellesCommunales} <span className="text-sm">parcelles</span></p><p className="text-sm text-muted-foreground">{actorStats.mairie?.demandesTraitees} demandes traitées</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><Banknote className="mr-2 h-4 w-4"/>Banques</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.banque?.pretsAccordes} <span className="text-sm">prêts</span></p><p className="text-sm text-muted-foreground">{actorStats.banque?.garantiesEvaluees} garanties</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><Gavel className="mr-2 h-4 w-4"/>Notaires</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.notaire?.dossiersTraites} <span className="text-sm">dossiers</span></p><p className="text-sm text-muted-foreground">{actorStats.notaire?.actesAuthentifies} actes</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center"><AgentIcon className="mr-2 h-4 w-4"/>Agents</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{actorStats.agent?.clientsAssignes} <span className="text-sm">clients</span></p><p className="text-sm text-muted-foreground">{actorStats.agent?.visitesPlanifiees} visites</p></CardContent></Card>
      </div>
    </motion.div>
  );
};
export default AdminDashboardPage;
