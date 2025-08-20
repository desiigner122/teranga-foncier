import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Smartphone, Landmark, FileCheck2, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// Removed static payment data imports; now dynamically loaded from import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SupabaseDataService } from '@/services/supabaseDataService';

const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);

const PaymentPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { data: paymentMethods, loading: paymentMethodsLoading, error: paymentMethodsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (paymentMethods) {
      setFilteredData(paymentMethods);
    }
  }, [paymentMethods]);
  
  useEffect(() => {
    let mounted = true;
    (async()=>{
      try {
        const all = await SupabaseDataService.getTransactions();
        const found = all.find(t=> String(t.id) === String(transactionId) || t.reference === transactionId);
        if (!found) throw new Error('Transaction introuvable');
        if (mounted) {
          setTransaction(found);
          setSelectedMethod(found.amount <= 100000 ? 'mobile' : 'transfer');
          setCurrentStatus(found.status);
        }
      } catch (e) {
        toast({ title:'Erreur', description:e.message||'Transaction non trouvée', variant:'destructive' });
        navigate('/transactions');
      }
    })();
    return ()=>{ mounted=false; };
  }, [transactionId, navigate, toast]);

  // Load dynamic payment metadata (methods + banks)
  useEffect(()=>{
    let active = true;
    (async()=>{
      try {
        const [methods, banksList] = await Promise.all([
          SupabaseDataService.listPaymentMethods(),
          SupabaseDataService.listBanks()
        ]);
        if (!active) return;
        setPaymentMethods(methods);
        setBanks(banksList);
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();
    return ()=>{ active=false; };
  }, []);

  const refreshStatus = async () => {
    if (!transaction) return;
    setRefreshing(true);
    try {
      const latest = await SupabaseDataService.getTransactionById(transaction.id);
      if (latest) {
        setTransaction(latest);
        setCurrentStatus(latest.status);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title:'Non connecté', description:'Connectez-vous pour payer', variant:'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
  const paid = await SupabaseDataService.payTransaction(transaction.id, user.id, selectedMethod);
      setIsProcessing(false);
      setIsPaid(true);
  if (paid?.status) setCurrentStatus(paid.status);
      if (paid) {
        toast({
          title: 'Paiement Réussi !',
          description: `Le paiement de ${formatPrice(paid.amount || transaction.amount)} pour ${paid.reference || transaction.reference || transaction.description} a été enregistré.`,
          variant: 'success'
        });
      } else {
        toast({ title:'Paiement', description:'Transaction marquée payée.', variant:'success' });
      }
      setTimeout(()=> navigate('/transactions'), 2500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast({ title:'Erreur paiement', description: err.message || 'Échec du paiement', variant:'destructive' });
    }
  };

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'mobile':
        return (
          <div className="space-y-4">
            <Select onValueChange={(value) => setPaymentDetails({ provider: value })}>
              <SelectTrigger><SelectValue placeholder="Choisissez un opérateur" /></SelectTrigger>
              <SelectContent>
                {paymentMethods.find(p => p.id === 'mobile')?.providers?.map(provider => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="tel" placeholder="Numéro de téléphone (ex: 771234567)" required />
          </div>
        );
      case 'transfer':
        return (
          <div className="space-y-4">
            <Select onValueChange={(value) => setPaymentDetails({ bank: value })}>
              <SelectTrigger><SelectValue placeholder="Choisissez votre banque" /></SelectTrigger>
              <SelectContent>
                {banks.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Numéro de référence du virement" required />
            <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              Veuillez effectuer un virement vers le compte IBAN <span className="font-mono">SN012 01010 123456789012 87</span> avec la référence de transaction <span className="font-mono">{transaction.id}</span>.
            </p>
          </div>
        );
      case 'check':
        return (
          <div className="space-y-4">
            <Input placeholder="Numéro du chèque" required />
            <Input placeholder="Banque émettrice" required />
            <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              Le chèque doit être libellé à l'ordre de "Teranga Foncier SA" et déposé à notre agence principale.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!transaction || loadingMeta) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner size="large" /></div>;
  }

  if (isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto py-12 flex flex-col items-center justify-center text-center"
      >
        <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Paiement Effectué !</h1>
        <p className="text-lg text-muted-foreground mb-4">Votre transaction a été traitée avec succès (statut: {currentStatus || 'paid'}).</p>
        <p className="text-sm">Vous allez être redirigé vers vos transactions...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 px-4 max-w-2xl"
    >
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux transactions
      </Button>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl">Paiement Sécurisé</CardTitle>
          <CardDescription>Finalisez votre transaction en toute sécurité.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border-b pb-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{transaction.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium text-right">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-muted-foreground">Statut</span>
              <span className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-muted font-medium">{currentStatus || transaction.status || 'pending'}</span>
                <Button type="button" size="icon" variant="ghost" onClick={refreshStatus} disabled={refreshing} className="h-6 w-6">
                  <RefreshCcw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </span>
            </div>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Montant à payer</p>
            <p className="text-4xl font-bold text-primary">{formatPrice(transaction.amount)}</p>
          </div>

          <form onSubmit={handlePaymentSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Méthode de paiement</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  {paymentMethods.map(method => {
                    const Icon = method.icon && typeof method.icon === 'string' ? (method.icon === 'Smartphone' ? Smartphone : method.icon === 'Landmark' ? Landmark : method.icon === 'FileCheck2' ? FileCheck2 : Smartphone) : Smartphone;
                    return (
                      <Button
                        key={method.id}
                        type="button"
                        variant={selectedMethod === method.id ? 'default' : 'outline'}
                        onClick={() => setSelectedMethod(method.id)}
                        className="w-full justify-start"
                      >
                        <Icon className="mr-2 h-4 w-4" /> {method.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {selectedMethod && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t"
                >
                  <h3 className="font-semibold mb-4">Détails du paiement</h3>
                  {renderPaymentDetails()}
                </motion.div>
              )}
            </div>
            
            <CardFooter className="px-0 pt-8 pb-0">
              <Button type="submit" className="w-full" size="lg" disabled={!selectedMethod || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  `Payer ${formatPrice(transaction.amount)}`
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentPage;