import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  CreditCard, 
  Search, 
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Receipt,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PaymentPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: transactions, loading: transactionsLoading, error: transactionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (transactions) {
      setFilteredData(transactions);
    }
  }, [transactions]);
  
  useEffect(() => {
    loadPaymentData();
  }, [user]);

  const loadPaymentData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [userTransactions, userPaymentMethods] = await Promise.all([
        SupabaseDataService.getUserTransactions(user.id),
        SupabaseDataService.getUserPaymentMethods(user.id)
      ]);
      
      setTransactions(userTransactions || []);
      setPaymentMethods(userPaymentMethods || []);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos données de paiement"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { label: 'Complété', variant: 'success' },
      'success': { label: 'Réussi', variant: 'success' },
      'pending': { label: 'En attente', variant: 'default' },
      'processing': { label: 'En cours', variant: 'secondary' },
      'failed': { label: 'Échoué', variant: 'destructive' },
      'error': { label: 'Erreur', variant: 'destructive' }
    };

    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'credit':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'payment':
      case 'debit':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'transfer':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAmount = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterTransactionsByPeriod = (transactions, period) => {
    if (period === 'all') return transactions;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.created_at) >= startDate);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const periodFilteredTransactions = filterTransactionsByPeriod(filteredTransactions, selectedPeriod);

  const calculateStats = (transactions) => {
    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const income = transactions
      .filter(t => ['deposit', 'credit'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = transactions
      .filter(t => ['payment', 'debit'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return { total, income, expenses };
  };

  const stats = calculateStats(periodFilteredTransactions);

  if (loading || dataLoading) {
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
          <CreditCard className="h-8 w-8" />
          Paiements & Transactions
        </h1>
        <p className="text-muted-foreground">
          Gérez vos paiements et consultez l'historique de vos transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Solde Total</p>
                <p className="text-2xl font-bold">{formatAmount(stats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(stats.expenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{periodFilteredTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Historique des transactions</TabsTrigger>
          <TabsTrigger value="methods">Moyens de paiement</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher une transaction..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('all')}
                  >
                    Tout
                  </Button>
                  <Button
                    variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('week')}
                  >
                    7 jours
                  </Button>
                  <Button
                    variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                  >
                    30 jours
                  </Button>
                  <Button
                    variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('year')}
                  >
                    1 an
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {periodFilteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                  <p className="text-muted-foreground">
                    {transactions.length === 0 
                      ? "Vous n'avez pas encore effectué de transactions."
                      : "Aucune transaction ne correspond à vos critères de recherche."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              periodFilteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getTransactionTypeIcon(transaction.type)}
                        <div>
                          <h4 className="font-semibold">{transaction.description || 'Transaction'}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(transaction.created_at)}</span>
                            {transaction.reference && (
                              <>
                                <span>•</span>
                                <span>Réf: {transaction.reference}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            ['deposit', 'credit'].includes(transaction.type) 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {['deposit', 'credit'].includes(transaction.type) ? '+' : '-'}
                            {formatAmount(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>
                Gérez vos cartes bancaires et autres moyens de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun moyen de paiement</h3>
                  <p className="text-muted-foreground mb-4">
                    Ajoutez une carte bancaire ou un autre moyen de paiement pour effectuer des transactions.
                  </p>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ajouter un moyen de paiement
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-blue-500" />
                            <div>
                              <h4 className="font-semibold">
                                {method.type === 'card' ? 'Carte bancaire' : method.type}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {method.last_digits ? `•••• ${method.last_digits}` : method.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant={method.is_default ? 'default' : 'outline'}>
                            {method.is_default ? 'Par défaut' : 'Secondaire'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des transactions</CardTitle>
              <CardDescription>
                Vue d'ensemble de vos habitudes de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analyse en cours de développement</h3>
                <p className="text-muted-foreground">
                  Les graphiques et analyses détaillées seront bientôt disponibles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default PaymentPage;
