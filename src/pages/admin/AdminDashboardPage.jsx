import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users, MapPin, FileCheck, DollarSign, UserCheck, Activity, FileText, BarChart, CalendarDays,
  ShieldCheck as ComplianceIcon, LandPlot, Building, Banknote, Leaf, TrendingUp, Scale, Gavel,
  Home, Store, LayoutDashboard, User, Landmark, Handshake, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';

// Composant de graphique à barres simple (réutilisable)
const SimpleBarChart = ({ data, dataKey, labelKey, barColorClass, title }) => {
  const color = barColorClass.replace('bg-', '');

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

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
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
    upcomingEvents: [],
  });
  const [actorStats, setActorStats] = useState({
    vendeur: { parcellesListees: 0, transactionsReussies: 0 },
    particulier: { demandesSoumises: 0, acquisitions: 0 },
    mairie: { parcellesCommunales: 0, demandesTraitees: 0 },
    banque: { pretsAccordes: 0, garantiesEvaluees: 0 },
    notaire: { dossiersTraites: 0, actesAuthentifies: 0 },
    agent: { clientsAssignes: 0, visitesPlanifiees: 0 },
  });

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        usersRes,
        parcelsRes,
        requestsRes,
        transactionsRes,
        contractsRes,
      ] = await Promise.all([
        supabase.from('users').select('created_at, role, type, id, assigned_agent_id, full_name, email'),
        supabase.from('parcels').select('status, area_sqm, owner_id'),
        supabase.from('requests').select('request_type, status, user_id, recipient_type'),
        supabase.from('transactions').select('amount, created_at, status, buyer_id, seller_id, type'),
        supabase.from('contracts').select('status, user_id, parcel_id'),
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

      // Calculate total stats
      const totalUsers = users.length;
      const totalParcels = parcels.length;
      const totalRequests = requests.length;
      const totalSalesAmount = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

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
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => {
          const month = new Date(t.created_at).toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + t.amount;
          return acc;
        }, {});
      const monthlySales = Object.keys(monthlySalesMap).map(month => ({
        name: month,
        amount: monthlySalesMap[month],
      })).sort((a, b) => new Date(a.name) - new Date(b.name));

      // Upcoming Events (Simulated for now, as no 'events' table is assumed)
      const upcomingEvents = [
        { title: 'Réunion de conformité', date: '2025-08-05', time: '10:00' },
        { title: 'Audit foncier annuel', date: '2025-08-15', time: '09:00' },
      ];

      // Calculate Actor Stats
      const vendeurUsers = users.filter(u => u.type === 'Vendeur');
      const particulierUsers = users.filter(u => u.type === 'Particulier');
      const mairieUsers = users.filter(u => u.type === 'Mairie');
      const banqueUsers = users.filter(u => u.type === 'Banque');
      const notaireUsers = users.filter(u => u.type === 'Notaire');
      const agentUsers = users.filter(u => u.role === 'agent');

      const newActorStats = {
        vendeur: {
          parcellesListees: parcels.filter(p => p.owner_id && vendeurUsers.some(vu => vu.id === p.owner_id)).length,
          transactionsReussies: transactions.filter(t => t.status === 'completed' && t.seller_id && vendeurUsers.some(vu => vu.id === t.seller_id)).length,
        },
        particulier: {
          demandesSoumises: requests.filter(r => r.user_id && particulierUsers.some(pu => pu.id === r.user_id)).length,
          acquisitions: transactions.filter(t => t.status === 'completed' && t.buyer_id && particulierUsers.some(pu => pu.id === t.buyer_id)).length,
        },
        mairie: {
          parcellesCommunales: parcels.filter(p => p.owner_id && mairieUsers.some(mu => mu.id === p.owner_id)).length,
          demandesTraitees: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Mairie').length,
        },
        banque: {
          pretsAccordes: transactions.filter(t => t.type === 'loan' && t.status === 'completed').length,
          garantiesEvaluees: parcels.filter(p => p.status === 'evaluated_as_guarantee').length,
        },
        notaire: {
          dossiersTraites: requests.filter(r => r.status === 'completed' && r.recipient_type === 'Notaire').length,
          actesAuthentifies: contracts.filter(c => c.status === 'signed').length,
        },
        agent: {
          clientsAssignes: users.filter(u => u.assigned_agent_id && agentUsers.some(au => au.id === u.assigned_agent_id)).length,
          visitesPlanifiees: requests.filter(r => r.request_type === 'visit' && r.status === 'pending').length,
        },
      };

      setReportData({
        userRegistrations,
        parcelStatus,
        requestTypes,
        monthlySales,
        totalUsers,
        totalParcels,
        totalRequests,
        totalSalesAmount,
        upcomingEvents,
      });
      setActorStats(newActorStats);

    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement du tableau de bord",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && reportData.totalUsers === 0) {
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
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3 text-blue-600"/>
        Tableau de Bord Administrateur
      </h1>
      <p className="text-muted-foreground">Vue d'overview et statistiques clés de la plateforme Teranga Foncier.</p>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Enregistrés</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total sur la plateforme</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelles Gérées</CardTitle>
            <LandPlot className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalParcels}</div>
            <p className="text-xs text-muted-foreground">Total dans le cadastre</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes Traitées</CardTitle>
            <FileCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Total des requêtes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume des Ventes</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(reportData.totalSalesAmount)}</div>
            <p className="text-xs text-muted-foreground">Montant total des transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><BarChart className="mr-2 h-5 w-5 text-blue-500"/>Nouvelles Inscriptions</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart
              data={reportData.userRegistrations}
              dataKey="value"
              labelKey="name"
              barColorClass="bg-blue-500"
              title="Nouvelles inscriptions par mois"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChart className="mr-2 h-5 w-5 text-orange-500"/>Statut des Parcelles</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.parcelStatus}
              title="Répartition par statut de parcelle"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><CalendarDays className="mr-2 h-5 w-5 text-red-500"/>Événements à Venir</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {reportData.upcomingEvents && reportData.upcomingEvents.length > 0 ? (
                reportData.upcomingEvents.map((event, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} - {event.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Aucun événement à venir.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart and Request Types */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><BarChart className="mr-2 h-5 w-5 text-gray-500"/>Ventes Mensuelles</CardTitle></CardHeader>
          <CardContent>
            <SimpleBarChart data={reportData.monthlySales} dataKey="amount" labelKey="name" barColorClass="bg-green-500" title="Montant des ventes" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center text-base"><PieChart className="mr-2 h-5 w-5 text-teal-500"/>Types de Demandes</CardTitle></CardHeader>
          <CardContent>
            <SimplePieChart
              data={reportData.requestTypes}
              title="Répartition par type de demande"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats par Acteur */}
      <h2 className="text-2xl font-bold text-primary mt-8 mb-4 flex items-center">
        <Activity className="h-7 w-7 mr-2 text-blue-600"/>
        Statistiques par Acteur
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Store className="mr-2 h-4 w-4"/>Vendeurs</CardTitle>
             <Link to="/admin/users?type=Vendeur"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actorStats.vendeur.parcellesListees} <span className="text-sm text-muted-foreground">parcelles listées</span></div>
            <p className="text-sm text-muted-foreground">{actorStats.vendeur.transactionsReussies} transactions réussies</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><User className="mr-2 h-4 w-4"/>Particuliers</CardTitle>
            <Link to="/admin/users?type=Particulier"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actorStats.particulier.demandesSoumises} <span className="text-sm text-muted-foreground">demandes soumises</span></div>
            <p className="text-sm text-muted-foreground">{actorStats.particulier.acquisitions} acquisitions</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Landmark className="mr-2 h-4 w-4"/>Mairies</CardTitle>
             <Link to="/admin/users?type=Mairie"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.mairie.parcellesCommunales} <span className="text-sm text-muted-foreground">parcelles communales</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.mairie.demandesTraitees} demandes traitées</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Banknote className="mr-2 h-4 w-4"/>Banques</CardTitle>
            <Link to="/admin/users?type=Banque"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.banque.pretsAccordes} <span className="text-sm text-muted-foreground">prêts accordés</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.banque.garantiesEvaluees} garanties évaluées</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><Gavel className="mr-2 h-4 w-4"/>Notaires</CardTitle>
            <Link to="/admin/users?type=Notaire"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.notaire.dossiersTraites} <span className="text-sm text-muted-foreground">dossiers traités</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.notaire.actesAuthentifies} actes authentifiés</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center"><UserCheck className="mr-2 h-4 w-4"/>Agents</CardTitle>
            <Link to="/admin/users?type=Agent"><Button variant="link" size="sm" className="h-auto p-0 text-xs">Gérer</Button></Link>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{actorStats.agent.clientsAssignes} <span className="text-sm text-muted-foreground">clients assignés</span></p>
            <p className="text-sm text-muted-foreground">{actorStats.agent.visitesPlanifiees} visites planifiées</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>Données mises à jour en temps réel depuis la base de données Supabase.</p>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;
