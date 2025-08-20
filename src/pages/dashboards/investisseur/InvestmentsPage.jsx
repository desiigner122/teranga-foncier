import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PlusCircle, Search, DollarSign, Calendar, MapPin, BarChart3, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const InvestmentsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: investments, loading: investmentsLoading, error: investmentsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (investments) {
      setFilteredData(investments);
    }
  }, [investments]);
  
  useEffect(() => {
    if (user) {
      loadInvestments();
    }
  }, [user]);

  const loadInvestments = async () => {
    try {
      setLoading(true);

      // Récupérer les investissements (table 'investments' du schéma AI) rejoints sur parcels si FK (adapter selon schéma réel)
      const { data: investmentData, error } = await supabase
        .from('investments')
        .select(`
          *,
          parcels:parcel_id(*)
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement investissements:', error);
      }

      setInvestments(investmentData || []);

  // Pas de génération d'exemples: on affiche simplement vide + CTA

    } catch (error) {
      console.error('Erreur chargement investissements:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les investissements"
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed sample generation block

  const calculateROI = (investment) => {
    const initial = investment.initial_investment || 0;
    const current = investment.current_value || 0;
    return initial > 0 ? ((current - initial) / initial * 100).toFixed(1) : 0;
  };

  const calculateAnnualizedROI = (investment) => {
    const totalROI = parseFloat(calculateROI(investment));
    const monthsHeld = investment.holding_period_months || 1;
    const yearsHeld = monthsHeld / 12;
    return yearsHeld > 0 ? (totalROI / yearsHeld).toFixed(1) : 0;
  };

  const getTotalValue = () => {
    return investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  };

  const getTotalInvested = () => {
    return investments.reduce((sum, inv) => sum + (inv.initial_investment || 0), 0);
  };

  const getTotalGainLoss = () => {
    return getTotalValue() - getTotalInvested();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'sold': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'sold': return 'Vendu';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'purchase': return 'Achat direct';
      case 'rental': return 'Investissement locatif';
      case 'development': return 'Développement';
      case 'flip': return 'Revente rapide';
      default: return type;
    }
  };

  const getStrategyLabel = (strategy) => {
    switch (strategy) {
      case 'value_appreciation': return 'Plus-value';
      case 'rental_income': return 'Revenus locatifs';
      case 'development': return 'Développement';
      case 'mixed': return 'Mixte';
      default: return strategy;
    }
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = 
      investment.parcels?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.parcels?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || investment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="mr-3 h-8 w-8"/>
            Mes Investissements
          </h1>
          <p className="text-gray-600">Suivez la performance de votre portefeuille immobilier</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nouvel Investissement
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(getTotalValue() / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capital Investi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(getTotalInvested() / 1000000).toFixed(1)}M
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gain/Perte</p>
                <p className={`text-2xl font-bold ${getTotalGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getTotalGainLoss() >= 0 ? '+' : ''}{(getTotalGainLoss() / 1000000).toFixed(1)}M
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Global</p>
                <p className={`text-2xl font-bold ${getTotalGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getTotalInvested() > 0 
                    ? ((getTotalGainLoss() / getTotalInvested()) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un investissement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des investissements */}
      <Card>
        <CardHeader>
          <CardTitle>Portefeuille d'Investissements</CardTitle>
          <CardDescription>
            Détail de vos investissements immobiliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {investments.length === 0 ? 'Aucun investissement' : 'Aucun résultat'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {investments.length === 0 
                  ? 'Commencez votre premier investissement immobilier'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvestments.map((investment) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {investment.parcels?.title || `Investissement ${investment.id}`}
                        </h3>
                        <Badge className={getStatusColor(investment.status)}>
                          {getStatusLabel(investment.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(investment.investment_type)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Investi:</span>
                          <p className="font-medium text-blue-600">
                            {(investment.initial_investment / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Valeur actuelle:</span>
                          <p className="font-medium text-green-600">
                            {(investment.current_value / 1000000).toFixed(1)}M
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">ROI:</span>
                          <p className={`font-medium ${parseFloat(calculateROI(investment)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateROI(investment)}%
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">ROI annualisé:</span>
                          <p className={`font-medium ${parseFloat(calculateAnnualizedROI(investment)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateAnnualizedROI(investment)}%
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">Stratégie:</span>
                          <p className="font-medium">{getStrategyLabel(investment.investment_strategy)}</p>
                        </div>

                        <div>
                          <span className="text-gray-500">Date achat:</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <p className="font-medium">
                              {new Date(investment.purchase_date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {investment.parcels?.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {investment.parcels.location}
                        </div>
                      )}

                      {investment.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {investment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentsPage;

