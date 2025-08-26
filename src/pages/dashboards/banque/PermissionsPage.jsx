import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPermission, setNewPermission] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('permissions').select('*').eq('entity_type', 'banque').order('name');
      setPermissions(data || []);
      setLoading(false);
    };
    fetchPermissions();
  }, []);

  const handleAddPermission = async e => {
    e.preventDefault();
    if (!newPermission.trim()) return;
    const { error } = await supabase.from('permissions').insert([{ name: newPermission.trim(), entity_type: 'banque' }]);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setNewPermission('');
      toast({ title: 'Permission ajoutée' });
      const { data } = await supabase.from('permissions').select('*').eq('entity_type', 'banque').order('name');
      setPermissions(data || []);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des permissions Banque</h1>
      <form onSubmit={handleAddPermission} className="flex gap-2 mb-4">
        <input value={newPermission} onChange={e=>setNewPermission(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="Nouvelle permission..." />
        <Button type="submit">Ajouter</Button>
      </form>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {permissions.length === 0 ? <p>Aucune permission.</p> : permissions.map(permission => (
            <Card key={permission.id}>
              <CardHeader><CardTitle>{permission.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">ID: {permission.id}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
