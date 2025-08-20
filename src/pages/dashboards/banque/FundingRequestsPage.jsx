import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  MapPin
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';

const FundingRequestsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: requests, loading: requestsLoading, error: requestsError, refetch } = useRealtimeRequests();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (requests) {
      setFilteredData(requests);
    }
  }, [requests]);
  
  useEffect(() => {
    loadFundingRequests();
  }, [user]);

  const loadFundingRequests = async () => {
    try {
      setLoading(true);
      
      if (user && user.id) {
        // Utiliser la nouvelle méthode pour récupérer les demandes destinées spécifiquement à cette banque
        const banqueRequests = await SupabaseDataService.getRequestsByRecipient(user.id, 'banque');
        setRequests(banqueRequests);
      } else {
        // Fallback: récupérer toutes les demandes de financement
        const { data, error } = await supabase
          .from('requests')
          .select(`
            *,
            users!inner(id, full_name, email, phone),
            parcels!inner(id, name, reference, location_name, price, surface_area)
          `)
          .eq('request_type', 'funding')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les demandes de financement"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, newStatus, comment = '') => {
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: newStatus,
          processed_at: new Date().toISOString(),
          admin_comment: comment
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Demande mise à jour",
        description: `Statut changé vers: ${getStatusLabel(newStatus)}`
      });

      // Recharger les données
      await loadFundingRequests();
      setIsDetailModalOpen(false);
      
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la demande"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'completed': 'Complété'
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'default',
      'approved': 'default',
      'rejected': 'destructive',
      'completed': 'default'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const calculateLoanRisk = (request) => {
    // Calcul simple du risque basé sur le ratio montant/valeur parcelle
    const parcelValue = request.parcels?.price || 0;
    const requestedAmount = request.data?.amount || 0;
    
    if (parcelValue === 0) return { level: 'high', score: 90 };
    
    const ratio = requestedAmount / parcelValue;
    
    if (ratio <= 0.7) return { level: 'low', score: 25 };
    if (ratio <= 0.85) return { level: 'medium', score: 55 };
    return { level: 'high', score: 85 };
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parcels?.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <DollarSign className="mr-3 h-8 w-8" />
          Demandes de Financement
        </h1>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou référence parcelle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Financement ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Gérez les demandes de financement et évaluez les risques
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande de financement trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const risk = calculateLoanRisk(request);
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.users?.full_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{request.users?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.parcels?.reference || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{request.parcels?.location_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {(request.data?.amount || 0).toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Valeur parcelle: {(request.parcels?.price || 0).toLocaleString('fr-FR')} FCFA
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={risk.level === 'low' ? 'default' : risk.level === 'medium' ? 'secondary' : 'destructive'}>
                          {risk.level === 'low' ? 'Faible' : risk.level === 'medium' ? 'Moyen' : 'Élevé'} ({risk.score}%)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la Demande de Financement</DialogTitle>
            <DialogDescription>
              Examinez et traitez cette demande de financement
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Demandeur</Label>
                  <p className="font-medium">{selectedRequest.users?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.users?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.users?.phone}</p>
                </div>
                <div>
                  <Label>Parcelle</Label>
                  <p className="font-medium">{selectedRequest.parcels?.reference}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.parcels?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.parcels?.location_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant demandé</Label>
                  <p className="font-medium text-lg">
                    {(selectedRequest.data?.amount || 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <Label>Valeur de la parcelle</Label>
                  <p className="font-medium text-lg">
                    {(selectedRequest.parcels?.price || 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              <div>
                <Label>Description du projet</Label>
                <p className="text-sm mt-1">{selectedRequest.data?.description || 'Aucune description fournie'}</p>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleRequestAction(selectedRequest.id, 'approved')}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FundingRequestsPage;

