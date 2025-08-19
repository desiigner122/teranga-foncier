// src/pages/admin/AdminParcelSubmissionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, MapPin, Images, CheckCircle2, XCircle, Eye, Search 
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

const AdminParcelSubmissionsPage = () => {
  const { toast } = useToast();
  const [parcelSubmissions, setParcelSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isViewImagesModalOpen, setIsViewImagesModalOpen] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Filtrage des soumissions
  const filteredSubmissions = parcelSubmissions.filter(submission => {
    // Filtre par statut
    if (statusFilter !== 'all' && submission.status !== statusFilter) {
      return false;
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (submission.owner_name && submission.owner_name.toLowerCase().includes(searchLower)) ||
        (submission.parcel_name && submission.parcel_name.toLowerCase().includes(searchLower)) ||
        (submission.location && submission.location.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const loadParcelSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, remplacer par un appel API
      const mockSubmissions = [
        {
          id: 'sub-1',
          parcel_id: 'parcel-1',
          parcel_name: 'Terrain Diamniadio Zone 2',
          owner_id: 'user-1',
          owner_name: 'Amadou Diallo',
          location: 'Diamniadio, Dakar',
          area: '500 m²',
          price: '15 000 000 FCFA',
          status: 'pending',
          submitted_at: '2025-08-15T10:30:00Z',
          images: [
            { id: 'img-1', url: 'https://placehold.co/600x400?text=Terrain+Photo+1', verified: false },
            { id: 'img-2', url: 'https://placehold.co/600x400?text=Terrain+Photo+2', verified: false }
          ],
          documents: [
            { id: 'doc-1', name: 'Titre foncier', url: '#', verified: false },
            { id: 'doc-2', name: 'Certificat de propriété', url: '#', verified: false }
          ]
        },
        {
          id: 'sub-2',
          parcel_id: 'parcel-2',
          parcel_name: 'Parcelle Résidentielle Almadies',
          owner_id: 'user-2',
          owner_name: 'Fatou Sow',
          location: 'Almadies, Dakar',
          area: '800 m²',
          price: '45 000 000 FCFA',
          status: 'pending',
          submitted_at: '2025-08-17T14:15:00Z',
          images: [
            { id: 'img-3', url: 'https://placehold.co/600x400?text=Terrain+Photo+3', verified: false },
            { id: 'img-4', url: 'https://placehold.co/600x400?text=Terrain+Photo+4', verified: false }
          ],
          documents: [
            { id: 'doc-3', name: 'Titre foncier', url: '#', verified: false },
            { id: 'doc-4', name: 'Plan cadastral', url: '#', verified: false }
          ]
        },
        {
          id: 'sub-3',
          parcel_id: 'parcel-3',
          parcel_name: 'Terrain Agricole Thiès',
          owner_id: 'user-3',
          owner_name: 'Ibrahim Ndiaye',
          location: 'Thiès Rural',
          area: '5000 m²',
          price: '8 000 000 FCFA',
          status: 'approved',
          submitted_at: '2025-08-12T09:45:00Z',
          approved_at: '2025-08-14T11:30:00Z',
          images: [
            { id: 'img-5', url: 'https://placehold.co/600x400?text=Terrain+Photo+5', verified: true },
            { id: 'img-6', url: 'https://placehold.co/600x400?text=Terrain+Photo+6', verified: true }
          ],
          documents: [
            { id: 'doc-5', name: 'Titre foncier', url: '#', verified: true },
            { id: 'doc-6', name: 'Certificat d\'usage agricole', url: '#', verified: true }
          ]
        },
        {
          id: 'sub-4',
          parcel_id: 'parcel-4',
          parcel_name: 'Lot Construction Yoff',
          owner_id: 'user-4',
          owner_name: 'Mariama Diop',
          location: 'Yoff, Dakar',
          area: '300 m²',
          price: '20 000 000 FCFA',
          status: 'rejected',
          submitted_at: '2025-08-10T16:20:00Z',
          rejected_at: '2025-08-11T15:10:00Z',
          rejection_reason: 'Documents incomplets. Les limites du terrain ne sont pas clairement définies.',
          images: [
            { id: 'img-7', url: 'https://placehold.co/600x400?text=Terrain+Photo+7', verified: false },
            { id: 'img-8', url: 'https://placehold.co/600x400?text=Terrain+Photo+8', verified: false }
          ],
          documents: [
            { id: 'doc-7', name: 'Titre foncier', url: '#', verified: true },
            { id: 'doc-8', name: 'Plan de délimitation', url: '#', verified: false }
          ]
        }
      ];
      setParcelSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Erreur chargement soumissions parcelles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les soumissions de parcelles"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadParcelSubmissions();
  }, [loadParcelSubmissions]);

  // Approuver une soumission de parcelle
  const handleApproveSubmission = async (submission) => {
    try {
      // Mise à jour du statut de la parcelle
      await SupabaseDataService.updateParcel(submission.parcel_id, { 
        status: 'approved',
        is_verified: true,
      });
      
      // Mettre à jour le statut de la soumission
      const updatedSubmissions = parcelSubmissions.map(sub => 
        sub.id === submission.id ? { ...sub, status: 'approved', approved_at: new Date().toISOString() } : sub
      );
      setParcelSubmissions(updatedSubmissions);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: submission.owner_id,
        type: 'parcel_approved',
        title: `Parcelle approuvée`,
        body: `Votre parcelle "${submission.parcel_name}" a été approuvée et est maintenant visible sur la plateforme`,
        data: { 
          parcel_id: submission.parcel_id,
          parcel_name: submission.parcel_name
        }
      });
      
      toast({
        title: "Parcelle approuvée",
        description: `La parcelle de ${submission.owner_name} est maintenant visible sur la plateforme`
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver la soumission de parcelle"
      });
    }
  };

  // Ouvrir modal pour rejeter une soumission
  const handleOpenRejectModal = (submission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    setIsRejectReasonModalOpen(true);
  };

  // Rejeter une soumission de parcelle
  const handleRejectSubmission = async () => {
    try {
      if (!selectedSubmission) return;
      
      // Mise à jour du statut de la parcelle
      await SupabaseDataService.updateParcel(selectedSubmission.parcel_id, { 
        status: 'rejected'
      });
      
      // Mettre à jour le statut de la soumission
      const updatedSubmissions = parcelSubmissions.map(sub => 
        sub.id === selectedSubmission.id ? { 
          ...sub, 
          status: 'rejected', 
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        } : sub
      );
      setParcelSubmissions(updatedSubmissions);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: selectedSubmission.owner_id,
        type: 'parcel_rejected',
        title: `Parcelle rejetée`,
        body: rejectionReason || `Votre parcelle "${selectedSubmission.parcel_name}" a été rejetée`,
        data: { 
          parcel_id: selectedSubmission.parcel_id,
          parcel_name: selectedSubmission.parcel_name,
          rejection_reason: rejectionReason
        }
      });
      
      toast({
        title: "Parcelle rejetée",
        description: `La soumission de ${selectedSubmission.owner_name} a été rejetée`
      });
      
      setIsRejectReasonModalOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter la soumission"
      });
    }
  };

  // Voir les images et documents
  const handleViewImages = (submission) => {
    setSelectedSubmission(submission);
    setIsViewImagesModalOpen(true);
  };

  if (loading && parcelSubmissions.length === 0) {
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
          <MapPin className="h-8 w-8" />
          Soumissions de Parcelles
        </h1>
        <p className="text-muted-foreground">
          Gérez les soumissions de parcelles par les utilisateurs et approuvez-les pour publication
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, propriétaire ou lieu..."
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
              onClick={loadParcelSubmissions}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des soumissions */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Parcelles</span>
              {statusFilter === 'pending' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {parcelSubmissions.filter(r => r.status === 'pending').length} en attente
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
                  <TableHead>Parcelle</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date soumission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="font-medium">{submission.parcel_name}</div>
                      </TableCell>
                      <TableCell>
                        {submission.owner_name}
                      </TableCell>
                      <TableCell>
                        {submission.location}
                      </TableCell>
                      <TableCell>
                        {submission.area}
                      </TableCell>
                      <TableCell>
                        {submission.price}
                      </TableCell>
                      <TableCell>
                        {submission.images && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewImages(submission)}
                            className="flex items-center gap-1"
                          >
                            <Images className="h-4 w-4" />
                            <span>{submission.images.length}</span>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                        )}
                        {submission.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                        )}
                        {submission.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('fr-FR') : 'Inconnue'}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleApproveSubmission(submission)}
                              className="text-green-600 hover:text-green-700"
                              title="Approuver la parcelle"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenRejectModal(submission)}
                              className="text-red-600 hover:text-red-700"
                              title="Rejeter la parcelle"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {submission.status !== 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewImages(submission)}
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
                    <TableCell colSpan={9} className="text-center py-4">
                      Aucune soumission de parcelle trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de visualisation des images */}
      <Dialog open={isViewImagesModalOpen} onOpenChange={setIsViewImagesModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Images et Documents</DialogTitle>
            <DialogDescription>
              {selectedSubmission ? (
                `Images et documents soumis pour la parcelle "${selectedSubmission.parcel_name}"`
              ) : (
                'Détails de la soumission'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Détails de la parcelle</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Nom:</span> {selectedSubmission.parcel_name}</p>
                      <p><span className="font-medium">Localisation:</span> {selectedSubmission.location}</p>
                      <p><span className="font-medium">Surface:</span> {selectedSubmission.area}</p>
                      <p><span className="font-medium">Prix:</span> {selectedSubmission.price}</p>
                      <p><span className="font-medium">Propriétaire:</span> {selectedSubmission.owner_name}</p>
                      <p><span className="font-medium">Date de soumission:</span> {new Date(selectedSubmission.submitted_at).toLocaleDateString('fr-FR')}</p>
                      {selectedSubmission.status === 'approved' && selectedSubmission.approved_at && (
                        <p><span className="font-medium">Date d'approbation:</span> {new Date(selectedSubmission.approved_at).toLocaleDateString('fr-FR')}</p>
                      )}
                      {selectedSubmission.status === 'rejected' && selectedSubmission.rejected_at && (
                        <p><span className="font-medium">Date de rejet:</span> {new Date(selectedSubmission.rejected_at).toLocaleDateString('fr-FR')}</p>
                      )}
                      <p>
                        <span className="font-medium">Statut:</span> 
                        <Badge 
                          className={
                            selectedSubmission.status === 'approved' ? "ml-2 bg-green-100 text-green-800" : 
                            selectedSubmission.status === 'pending' ? "ml-2 bg-yellow-100 text-yellow-800" : 
                            "ml-2 bg-red-100 text-red-800"
                          }
                        >
                          {selectedSubmission.status === 'approved' ? 'Approuvé' : 
                           selectedSubmission.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </Badge>
                      </p>
                    </div>
                  </Card>
                  
                  {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
                    <Card className="p-4 bg-red-50">
                      <h3 className="font-semibold text-lg mb-2">Raison du rejet</h3>
                      <p>{selectedSubmission.rejection_reason}</p>
                    </Card>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSubmission.images?.map((image, index) => (
                      <Card key={image.id || index} className="overflow-hidden">
                        <div className="relative">
                          <img 
                            src={image.url} 
                            alt={`Image ${index+1} de la parcelle`} 
                            className="w-full h-48 object-cover"
                          />
                          <Badge 
                            className={`absolute top-2 right-2 ${
                              image.verified ? "bg-green-100 text-green-800" : "bg-gray-100"
                            }`}
                          >
                            {image.verified ? "Vérifiée" : "Non vérifiée"}
                          </Badge>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <p className="text-sm">Image {index + 1}</p>
                          {selectedSubmission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  // Marquer l'image comme vérifiée
                                  const updatedImages = selectedSubmission.images.map((img, i) => 
                                    i === index ? { ...img, verified: true } : img
                                  );
                                  setSelectedSubmission(prev => ({ ...prev, images: updatedImages }));
                                }}
                                disabled={image.verified}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  // Marquer l'image comme rejetée
                                  const updatedImages = selectedSubmission.images.map((img, i) => 
                                    i === index ? { ...img, verified: false, rejected: true } : img
                                  );
                                  setSelectedSubmission(prev => ({ ...prev, images: updatedImages }));
                                }}
                                disabled={image.rejected}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmission.documents?.map((doc, index) => (
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
                          {selectedSubmission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  // Marquer le document comme vérifié
                                  const updatedDocs = selectedSubmission.documents.map((d, i) => 
                                    i === index ? { ...d, verified: true } : d
                                  );
                                  setSelectedSubmission(prev => ({ ...prev, documents: updatedDocs }));
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
                                  const updatedDocs = selectedSubmission.documents.map((d, i) => 
                                    i === index ? { ...d, verified: false, rejected: true } : d
                                  );
                                  setSelectedSubmission(prev => ({ ...prev, documents: updatedDocs }));
                                }}
                                disabled={doc.rejected}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Rejeter
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewImagesModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de rejet avec raison */}
      <Dialog open={isRejectReasonModalOpen} onOpenChange={setIsRejectReasonModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la soumission</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de la parcelle "{selectedSubmission?.parcel_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="rejection-reason">Raison du rejet</Label>
            <Textarea 
              id="rejection-reason" 
              placeholder="Expliquez pourquoi la soumission est rejetée..."
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
              onClick={handleRejectSubmission}
            >
              Rejeter la soumission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminParcelSubmissionsPage;
