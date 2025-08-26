import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const DossiersPage = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDossiers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('dossiers')
          .select('id, title, status, created_at, updated_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setDossiers(data || []);
      } catch (e) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, [toast]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dossiers Banque</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dossiers.length === 0 ? (
            <p>Aucun dossier trouvé.</p>
          ) : dossiers.map(dossier => (
            <Card key={dossier.id}>
              <CardHeader>
                <CardTitle>{dossier.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Statut : {dossier.status}</div>
                <div className="text-xs text-gray-500">Créé le {new Date(dossier.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400">Mis à jour le {new Date(dossier.updated_at).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DossiersPage;
