import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const UserRolesPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: usersData } = await supabase.from('users').select('id, full_name, email, role').eq('entity_type', 'banque');
      const { data: rolesData } = await supabase.from('roles').select('*').eq('entity_type', 'banque');
      setUsers(usersData || []);
      setRoles(rolesData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: 'Rôle mis à jour' });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Affectation des rôles Banque</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {users.length === 0 ? <p>Aucun utilisateur.</p> : users.map(user => (
            <Card key={user.id}>
              <CardHeader><CardTitle>{user.full_name} <span className="text-xs text-gray-400">({user.email})</span></CardTitle></CardHeader>
              <CardContent>
                <select value={user.role || ''} onChange={e => handleRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Aucun</option>
                  {roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                </select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRolesPage;
