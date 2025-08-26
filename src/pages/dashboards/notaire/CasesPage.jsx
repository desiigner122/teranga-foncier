import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';

const CasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('id, reference, status, client_name, created_at')
        .order('created_at', { ascending: false });
      setCases(data || []);
      setLoading(false);
    };
    fetchCases();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dossiers Notariaux</h1>
      {loading ? <LoadingSpinner /> : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <p className="text-gray-500">Aucun dossier trouvé.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Référence</th>
                    <th className="text-left">Client</th>
                    <th className="text-left">Statut</th>
                    <th className="text-left">Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(dossier => (
                    <tr key={dossier.id}>
                      <td>{dossier.reference || dossier.id}</td>
                      <td>{dossier.client_name || '-'}</td>
                      <td>{dossier.status}</td>
                      <td>{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
export default CasesPage;
