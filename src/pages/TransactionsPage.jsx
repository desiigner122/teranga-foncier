import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Receipt, Download, Filter, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SupabaseDataService } from '@/services/supabaseDataService';

const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);

const getStatusBadge = (status) => {
  switch (status) {
    case 'Payé': return <Badge variant="success">{status}</Badge>;
    case 'En attente': return <Badge variant="warning">{status}</Badge>;
    case 'Échoué': return <Badge variant="destructive">{status}</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const TransactionsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Loading géré par le hook temps réel
  const { data: transactions, loading: transactionsLoading, error: transactionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (transactions) {
      setFilteredData(transactions);
    }
  }, [transactions]);
  
  useEffect(() => {
    let mounted = true;
    (async ()=>{
      try {
        setLoading(true);
        // Fetch real transactions for current user (buyer OR seller OR generic if admin)
        let data;
        if (user?.id) {
          const all = await SupabaseDataService.getTransactions();
            data = all.filter(t => t.buyer_id === user.id || t.seller_id === user.id || t.user_id === user.id || user.role === 'admin');
        } else {
          data = await SupabaseDataService.getTransactions();
        }
        if (mounted) setTransactions(data);
      } catch (e) {
        toast({ variant:'destructive', title:'Erreur', description:'Transactions indisponibles' });
      } finally { if (mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false; };
  }, [user]);

  const handlePayment = (transactionId) => {
    navigate(`/payment/${transactionId}`);
  };

  const handleDownloadInvoice = (transactionId) => {
    toast({
      title: "Téléchargement de la facture...",
      description: `La facture pour la transaction ${transactionId} est en cours de génération.`,
    });
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner size="large" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center"><Receipt className="mr-2 h-8 w-8"/>Mes Transactions</h1>
          <p className="text-muted-foreground">Consultez l'historique de vos paiements et factures.</p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4"/> Filtrer les transactions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>Retrouvez ici toutes les transactions effectuées sur la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Montant</th>
                  <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b hover:bg-muted/30">
                    <td className="py-4 px-4 text-sm">{new Date(tx.created_at || tx.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium">{tx.reference || tx.description || 'Transaction'}</p>
                      {tx.parcel_id && <Link to={`/parcelles/${tx.parcel_id}`} className="text-xs text-primary hover:underline">Voir la parcelle</Link>}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm">{formatPrice(tx.amount || tx.price || 0)}</td>
                    <td className="py-4 px-4">{getStatusBadge(tx.status || 'En cours')}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {['En attente','pending','draft'].includes(tx.status) && (
                        <Button size="sm" onClick={() => handlePayment(tx.id)}>
                          <Banknote className="mr-2 h-4 w-4"/> Payer
                        </Button>
                      )}
                      {['Payé','paid','completed'].includes(tx.status) && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(tx.id)}>
                          <Download className="mr-2 h-4 w-4"/> Facture
                        </Button>
                      )}
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

export default TransactionsPage;
