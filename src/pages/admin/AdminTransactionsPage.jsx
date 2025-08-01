// src/pages/admin/AdminTransactionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabaseClient';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- REQUÊTE FINALE AVEC LE NOM DE LA CONTRAINTE ---
      // On utilise le nom exact de la relation (fkey) pour être ultra-précis
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          buyer:users!fk_transactions_buyer_id(*),
          seller:users!fk_transactions_seller_id(*),
          parcel:parcels!fk_transactions_parcels(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const formattedTransactions = data.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        status: t.status,
        date: new Date(t.created_at).toLocaleDateString('fr-FR'),
        buyerName: t.buyer?.full_name || 'N/A',
        sellerName: t.seller?.full_name || 'N/A',
        parcelRef: t.parcel?.reference || 'N/A',
      }));

      setTransactions(formattedTransactions || []);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement des transactions",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Le reste du code est inchangé...
  const filteredTransactions = transactions.filter(t =>
    (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.parcelRef || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner size="large" /></div>;
  if (error) return <div className="p-8 text-red-600">Erreur: {error}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center"><DollarSign className="mr-3 h-8 w-8"/>Gestion des Transactions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <Input
            placeholder="Rechercher par acheteur, vendeur, parcelle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Acheteur</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Parcelle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                  <TableCell>{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(transaction.amount)}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(transaction.status)}>{transaction.status}</Badge></TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.buyerName}</TableCell>
                  <TableCell>{transaction.sellerName}</TableCell>
                  <TableCell>{transaction.parcelRef}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminTransactionsPage;
