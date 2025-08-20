// src/pages/admin/AdminUsersPageAdvanced.jsx
// NOTE: Supports deep-link filtering via query param ?type=Vendeur (etc.).
// The select stays in sync with the URL and allows dashboard cards to link directly.
import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExceptionalAddUserDialog from '@/components/admin/roles/ExceptionalAddUserDialog';
import RolesPermissionsPanel from '@/components/admin/roles/RolesPermissionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, UserCheck, Trash2, Edit, MoreHorizontal, Shield, UserX, CheckCircle2, XCircle, Clock, 
  User as UserIcon, FileCheck, UserCog, FileBadge, AlertTriangle, Eye, FileText, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const userTypes = [
  'Particulier', 'Vendeur', 'Investisseur', 'Promoteur', 'Agriculteur', 
  'Banque', 'Notaire', 'Mairie', 'Agent', 'Administrateur'
];

const userRoles = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Administrateur' }
];

const verificationStatuses = [
  { value: 'not_verified', label: 'Non vérifié' },
  { value: 'pending', label: 'En attente' },
  { value: 'verified', label: 'Vérifié' },
  { value: 'rejected', label: 'Rejeté' }
];

const AdminUsersPageAdvanced = () => {
  const { toast } = useToast();
  const { data: users, loading: usersLoading, error: usersError, refetch } = useRealtimeUsers();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (users) {
      setFilteredData(users);
    }
  }, [users]);
  
  useEffect(() => {
    loadUsers();
    loadTypeChangeRequests();
    loadParcelSubmissions();
  }, []);

  // Sync filter with query param ?type=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam && userTypes.includes(typeParam) && typeParam !== filterType) {
      setFilterType(typeParam);
    } else if (!typeParam && filterType !== 'all') {
      // If query removed externally, reset to all
      setFilterType('all');
    }
  }, [location.search]);

  // When filterType changes via UI, push to URL (except 'all')
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const current = params.get('type');
    if (filterType === 'all' && current) {
      params.delete('type');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    } else if (filterType !== 'all' && filterType !== current) {
      params.set('type', filterType);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [filterType]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType, activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, allRoles, allUserRoles] = await Promise.all([
        SupabaseDataService.getUsers(),
        SupabaseDataService.listRoles(),
        SupabaseDataService.listAllUserRoles()
      ]);
      setUsers(allUsers);
      setAvailableRoles(allRoles);
      const grouped = {};
      (allUserRoles||[]).forEach(r => {
        if (!grouped[r.user_id]) grouped[r.user_id] = [];
        grouped[r.user_id].push(r);
      });
      setUserRolesMap(grouped);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les demandes de changement de type
  const loadTypeChangeRequests = async () => {
    try {
      // Simulation pour le moment - serait remplacé par un appel API réel
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
        }
      ];
      setTypeChangeRequests(mockRequests);
    } catch (error) {
      console.error('Erreur chargement demandes changement type:', error);
    }
  };

  // Charger les soumissions de parcelles
  const loadParcelSubmissions = async () => {
    try {
      // Simulation pour le moment - serait remplacé par un appel API réel
      const mockSubmissions = [
        {
          id: 'sub-1',
          user_id: 'user-3',
          user_name: 'Ousmane Ndiaye',
          reference: 'PAR-2508-A1',
          status: 'pending',
          submitted_at: '2025-08-14T09:20:00Z',
          location: 'Dakar, Sacré-Cœur',
          price: 25000000,
          surface: 450,
          documents: [
            { id: 'doc-6', name: 'Titre foncier', url: '#', verified: false },
            { id: 'doc-7', name: 'Plan cadastral', url: '#', verified: false },
            { id: 'doc-8', name: 'Certificat de propriété', url: '#', verified: false }
          ]
        },
        {
          id: 'sub-2',
          user_id: 'user-4',
          user_name: 'Moussa Sall',
          reference: 'PAR-2508-B2',
          status: 'pending',
          submitted_at: '2025-08-16T11:45:00Z',
          location: 'Thiès, Zone résidentielle',
          price: 18500000,
          surface: 320,
          documents: [
            { id: 'doc-9', name: 'Titre foncier', url: '#', verified: false },
            { id: 'doc-10', name: 'Plan cadastral', url: '#', verified: false }
          ]
        }
      ];
      setParcelSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Erreur chargement soumissions parcelles:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.type === filterType);
    }

    // Filtres par onglet
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'pending':
          filtered = filtered.filter(user => user.verification_status === 'pending');
          break;
        case 'verified':
          filtered = filtered.filter(user => user.verification_status === 'verified');
          break;
        case 'rejected':
          filtered = filtered.filter(user => user.verification_status === 'rejected');
          break;
        case 'not_verified':
          filtered = filtered.filter(user => user.verification_status === 'not_verified' || !user.verification_status);
          break;
      }
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      type: user.type || '',
      role: user.role || 'user',
      phone: user.phone || '',
      location: user.location || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Changer statut vérification
  const handleStatusChange = async (user, newStatus) => {
    try {
      await SupabaseDataService.updateUser(user.id, { verification_status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verification_status: newStatus } : u));
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: user.id,
        type: 'status_change',
        title: `Statut de vérification mis à jour`,
        body: `Votre statut de vérification est maintenant: ${newStatus === 'verified' ? 'Vérifié' : newStatus === 'pending' ? 'En attente' : newStatus === 'rejected' ? 'Rejeté' : 'Non vérifié'}`,
        data: { status: newStatus, comment: changeStatusComment }
      });
      
      toast({ 
        title: 'Statut mis à jour', 
        description: `${user.email} → ${newStatus}${changeStatusComment ? ' avec commentaire' : ''}` 
      });
      
      setChangeStatusComment('');
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Changement de statut impossible' });
    }
  };

  // Assigner rôle
  const handleAssignRole = async (user, newRole) => {
    try {
      // Single legacy role update retained for backward compatibility
      await SupabaseDataService.updateUser(user.id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast({ title: 'Rôle principal mis à jour', description: `${user.email} → ${newRole}` });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Changement de rôle impossible' });
    }
  };

  // Ouvrir modal pour changement de type
  const handleOpenChangeTypeModal = (user) => {
    setSelectedUser(user);
    setChangeTypeForm({
      current_type: user.type || 'Particulier',
      new_type: '',
      comment: '',
      documents: []
    });
    setIsChangeTypeModalOpen(true);
  };

  // Approuver une demande de changement de type
  const handleApproveTypeChange = async (request) => {
    try {
      // Mise à jour du type d'utilisateur
      const userId = request.user_id;
      const userToUpdate = users.find(u => u.id === userId);
      
      if (userToUpdate) {
        await SupabaseDataService.updateUser(userId, { 
          type: request.requested_type 
        });
        
        // Mettre à jour la liste locale
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, type: request.requested_type } : u
        ));
        
        // Mettre à jour le statut de la demande
        const updatedRequests = typeChangeRequests.map(req => 
          req.id === request.id ? { ...req, status: 'approved' } : req
        );
        setTypeChangeRequests(updatedRequests);
        
        // Créer une notification pour l'utilisateur
        await SupabaseDataService.createNotification({
          userId: userId,
          type: 'type_change_approved',
          title: `Demande de changement de type approuvée`,
          body: `Votre compte est maintenant de type ${request.requested_type}`,
          data: { 
            previous_type: request.current_type,
            new_type: request.requested_type
          }
        });
        
        toast({
          title: "Type modifié",
          description: `${userToUpdate.full_name || userToUpdate.email} est maintenant ${request.requested_type}`
        });
      }
    } catch (error) {
      console.error('Erreur lors du changement de type:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de changer le type d'utilisateur"
      });
    }
  };

  // Rejeter une demande de changement de type
  const handleRejectTypeChange = async (request, comment = '') => {
    try {
      // Mettre à jour le statut de la demande
      const updatedRequests = typeChangeRequests.map(req => 
        req.id === request.id ? { ...req, status: 'rejected', rejection_reason: comment } : req
      );
      setTypeChangeRequests(updatedRequests);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: request.user_id,
        type: 'type_change_rejected',
        title: `Demande de changement de type rejetée`,
        body: comment || `Votre demande de changement vers ${request.requested_type} a été rejetée`,
        data: { 
          requested_type: request.requested_type,
          rejection_reason: comment
        }
      });
      
      toast({
        title: "Demande rejetée",
        description: `La demande de ${request.user_name} a été rejetée`
      });
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter la demande"
      });
    }
  };

  // Approuver une soumission de parcelle
  const handleApproveParcelSubmission = async (submission) => {
    try {
      // Mettre à jour le statut de la soumission
      const updatedSubmissions = parcelSubmissions.map(sub => 
        sub.id === submission.id ? { ...sub, status: 'approved' } : sub
      );
      setParcelSubmissions(updatedSubmissions);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: submission.user_id,
        type: 'parcel_submission_approved',
        title: `Parcelle approuvée`,
        body: `Votre parcelle ${submission.reference} a été approuvée et est maintenant visible publiquement`,
        data: { 
          reference: submission.reference,
          location: submission.location
        }
      });
      
      toast({
        title: "Parcelle approuvée",
        description: `La parcelle ${submission.reference} est maintenant publiée`
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la parcelle:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver la parcelle"
      });
    }
  };

  // Rejeter une soumission de parcelle
  const handleRejectParcelSubmission = async (submission, comment = '') => {
    try {
      // Mettre à jour le statut de la soumission
      const updatedSubmissions = parcelSubmissions.map(sub => 
        sub.id === submission.id ? { ...sub, status: 'rejected', rejection_reason: comment } : sub
      );
      setParcelSubmissions(updatedSubmissions);
      
      // Créer une notification pour l'utilisateur
      await SupabaseDataService.createNotification({
        userId: submission.user_id,
        type: 'parcel_submission_rejected',
        title: `Parcelle rejetée`,
        body: comment || `Votre parcelle ${submission.reference} a été rejetée`,
        data: { 
          reference: submission.reference,
          rejection_reason: comment
        }
      });
      
      toast({
        title: "Parcelle rejetée",
        description: `La parcelle ${submission.reference} a été rejetée`
      });
    } catch (error) {
      console.error('Erreur lors du rejet de la parcelle:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter la parcelle"
      });
    }
  };

  // Voir les documents d'un utilisateur ou d'une demande
  const handleViewDocuments = (documents) => {
    setSelectedUser({ documents });
    setIsViewDocumentsModalOpen(true);
  };

  // Multi-role assignment handlers
  const handleAddUserRole = async (userId, roleKey) => {
    try {
      await SupabaseDataService.assignRole(userId, roleKey);
      setUserRolesMap(prev => {
        const existing = prev[userId] ? [...prev[userId]] : [];
        existing.push({ user_id: userId, role_key: roleKey });
        return { ...prev, [userId]: existing };
      });
      toast({ title: 'Rôle assigné', description: roleKey });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Assignation échouée' });
    }
  };
  const handleRevokeUserRole = async (userId, roleKey) => {
    try {
      await SupabaseDataService.revokeRole(userId, roleKey);
      setUserRolesMap(prev => ({
        ...prev,
        [userId]: (prev[userId]||[]).filter(r => r.role_key !== roleKey)
      }));
      toast({ title: 'Rôle révoqué', description: roleKey });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Révocation échouée' });
    }
  };

  const confirmEditUser = async () => {
    try {
      await SupabaseDataService.updateUser(selectedUser.id, editForm);
      
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? { ...user, ...editForm } : user
      ));

      toast({
        title: "Utilisateur modifié",
        description: `Les informations de ${editForm.full_name} ont été mises à jour.`
      });

      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur modification utilisateur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur"
      });
    }
  };

  const confirmDeleteUser = async () => {
    try {
      await SupabaseDataService.deleteUser(selectedUser.id);
      
      // Supprimer de la liste locale
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));

      toast({
        title: "Utilisateur supprimé",
        description: `${selectedUser.full_name || selectedUser.email} a été supprimé.`
      });

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">Non vérifié</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800"><UserCheck className="w-3 h-3 mr-1" />Agent</Badge>;
      default:
        return <Badge variant="outline">Utilisateur</Badge>;
    }
  };

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
          <Users className="h-8 w-8" />
          Gestion des Utilisateurs
        </h1>
        <p className="text-muted-foreground">
          Gérez tous les utilisateurs de la plateforme, les demandes de changement de type, et les soumissions de parcelles
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={()=>setIsExceptionalDialogOpen(true)}>
            + Ajout exceptionnel
          </Button>
        </div>
      </div>
      
      {/* Interface à onglets principale */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="users">
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="typeRequests" onClick={loadTypeChangeRequests}>
            Demandes de Type
            {typeChangeRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {typeChangeRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="parcels" onClick={loadParcelSubmissions}>
            Parcelles
            {parcelSubmissions.filter(p => p.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {parcelSubmissions.filter(p => p.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents
          </TabsTrigger>
        </TabsList>
        
        {/* Contenu onglet Utilisateurs */}
        <TabsContent value="users">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {userTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des utilisateurs */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                Utilisateurs ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Rôles multiples</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'Nom non défini'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.type || 'Non défini'}</Badge>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(userRolesMap[user.id]||[]).map(r => (
                            <span key={r.role_key} className="px-2 py-0.5 rounded bg-muted text-xs flex items-center gap-1">
                              {r.role_key}
                              <button
                                onClick={() => handleRevokeUserRole(user.id, r.role_key)}
                                className="text-[10px] hover:text-red-600"
                                aria-label={`Révoquer ${r.role_key}`}
                              >×</button>
                            </span>
                          ))}
                          <Button size="xs" variant="ghost" onClick={()=> setAssigningForUser(user)}>+</Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.verification_status)}
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnue'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenChangeTypeModal(user)}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Changer le type
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user, 'pending')} disabled={user.verification_status === 'pending'}>
                              <Clock className="h-4 w-4 mr-2" /> Marquer En attente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user, 'verified')} disabled={user.verification_status === 'verified'}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Vérifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user, 'rejected')} disabled={user.verification_status === 'rejected'}>
                              <XCircle className="h-4 w-4 mr-2 text-red-600" /> Rejeter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAssignRole(user, 'admin')} disabled={user.role === 'admin'}>
                              <Shield className="h-4 w-4 mr-2" /> Assigner Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignRole(user, 'agent')} disabled={user.role === 'agent'}>
                              <UserCheck className="h-4 w-4 mr-2" /> Assigner Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignRole(user, 'user')} disabled={user.role === 'user'}>
                              <UserIcon className="h-4 w-4 mr-2" /> Assigner Utilisateur
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu onglet Demandes de Type */}
        <TabsContent value="typeRequests">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  defaultValue="pending"
                  onValueChange={(value) => {
                    const filteredRequests = value === 'all' 
                      ? typeChangeRequests 
                      : typeChangeRequests.filter(request => request.status === value);
                    setFilteredUsers(filteredRequests);
                  }}
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                Demandes de changement de type 
                {typeChangeRequests.filter(r => r.status === 'pending').length > 0 && 
                  ` (${typeChangeRequests.filter(r => r.status === 'pending').length} en attente)`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type actuel</TableHead>
                    <TableHead>Type demandé</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeChangeRequests.length > 0 ? (
                    typeChangeRequests.map(request => (
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
                              onClick={() => handleViewDocuments(request.documents)}
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
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRejectTypeChange(request)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu onglet Parcelles */}
        <TabsContent value="parcels">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par référence ou emplacement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  defaultValue="pending"
                  onValueChange={(value) => {
                    const filteredSubmissions = value === 'all' 
                      ? parcelSubmissions 
                      : parcelSubmissions.filter(parcel => parcel.status === value);
                    setFilteredUsers(filteredSubmissions);
                  }}
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                Soumissions de parcelles
                {parcelSubmissions.filter(p => p.status === 'pending').length > 0 && 
                  ` (${parcelSubmissions.filter(p => p.status === 'pending').length} en attente)`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelSubmissions.length > 0 ? (
                    parcelSubmissions.map(parcel => (
                      <TableRow key={parcel.id}>
                        <TableCell>
                          <div className="font-medium">{parcel.reference}</div>
                        </TableCell>
                        <TableCell>{parcel.user_name}</TableCell>
                        <TableCell>{parcel.location}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-SN', { 
                            style: 'currency', 
                            currency: 'XOF',
                            minimumFractionDigits: 0
                          }).format(parcel.price)}
                        </TableCell>
                        <TableCell>
                          {parcel.documents && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDocuments(parcel.documents)}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{parcel.documents.length}</span>
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {parcel.status === 'approved' && (
                            <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                          )}
                          {parcel.status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                          )}
                          {parcel.status === 'rejected' && (
                            <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {parcel.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleApproveParcelSubmission(parcel)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRejectParcelSubmission(parcel)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Aucune soumission de parcelle trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenu onglet Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>
                Gestion des Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gestion avancée des documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Fonctionnalités à venir:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Archivage automatique</li>
                      <li>Vérification par IA des documents</li>
                      <li>Détection des fraudes</li>
                      <li>Système de catégorisation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {userTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Rôles multiples</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'Nom non défini'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.type || 'Non défini'}</Badge>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(userRolesMap[user.id]||[]).map(r => (
                        <span key={r.role_key} className="px-2 py-0.5 rounded bg-muted text-xs flex items-center gap-1">
                          {r.role_key}
                          <button
                            onClick={() => handleRevokeUserRole(user.id, r.role_key)}
                            className="text-[10px] hover:text-red-600"
                            aria-label={`Révoquer ${r.role_key}`}
                          >×</button>
                        </span>
                      ))}
                      <Button size="xs" variant="ghost" onClick={()=> setAssigningForUser(user)}>+</Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.verification_status)}
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnue'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user, 'pending')} disabled={user.verification_status === 'pending'}>
                          <Clock className="h-4 w-4 mr-2" /> Marquer En attente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user, 'verified')} disabled={user.verification_status === 'verified'}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Vérifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user, 'rejected')} disabled={user.verification_status === 'rejected'}>
                          <XCircle className="h-4 w-4 mr-2 text-red-600" /> Rejeter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAssignRole(user, 'admin')} disabled={user.role === 'admin'}>
                          <Shield className="h-4 w-4 mr-2" /> Assigner Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignRole(user, 'agent')} disabled={user.role === 'agent'}>
                          <UserCheck className="h-4 w-4 mr-2" /> Assigner Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignRole(user, 'user')} disabled={user.role === 'user'}>
                          <UserIcon className="h-4 w-4 mr-2" /> Assigner Utilisateur
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="type">Type d'utilisateur</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmEditUser}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedUser?.full_name || selectedUser?.email} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exceptional Add Dialog */}
      <ExceptionalAddUserDialog
        open={isExceptionalDialogOpen}
        onOpenChange={(o)=> setIsExceptionalDialogOpen(o)}
        onCreated={(created)=> { setUsers(prev=>[created, ...prev]); }}
      />

      {/* Multi-role assignment dialog */}
      <Dialog open={!!assigningForUser} onOpenChange={(o)=>{ if(!o) setAssigningForUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer les rôles</DialogTitle>
            <DialogDescription>
              {assigningForUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Rôles actuels</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(userRolesMap[assigningForUser?.id]||[]).length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucun rôle additionnel</p>
                )}
                {(userRolesMap[assigningForUser?.id]||[]).map(r => (
                  <span key={r.role_key} className="px-2 py-0.5 rounded bg-muted text-xs flex items-center gap-1">
                    {r.role_key}
                    <button
                      onClick={() => handleRevokeUserRole(assigningForUser.id, r.role_key)}
                      className="text-[10px] hover:text-red-600"
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label>Ajouter un rôle</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {availableRoles.filter(r => !(userRolesMap[assigningForUser?.id]||[]).some(ur => ur.role_key === r.key)).map(r => (
                  <Button key={r.key} size="sm" variant="outline" onClick={()=> handleAddUserRole(assigningForUser.id, r.key)}>
                    {r.key}
                  </Button>
                ))}
                {availableRoles.length === 0 && <p className="text-xs text-muted-foreground">Aucun rôle disponible</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setAssigningForUser(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualisation des documents */}
      <Dialog open={isViewDocumentsModalOpen} onOpenChange={setIsViewDocumentsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Documents</DialogTitle>
            <DialogDescription>
              Vérification des documents soumis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedUser?.documents?.length > 0 ? (
              selectedUser.documents.map((doc, index) => (
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => {
                          // Marquer le document comme vérifié
                          const updatedDocs = selectedUser.documents.map((d, i) => 
                            i === index ? { ...d, verified: true } : d
                          );
                          setSelectedUser(prev => ({ ...prev, documents: updatedDocs }));
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
                          const updatedDocs = selectedUser.documents.map((d, i) => 
                            i === index ? { ...d, verified: false, rejected: true } : d
                          );
                          setSelectedUser(prev => ({ ...prev, documents: updatedDocs }));
                        }}
                        disabled={doc.rejected}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Aucun document disponible</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDocumentsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de changement de type */}
      <Dialog open={isChangeTypeModalOpen} onOpenChange={setIsChangeTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le type d'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier le type de {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current_type">Type actuel</Label>
              <Input
                id="current_type"
                value={changeTypeForm.current_type}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="new_type">Nouveau type</Label>
              <Select 
                value={changeTypeForm.new_type} 
                onValueChange={(value) => setChangeTypeForm(prev => ({ ...prev, new_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes
                    .filter(type => type !== changeTypeForm.current_type)
                    .map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Raison du changement de type..."
                value={changeTypeForm.comment}
                onChange={(e) => setChangeTypeForm(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeTypeModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={async () => {
                if (!changeTypeForm.new_type) {
                  toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Veuillez sélectionner un nouveau type"
                  });
                  return;
                }
                
                try {
                  await SupabaseDataService.updateUser(selectedUser.id, { 
                    type: changeTypeForm.new_type 
                  });
                  
                  // Mettre à jour la liste locale
                  setUsers(prev => prev.map(u => 
                    u.id === selectedUser.id ? { ...u, type: changeTypeForm.new_type } : u
                  ));
                  
                  toast({
                    title: "Type modifié",
                    description: `${selectedUser.full_name || selectedUser.email} est maintenant ${changeTypeForm.new_type}`
                  });
                  
                  setIsChangeTypeModalOpen(false);
                } catch (error) {
                  console.error('Erreur lors du changement de type:', error);
                  toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Impossible de changer le type d'utilisateur"
                  });
                }
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles & Permissions Panel */}
      <RolesPermissionsPanel />
    </motion.div>
  );
};

export default AdminUsersPageAdvanced;
