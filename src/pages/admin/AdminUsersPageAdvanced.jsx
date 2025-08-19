// src/pages/admin/AdminUsersPageAdvanced.jsx
// NOTE: Supports deep-link filtering via query param ?type=Vendeur (etc.).
// The select stays in sync with the URL and allows dashboard cards to link directly.
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExceptionalAddUserDialog from '@/components/admin/roles/ExceptionalAddUserDialog';
import RolesPermissionsPanel from '@/components/admin/roles/RolesPermissionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserCheck, Trash2, Edit, MoreHorizontal, Shield, UserX, CheckCircle2, XCircle, Clock, User as UserIcon
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
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';

const userTypes = [
  'Particulier', 'Vendeur', 'Investisseur', 'Promoteur', 'Agriculteur', 
  'Banque', 'Notaire', 'Mairie', 'Agent', 'Administrateur'
];

const userRoles = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'agent', label: 'Agent' },
  { value: 'admin', label: 'Administrateur' }
];

const AdminUsersPageAdvanced = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userRolesMap, setUserRolesMap] = useState({}); // user_id -> array of role objects
  const [availableRoles, setAvailableRoles] = useState([]); // list of all roles for assignment
  const [assigningForUser, setAssigningForUser] = useState(null); // user object when opening multi-role dialog
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isExceptionalDialogOpen, setIsExceptionalDialogOpen] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    type: '',
    role: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    loadUsers();
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
  }, [users, searchTerm, filterType]);

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
      toast({ title: 'Statut mis à jour', description: `${user.email} → ${newStatus}` });
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

  if (loading) {
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
          Gérez tous les utilisateurs de la plateforme
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={()=>setIsExceptionalDialogOpen(true)}>
            + Ajout exceptionnel
          </Button>
        </div>
      </div>

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

  {/* Roles & Permissions Panel */}
  <RolesPermissionsPanel />
    </motion.div>
  );
};

export default AdminUsersPageAdvanced;
