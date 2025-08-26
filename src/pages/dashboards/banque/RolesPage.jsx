import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('roles').select('*').eq('entity_type', 'banque').order('name');
      setRoles(data || []);
      setLoading(false);
    };
    fetchRoles();
  }, []);

  const handleAddRole = async e => {
    e.preventDefault();
    if (!newRole.trim()) return;
    const { error } = await supabase.from('roles').insert([{ name: newRole.trim(), entity_type: 'banque' }]);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setNewRole('');
      toast({ title: 'Rôle ajouté' });
      const { data } = await supabase.from('roles').select('*').eq('entity_type', 'banque').order('name');
      setRoles(data || []);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des rôles Banque</h1>
      <form onSubmit={handleAddRole} className="flex gap-2 mb-4">
        <input value={newRole} onChange={e=>setNewRole(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="Nouveau rôle..." />
        <Button type="submit">Ajouter</Button>
      </form>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {roles.length === 0 ? <p>Aucun rôle.</p> : roles.map(role => (
            <Card key={role.id}>
              <CardHeader><CardTitle>{role.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">ID: {role.id}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesPage;
