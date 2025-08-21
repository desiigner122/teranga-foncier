import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export default function AdminUsersManagement() {
  
  const [loading, setLoading] = useState(false);
const { toast } = useToast();
  const { data: users, loading: usersLoading, error: usersError, refetch } = useRealtimeUsers();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (users) {
      setFilteredData(users);
    }
  }, [users]);
  
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await ExtendedSupabaseDataService.getUsers(500);
      setUsers(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await ExtendedSupabaseDataService.listRoles();
      setRoles(data);
    } catch (error) {    }
  };

  const handleUserCreated = (user) => {
    fetchUsers();
  };

  const usersByRole = users.reduce((acc, user) => {
    const role = user.role || 'user';
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  const roleOrder = [
    'admin', 
    'agent', 
    'user'
  ];

  const sortedRoles = [...new Set([...roleOrder, ...Object.keys(usersByRole)])];

  const filteredUsers = activeTab === 'tous' 
    ? users 
    : users.filter(user => user.role === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          Ajouter un utilisateur
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted overflow-x-auto flex-wrap">
          <TabsTrigger value="tous">Tous ({users.length})</TabsTrigger>
          {sortedTypes.map(type => (
            usersByType[type] && usersByType[type].length > 0 && (
              <TabsTrigger key={type} value={type}>
                {type} ({usersByType[type].length})
              </TabsTrigger>
            )
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center p-6">
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="bg-muted pb-2">
                    <CardTitle className="text-base flex justify-between items-start">
                      <span className="truncate max-w-[200px]">{user.full_name || user.email}</span>
                      <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">
                        {user.role || 'user'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-sm">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="col-span-2 truncate">{user.email}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Rôle:</span>
                        <span className="col-span-2">{user.role || 'user'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Vérification:</span>
                        <span className={`col-span-2 ${user.verification_status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                          {user.verification_status === 'verified' ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Créé le:</span>
                        <span className="col-span-2">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                      {/* Actions supplémentaires peuvent être ajoutées ici */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ExceptionalAddUserDialogWithPassword
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleUserCreated}
      />
    </div>
  );
}
