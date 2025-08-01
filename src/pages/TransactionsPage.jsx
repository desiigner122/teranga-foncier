import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Receipt, Download, Filter, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/spinner';

const sampleTransactions = [
  {
    id: 'TRN-003-2025',
    date: '2025-08-15',
    description: 'Achat de la parcelle SLY-NGP-010 (2/4)',
    amount: 10312500,
    totalAmount: 41250000,
    status: 'En attente',
    type: 'Achat de terrain',
    paymentMethod: null,
    parcelId: 'sly-ngp-010'
  },
  {
    id: 'TRN-004-2025',
    date: '2025-07-25',
    description: 'Frais de Notaire - Dossier SLY-NGP-010',
    amount: 75000,
    totalAmount: 75000,
    status: 'En attente',
    type: 'Frais notariaux',
    paymentMethod: null,
    parcelId: 'sly-ngp-010'
  },
  {
    id: 'TRN-005-2025',
    date: '2025-07-20',
    description: 'Timbres fiscaux - Mairie de Saly',
    amount: 15000,
    totalAmount: 15000,
    status: 'En attente',
    type: 'Frais administratifs',
    paymentMethod: null,
    parcelId: null
  },
  {
    id: 'TRN-001-2025',
    date: '2025-07-15',
    description: 'Achat de la parcelle SLY-NGP-010 (1/4)',
    amount: 10312500,
    totalAmount: 41250000,
    status: 'Payé',
    type: 'Achat de terrain',
    paymentMethod: 'Virement Bancaire',
    parcelId: 'sly-ngp-010'
  },
  {
    id: 'TRN-002-2025',
    date: '2025-06-20',
    description: 'Frais de dossier - Demande d\'attribution Mairie de Saly',
    amount: 50000,
    totalAmount: 50000,
    status: 'Payé',
    type: 'Frais administratifs',
    paymentMethod: 'Wave',
    parcelId: null
  },
];

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
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setTransactions(sampleTransactions);
      setLoading(false);
    }, 500);
  }, []);

  const handlePayment = (transactionId) => {
    navigate(`/payment/${transactionId}`);
  };

  const handleDownloadInvoice = (transactionId) => {
    toast({
      title: "Téléchargement de la facture...",
      description: `La facture pour la transaction ${transactionId} est en cours de génération.`,
    });
  };

  if (loading) {
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
                    <td className="py-4 px-4 text-sm">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium">{tx.description}</p>
                      {tx.parcelId && <Link to={`/parcelles/${tx.parcelId}`} className="text-xs text-primary hover:underline">Voir la parcelle</Link>}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm">{formatPrice(tx.amount)}</td>
                    <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {tx.status === 'En attente' && (
                        <Button size="sm" onClick={() => handlePayment(tx.id)}>
                          <Banknote className="mr-2 h-4 w-4"/> Payer maintenant
                        </Button>
                      )}
                      {tx.status === 'Payé' && (
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