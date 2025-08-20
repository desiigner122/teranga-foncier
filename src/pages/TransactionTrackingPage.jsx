import React, { useState, useEffect } from 'react';
const TransactionTrackingPage = () => {
  const { toast } = useToast();
  const { data: transactions, loading: transactionsLoading, error: transactionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (transactions) {
      setFilteredData(transactions);
    }
  }, [transactions]);
  
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        let userTransactions;
        
        if (user) {
          // Si l'utilisateur est connecté, récupérer ses transactions
          userTransactions = await SupabaseDataService.getTransactionsByUser(user.id);
        } else {
          // Sinon, récupérer toutes les transactions (pour demo)
          userTransactions = await SupabaseDataService.getTransactions(10);
        }

        // Transformer les données pour le format attendu
        const formattedTransactions = userTransactions.map((transaction, index) => ({
          id: transaction.reference || `TXN-${String(index + 1).padStart(3, '0')}`,
          parcelRef: transaction.parcel_reference || `ref-${transaction.id?.substring(0, 8)}`,
          type: transaction.type === 'sale' ? 'Vente' : 'Achat',
          amount: transaction.amount || 0,
          buyer: transaction.buyer_name || (transaction.users ? transaction.users.full_name : 'Acheteur non spécifié'),
          seller: transaction.seller_name || 'Vendeur non spécifié',
          status: transaction.status === 'completed' ? 'Finalisé' : 
                  transaction.status === 'pending' ? 'En cours' : 
                  transaction.status === 'cancelled' ? 'Annulé' : 'En attente',
          progress: transaction.status === 'completed' ? 100 : 
                   transaction.status === 'pending' ? 50 : 25,
          steps: generateStepsFromStatus(transaction.status),
          nextAction: getNextActionFromStatus(transaction.status),
          created_at: transaction.created_at
        }));

        setTransactions(formattedTransactions);
      } catch (err) {        // En cas d'erreur, utiliser des données par défaut
        setTransactions(getDefaultTransactions());
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos transactions. Données de démonstration affichées.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user, toast]);

  // Fonction pour générer les étapes basées sur le statut
  const generateStepsFromStatus = (status) => {
    const baseSteps = [
      { name: 'Offre acceptée', completed: true, date: '2025-01-05' },
      { name: 'Documents vérifiés', completed: false, date: '2025-01-08' },
      { name: 'Financement approuvé', completed: false, date: '2025-01-12' },
      { name: 'Rendez-vous notaire', completed: false, date: '2025-01-20' },
      { name: 'Signature finale', completed: false, date: '2025-01-25' }
    ];

    switch (status) {
      case 'completed':
        return baseSteps.map(step => ({ ...step, completed: true }));
      case 'pending':
        return baseSteps.map((step, index) => ({ ...step, completed: index < 3 }));
      default:
        return baseSteps.map((step, index) => ({ ...step, completed: index < 1 }));
    }
  };

  // Fonction pour obtenir la prochaine action
  const getNextActionFromStatus = (status) => {
    switch (status) {
      case 'completed': return 'Transaction terminée';
      case 'pending': return 'Rendez-vous chez le notaire en attente';
      case 'cancelled': return 'Transaction annulée';
      default: return 'En attente de validation';
    }
  };

  // Données par défaut en cas d'erreur
  const getDefaultTransactions = () => [
    {
      id: 'TXN-001',
      parcelRef: 'dk-alm-002',
      type: 'Achat',
      amount: 150000000,
      buyer: 'Amadou Diallo',
      seller: 'Fatou Ba',
      status: 'En cours',
      progress: 75,
      steps: [
        { name: 'Offre acceptée', completed: true, date: '2025-01-05' },
        { name: 'Documents vérifiés', completed: true, date: '2025-01-08' },
        { name: 'Financement approuvé', completed: true, date: '2025-01-12' },
        { name: 'Rendez-vous notaire', completed: false, date: '2025-01-20' },
        { name: 'Signature finale', completed: false, date: '2025-01-25' }
      ],
      nextAction: 'Rendez-vous chez le notaire le 20/01/2025'
    },
    {
      id: 'TXN-002',
      parcelRef: 'sly-ngp-010',
      type: 'Vente',
      amount: 32000000,
      buyer: 'Moussa Sow',
      seller: 'Aissatou Diop',
      status: 'Finalisé',
      progress: 100,
      steps: [
        { name: 'Offre acceptée', completed: true, date: '2024-12-15' },
        { name: 'Documents vérifiés', completed: true, date: '2024-12-18' },
        { name: 'Financement approuvé', completed: true, date: '2024-12-22' },
        { name: 'Rendez-vous notaire', completed: true, date: '2025-01-05' },
        { name: 'Signature finale', completed: true, date: '2025-01-08' }
      ],
      nextAction: 'Transaction terminée'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Finalisé': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'En attente': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'Suspendu': { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { 
    style: 'currency', 
    currency: 'XOF',
    minimumFractionDigits: 0 
  }).format(price);

  const handleNotifyParties = (transactionId) => {
    toast({
      title: "Notification envoyée",
      description: `Toutes les parties ont été notifiées pour la transaction ${transactionId}.`,
    });
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suivi des Transactions</h1>
        <p className="text-muted-foreground">Suivez l'avancement de vos transactions immobiliéres en temps réel</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions Actives</p>
                <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'En cours').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Finalisées ce mois</p>
                <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'Finalisé').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur Totale</p>
                <p className="text-lg font-bold">{formatPrice(transactions.reduce((sum, t) => sum + t.amount, 0))}</p>
              </div>
              <Eye className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progression Moyenne</p>
                <p className="text-2xl font-bold">
                  {Math.round(transactions.reduce((sum, t) => sum + t.progress, 0) / transactions.length)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des transactions */}
      <div className="space-y-6">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{transaction.id}</CardTitle>
                  <CardDescription>
                    {transaction.parcelRef} - {transaction.type} de {formatPrice(transaction.amount)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(transaction.status)}
                  <span className="text-sm text-muted-foreground">{transaction.progress}% complété</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Parties impliquées */}
                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Acheteur</p>
                    <p className="font-medium">{transaction.buyer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendeur</p>
                    <p className="font-medium">{transaction.seller}</p>
                  </div>
                </div>

                {/* Barre de progression globale */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression globale</span>
                    <span>{transaction.progress}%</span>
                  </div>
                  <Progress value={transaction.progress} className="h-3" />
                </div>

                {/* étapes détaillées */}
                <div>
                  <h4 className="font-semibold mb-3">étapes de la transaction</h4>
                  <div className="space-y-3">
                    {transaction.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.name}
                          </p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground">
                              {step.completed ? 'Terminé le' : 'Prévu le'} {new Date(step.date).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        {step.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prochaine action */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Prochaine action</p>
                  <p className="text-sm text-blue-600">{transaction.nextAction}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Documents
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleNotifyParties(transaction.id)}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Notifier les parties
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TransactionTrackingPage;

