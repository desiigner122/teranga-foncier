// src/pages/admin/AdminTypeChangeRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import SupabaseDataService from '../../services/SupabaseDataService';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const AdminTypeChangeRequestsPage = () => {
  
  
  /* REMOVED DUPLICATE */ ('');
const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
const { toast } = useToast();
  const { data: typeChangeRequests, loading: typeChangeRequestsLoading, error: typeChangeRequestsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (typeChangeRequests) {
      setFilteredData(typeChangeRequests);
    }
  }, [typeChangeRequests]);
  
  useEffect(() => {
    loadTypeChangeRequests();
  }, [loadTypeChangeRequests]);

  // Approuver une demande de changement de type
  const handleApproveTypeChange = async (request) => {
    try {
      // Mise à jour du type d'utilisateur
      await SupabaseDataService.updateUser(request.user_id, { 
        type: request.requested_type 
      });
      
      // Mettre à jour le statut de la demande
      const updatedRequests = typeChangeRequests.map(req => 
        req.id === request.id ? { ...req, status: 'approved', approved_at: new Date().toISOString() } : req
      );
      setTypeChangeRequests(updatedRequests);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: request.user_id,
        type: 'type_change_approved',
        title: `Demande de changement de type approuvée`,
        body: `Votre compte est maintenant de type ${request.requested_type}`,
        data: { 
          previous_type: request.current_type,
          new_type: request.requested_type
        }
      });
      
      toast({
        title: "Demande approuvée",
        description: `${request.user_name} est maintenant ${request.requested_type}`
      });
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver la demande de changement de type"
      });
    }
  };

  // Ouvrir modal pour rejeter une demande
  const handleOpenRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectReasonModalOpen(true);
  };

  // Rejeter une demande de changement de type
  const handleRejectTypeChange = async () => {
    try {
      if (!selectedRequest) return;
      
      // Mettre à jour le statut de la demande
      const updatedRequests = typeChangeRequests.map(req => 
        req.id === selectedRequest.id ? { 
          ...req, 
          status: 'rejected', 
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        } : req
      );
      setTypeChangeRequests(updatedRequests);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: selectedRequest.user_id,
        type: 'type_change_rejected',
        title: `Demande de changement de type rejetée`,
        body: rejectionReason || `Votre demande de changement vers ${selectedRequest.requested_type} a été rejetée`,
        data: { 
          requested_type: selectedRequest.requested_type,
          rejection_reason: rejectionReason
        }
      });
      
      toast({
        title: "Demande rejetée",
        description: `La demande de ${selectedRequest.user_name} a été rejetée`
      });
      
      setIsRejectReasonModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter la demande"
      });
    }
  };

  // Voir les documents
  const handleViewDocuments = (request) => {
    setSelectedRequest(request);
    setIsViewDocumentsModalOpen(true);
  };

  if (loading && typeChangeRequests.length === 0) {
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
          <UserCog className="h-8 w-8" />
          Demandes de Changement de Type
        </h1>
        <p className="text-muted-foreground">
          Gérez les demandes des utilisateurs pour changer leur type de compte (Particulier → Vendeur, etc.)
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, type actuel ou demandé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={loadTypeChangeRequests}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des demandes */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Demandes</span>
              {statusFilter === 'pending' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {typeChangeRequests.filter(r => r.status === 'pending').length} en attente
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type actuel</TableHead>
                  <TableHead>Type demandé</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date demande</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.user_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.current_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.requested_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {request.documents && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDocuments(request)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            <span>{request.documents.length}</span>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                        )}
                        {request.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.submitted_at ? new Date(request.submitted_at).toLocaleDateString('fr-FR') : 'Inconnue'}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleApproveTypeChange(request)}
                              className="text-green-600 hover:text-green-700"
                              title="Approuver la demande"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenRejectModal(request)}
                              className="text-red-600 hover:text-red-700"
                              title="Rejeter la demande"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDocuments(request)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Aucune demande de changement de type trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de visualisation des documents */}
      <Dialog open={isViewDocumentsModalOpen} onOpenChange={setIsViewDocumentsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Documents</DialogTitle>
            <DialogDescription>
              {selectedRequest ? (
                `Documents soumis par ${selectedRequest.user_name} pour la demande de changement de type`
              ) : (
                'Vérification des documents soumis'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedRequest?.documents?.length > 0 ? (
              selectedRequest.documents.map((doc, index) => (
                <Card key={doc.id || index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" /> Voir
                      </a>
                    </Button>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Badge 
                      variant={doc.verified ? "success" : "outline"}
                      className={doc.verified ? "bg-green-100 text-green-800" : ""}
                    >
                      {doc.verified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                    {selectedRequest.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => {
                            // Marquer le document comme vérifié
                            const updatedDocs = selectedRequest.documents.map((d, i) => 
                              i === index ? { ...d, verified: true } : d
                            );
                            setSelectedRequest(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          disabled={doc.verified}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approuver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            // Marquer le document comme rejeté
                            const updatedDocs = selectedRequest.documents.map((d, i) => 
                              i === index ? { ...d, verified: false, rejected: true } : d
                            );
                            setSelectedRequest(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          disabled={doc.rejected}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Aucun document disponible</p>
            )}
            {selectedRequest?.status === 'rejected' && selectedRequest?.rejection_reason && (
              <Card className="p-4 bg-red-50">
                <h4 className="font-medium">Raison du rejet</h4>
                <p className="text-sm mt-2">{selectedRequest.rejection_reason}</p>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDocumentsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de rejet avec raison */}
      <Dialog open={isRejectReasonModalOpen} onOpenChange={setIsRejectReasonModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de la demande de {selectedRequest?.user_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="rejection-reason">Raison du rejet</Label>
            <Textarea 
              id="rejection-reason" 
              placeholder="Expliquez pourquoi la demande est rejetée..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectReasonModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectTypeChange}
            >
              Rejeter la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminTypeChangeRequestsPage;

