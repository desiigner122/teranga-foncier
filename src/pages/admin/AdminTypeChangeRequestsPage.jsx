// src/pages/admin/AdminTypeChangeRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, FileText, UserCog, CheckCircle2, XCircle, Eye, Users, Search 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from '@/components/ui/spinner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SupabaseDataService from '@/services/supabaseDataService';

const AdminTypeChangeRequestsPage = () => {
  const { toast } = useToast();
  const [typeChangeRequests, setTypeChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isViewDocumentsModalOpen, setIsViewDocumentsModalOpen] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Filtrage des demandes
  const filteredRequests = typeChangeRequests.filter(request => {
    // Filtre par statut
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (request.user_name && request.user_name.toLowerCase().includes(searchLower)) ||
        (request.current_type && request.current_type.toLowerCase().includes(searchLower)) ||
        (request.requested_type && request.requested_type.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const loadTypeChangeRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, remplacer par un appel API
      const mockRequests = [
        {
          id: 'req-1',
          user_id: 'user-1',
          user_name: 'Amadou Diallo',
          current_type: 'Particulier',
          requested_type: 'Vendeur',
          status: 'pending',
          submitted_at: '2025-08-15T10:30:00Z',
          documents: [
            { id: 'doc-1', name: 'Carte d\'identité', url: '#', verified: false },
            { id: 'doc-2', name: 'Justificatif de domicile', url: '#', verified: false }
          ]
        },
        {
          id: 'req-2',
          user_id: 'user-2',
          user_name: 'Fatou Sow',
          current_type: 'Particulier',
          requested_type: 'Investisseur',
          status: 'pending',
          submitted_at: '2025-08-17T14:15:00Z',
          documents: [
            { id: 'doc-3', name: 'Carte d\'identité', url: '#', verified: false },
            { id: 'doc-4', name: 'Justificatif de domicile', url: '#', verified: false },
            { id: 'doc-5', name: 'Attestation bancaire', url: '#', verified: false }
          ]
        },
        {
          id: 'req-3',
          user_id: 'user-3',
          user_name: 'Ibrahim Ndiaye',
          current_type: 'Particulier',
          requested_type: 'Promoteur',
          status: 'approved',
          submitted_at: '2025-08-12T09:45:00Z',
          approved_at: '2025-08-14T11:30:00Z',
          documents: [
            { id: 'doc-6', name: 'Carte d\'identité', url: '#', verified: true },
            { id: 'doc-7', name: 'Justificatif de domicile', url: '#', verified: true },
            { id: 'doc-8', name: 'Licence commerciale', url: '#', verified: true }
          ]
        },
        {
          id: 'req-4',
          user_id: 'user-4',
          user_name: 'Mariama Diop',
          current_type: 'Particulier',
          requested_type: 'Vendeur',
          status: 'rejected',
          submitted_at: '2025-08-10T16:20:00Z',
          rejected_at: '2025-08-11T15:10:00Z',
          rejection_reason: 'Documents incomplets. Veuillez fournir une copie de votre titre foncier.',
          documents: [
            { id: 'doc-9', name: 'Carte d\'identité', url: '#', verified: true },
            { id: 'doc-10', name: 'Justificatif de domicile', url: '#', verified: false }
          ]
        }
      ];
      setTypeChangeRequests(mockRequests);
    } catch (error) {
      console.error('Erreur chargement demandes changement type:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les demandes de changement de type"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
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
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast({
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
