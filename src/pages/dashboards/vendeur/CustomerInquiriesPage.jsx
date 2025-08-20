import React, { useState, useEffect } from 'react';
const CustomerInquiriesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: inquiries, loading: inquiriesLoading, error: inquiriesError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (inquiries) {
      setFilteredData(inquiries);
    }
  }, [inquiries]);
  
  useEffect(() => {
    loadInquiries();
  }, [user]);

  const loadInquiries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const vendeurInquiries = await SupabaseDataService.getVendeurInquiries(user.id);
      setInquiries(vendeurInquiries || []);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les demandes clients"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await SupabaseDataService.updateInquiryStatus(inquiryId, newStatus);
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus }
          : inquiry
      ));
      
      toast({
        title: "Statut mis é jour",
        description: `La demande a été marquée comme ${getStatusLabel(newStatus)}`
      });
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre é jour le statut"
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { label: 'Nouveau', variant: 'default', color: 'bg-blue-500' },
      'read': { label: 'Lu', variant: 'secondary', color: 'bg-gray-500' },
      'replied': { label: 'Répondu', variant: 'success', color: 'bg-green-500' },
      'in_progress': { label: 'En cours', variant: 'default', color: 'bg-yellow-500' },
      'closed': { label: 'Fermé', variant: 'outline', color: 'bg-gray-600' }
    };

    const config = statusConfig[status] || { label: status, variant: 'default', color: 'bg-gray-500' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'new': 'nouveau',
      'read': 'lu',
      'replied': 'répondu',
      'in_progress': 'en cours',
      'closed': 'fermé'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
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

  const formatPrice = (price) => {
    if (!price) return 'Prix non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInquiryStats = () => {
    return {
      total: inquiries.length,
      new: inquiries.filter(i => i.status === 'new').length,
      inProgress: inquiries.filter(i => i.status === 'in_progress').length,
      replied: inquiries.filter(i => i.status === 'replied').length
    };
  };

  const stats = getInquiryStats();

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
          <MessageSquare className="h-8 w-8" />
          Demandes Clients
        </h1>
        <p className="text-muted-foreground">
          Gérez les demandes d'informations de vos clients potentiels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total demandes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Nouvelles</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Répondues</p>
                <p className="text-2xl font-bold">{stats.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes les demandes</TabsTrigger>
          <TabsTrigger value="new">Nouvelles</TabsTrigger>
          <TabsTrigger value="in_progress">En cours</TabsTrigger>
          <TabsTrigger value="replied">Répondues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher une demande..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    Toutes
                  </Button>
                  <Button
                    variant={statusFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('new')}
                  >
                    Nouvelles
                  </Button>
                  <Button
                    variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('in_progress')}
                  >
                    En cours
                  </Button>
                  <Button
                    variant={statusFilter === 'replied' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('replied')}
                  >
                    Répondues
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries List */}
          <div className="space-y-4">
            {filteredInquiries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune demande trouvée</h3>
                  <p className="text-muted-foreground">
                    {inquiries.length === 0 
                      ? "Vous n'avez pas encore reéu de demandes clients."
                      : "Aucune demande ne correspond é vos critéres de recherche."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(inquiry.status)}
                        <div>
                          <h4 className="font-semibold">{inquiry.client_name || 'Client anonyme'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {inquiry.property_title || 'Demande générale'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inquiry.status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(inquiry.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {inquiry.message && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{inquiry.message}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {inquiry.client_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{inquiry.client_email}</span>
                          </div>
                        )}
                        
                        {inquiry.client_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{inquiry.client_phone}</span>
                          </div>
                        )}
                        
                        {inquiry.property_price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatPrice(inquiry.property_price)}</span>
                          </div>
                        )}
                      </div>

                      {inquiry.visit_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Visite souhaitée: {formatDate(inquiry.visit_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateInquiryStatus(inquiry.id, 'replied')}
                        disabled={inquiry.status === 'replied'}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Répondre
                      </Button>
                      
                      {inquiry.status !== 'closed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                        >
                          Fermer
                        </Button>
                      )}
                      
                      {inquiry.status === 'new' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInquiryStatus(inquiry.id, 'in_progress')}
                        >
                          Marquer en cours
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Other tabs would filter by status */}
        {['new', 'in_progress', 'replied'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="space-y-4">
              {inquiries.filter(i => i.status === status).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucune demande {getStatusLabel(status)}
                    </h3>
                    <p className="text-muted-foreground">
                      Il n'y a pas de demandes avec ce statut pour le moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                inquiries
                  .filter(i => i.status === status)
                  .map((inquiry) => (
                    <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Same content as above but filtered by status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(inquiry.status)}
                            <div>
                              <h4 className="font-semibold">{inquiry.client_name || 'Client anonyme'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {inquiry.property_title || 'Demande générale'}
                              </p>
                            </div>
                          </div>
                          
                          <span className="text-sm text-muted-foreground">
                            {formatDate(inquiry.created_at)}
                          </span>
                        </div>

                        {inquiry.message && (
                          <div className="bg-muted p-3 rounded-lg mb-3">
                            <p className="text-sm">{inquiry.message}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Reply className="h-4 w-4 mr-2" />
                            Répondre
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default CustomerInquiriesPage;

