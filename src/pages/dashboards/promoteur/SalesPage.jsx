import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Search, Filter, Users, BarChart, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import LoadingSpinner from '@/components/ui/spinner';

import SupabaseDataService from '@/services/supabaseDataService';
import { useAuth } from '@/context/AuthContext';

const SalesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState([]);

  const computeChart = (rows) => {
    const counts = { sold: 0, reserved: 0, available: 0 };
    rows.forEach(r => {
      switch ((r.status || '').toLowerCase()) {
        case 'sold':
        case 'vendu':
          counts.sold++; break;
        case 'reserved':
        case 'réservé':
        case 'reserve':
          counts.reserved++; break;
        default:
          counts.available++; break;
      }
    });
    setChartData([
      { name: 'Vendus', value: counts.sold, fill: 'hsl(var(--chart-success))' },
      { name: 'Réservés', value: counts.reserved, fill: 'hsl(var(--chart-warning))' },
      { name: 'Disponibles', value: counts.available, fill: 'hsl(var(--chart-info))' }
    ]);
  };

  const loadUnits = async () => {
    try {
      setRefreshing(true);
      if (!user?.id) {
        setSalesData([]);
        setChartData([]);
        return;
      }
      const allUnits = await SupabaseDataService.getUnitsForPromoteur(user.id);
      // Normalize shape
      const normalized = (allUnits || []).map(u => ({
        project: (u.promoteur_projects && u.promoteur_projects.name) || 'Projet',
        lot: u.reference || `Lot-${u.id}`,
        client: u.client_name || '—',
        status: mapStatusLabel(u.status),
        price: u.price ? formatPrice(u.price) : '—'
      }));
      setSalesData(normalized);
      computeChart(normalized);
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les ventes.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' XOF';
  const mapStatusLabel = (status) => {
    if (!status) return 'Disponible';
    const s = status.toLowerCase();
    if (['sold','vendu'].includes(s)) return 'Vendu';
    if (['reserved','réservé','reserve'].includes(s)) return 'Réservé';
    return 'Disponible';
  };

  useEffect(() => { loadUnits(); }, []);

  // Placeholder: future implementation to update unit status / assign client
  const handleManageUnit = (sale) => {
    toast({ title: 'Gestion indisponible', description: 'Mise à jour des lots à venir (backend requis).' });
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
        case 'Vendu': return 'success';
        case 'Réservé': return 'warning';
        case 'Disponible': return 'info';
        default: return 'outline';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center"><DollarSign className="mr-3 h-8 w-8 text-primary"/>Ventes & Commercialisation</h1>
        <Button variant="outline" size="sm" onClick={loadUnits} disabled={refreshing} className="flex items-center">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Rafraîchir
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Statut des Lots</CardTitle>
          <CardDescription>Vue d'ensemble de la commercialisation de vos projets.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des Ventes</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par lot, client..." className="pl-8" />
            </div>
            <Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" /> Filtrer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Projet / Lot</th>
                  <th className="text-left p-2 font-semibold hidden sm:table-cell">Client</th>
                  <th className="text-left p-2 font-semibold hidden md:table-cell">Prix</th>
                  <th className="text-left p-2 font-semibold">Statut</th>
                  <th className="text-right p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Aucun lot trouvé. Ajoutez des entrées dans la table promoteur_project_units.
                    </td>
                  </tr>
                )}
                {salesData.map(sale => (
                  <tr key={sale.lot} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <p className="font-medium">{sale.project}</p>
                      <p className="text-xs text-muted-foreground">Lot {sale.lot}</p>
                    </td>
                    <td className="p-2 hidden sm:table-cell">{sale.client}</td>
                    <td className="p-2 hidden md:table-cell">{sale.price}</td>
                    <td className="p-2"><Badge variant={getStatusBadge(sale.status)}>{sale.status}</Badge></td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleManageUnit(sale)} disabled>
                        <Users className="mr-1 h-4 w-4 hidden sm:inline-block" />Gérer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesPage;