import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('land_evaluations')
          .select('id, parcels(reference, location), estimated_value, status, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEvaluations(data || []);
      } catch (e) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [toast]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Évaluations Foncières</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {evaluations.length === 0 ? (
            <p>Aucune évaluation trouvée.</p>
          ) : evaluations.map(ev => (
            <Card key={ev.id}>
              <CardHeader>
                <CardTitle>#{ev.id} - {ev.parcels?.reference || 'Parcelle inconnue'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">{ev.parcels?.location}</div>
                <div className="text-sm">Valeur estimée : <b>{ev.estimated_value ? ev.estimated_value.toLocaleString() + ' XOF' : '—'}</b></div>
                <div className="text-xs text-gray-500">Statut : {ev.status}</div>
                <div className="text-xs text-gray-400">Créé le {new Date(ev.created_at).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationsPage;
