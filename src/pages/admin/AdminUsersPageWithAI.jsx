import React, { useState, useEffect } from 'react';
import { Users, Bell, Search, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import supabase from "../../lib/supabaseClient";
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const AdminUsersPageWithAI = () => {
  
  
  /* REMOVED DUPLICATE */ ('');
const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
const { toast } = useToast();
  const { profile } = useAuth();
  // Loading géré par le hook temps réel
  const { data: users, loading: usersLoading, error: usersError, refetch } = useRealtimeUsers();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (users) {
      setFilteredData(users);
    }
  }, [users]);
  
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      calculateStats(data || []);
    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData) => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeUsers = userData.filter(u => 
      u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const byRole = userData.reduce((acc, user) => {
      const role = user.role || 'non_défini';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const recentRegistrations = userData.filter(u => 
      new Date(u.created_at) > lastWeek
    ).length;

    setStats({
      totalUsers: userData.length,
      activeUsers,
      inactiveUsers: userData.length - activeUsers,
      byRole,
      recentRegistrations
    });
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Vérifier les permissions admin
      if (profile?.role !== 'admin') {
        throw new Error('Permission insuffisante');
      }

      // Supprimer l'utilisateur (soft delete en changeant le statut)
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: profile.id
        })
        .eq('id', userToDelete.id);

      if (error) throw error;

      // Log de l'action
      await supabase.from('ai_actions_log').insert({
        action: 'DELETE_USER',
        details: {
          deleted_user: userToDelete,
          deleted_by: profile.id,
          method: 'manual'
        },
        user_id: profile.id,
        success: true
      });

      await loadUsers();

      toast({
        title: "Utilisateur supprimé",
        description: `${userToDelete.full_name} a été supprimé avec succés`,
      });

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
      });
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un utilisateur",
      });
      return;
    }

    try {
      switch (action) {
        case 'activate':
          await supabase
            .from('users')
            .update({ status: 'active' })
            .in('id', selectedUsers);
          break;
        case 'deactivate':
          await supabase
            .from('users')
            .update({ status: 'inactive' })
            .in('id', selectedUsers);
          break;
        case 'delete':
          await supabase
            .from('users')
            .update({ 
              status: 'deleted',
              deleted_at: new Date().toISOString(),
              deleted_by: profile.id
            })
            .in('id', selectedUsers);
          break;
      }

      await loadUsers();
      setSelectedUsers([]);

      toast({
        title: "Action exécutée",
        description: `${selectedUsers.length} utilisateur(s) traité(s)`,
      });

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exécuter l'action",
      });
    }
  };

  const generateReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        usersByRole: stats.byRole,
        recentRegistrations: stats.recentRegistrations,
        userList: users.map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role,
          status: u.status,
          lastSignIn: u.last_sign_in_at,
          createdAt: u.created_at
        }))
      };

      // Créer et télécharger le rapport
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_utilisateurs_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Rapport généré",
        description: "Le rapport des utilisateurs a été téléchargé",
      });

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le rapport",
      });
    }
  };

  const handleAIAction = async (actionType, result) => {
    switch (actionType) {
      case 'DELETE_USER':
        await loadUsers();
        toast({
          title: "Action IA exécutée",
          description: `${result.message}`,
        });
        break;
      case 'GENERATE_REPORT':
        await generateReport();
        break;
      case 'SEARCH_DATA':
        if (result.results) {
          setFilteredUsers(result.results);
        }
        break;
      default:
        await loadUsers();
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-téte */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Administration avancée avec IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inactiveUsers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouvelles inscriptions</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recentRegistrations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou réle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activer
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Désactiver
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{user.full_name || 'Nom non défini'}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{user.role || 'Non défini'}</Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status || 'Non défini'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* Ouvrir modal d'édition */}}
                  >
                    éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              étes-vous sér de vouloir supprimer l'utilisateur {userToDelete?.full_name} ?
              Cette action ne peut pas étre annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assistant IA */}
      <AIAssistantWidget 
        dashboardContext={{
          role: 'admin',
          page: 'users',
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          usersByRole: stats.byRole,
          selectedUsers: selectedUsers.length
        }}
        onAction={handleAIAction}
      />
    </div>
  );
};

export default AdminUsersPageWithAI;


