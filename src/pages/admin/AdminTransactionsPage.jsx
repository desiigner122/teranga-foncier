// src/pages/admin/AdminTransactionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
const AdminTransactionsPage = () => {
  const { data: transactions, loading: transactionsLoading, error: transactionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (transactions) {
      setFilteredData(transactions);
    }
  }, [transactions]);
  
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

  if (loading || dataLoading) return <div className="flex justify-center p-8"><LoadingSpinner size="large" /></div>;
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
