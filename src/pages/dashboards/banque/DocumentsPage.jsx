import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, name, type, url, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setDocuments(data || []);
      } catch (e) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [toast]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documents Banque</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.length === 0 ? (
            <p>Aucun document trouvé.</p>
          ) : documents.map(doc => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle>{doc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Type : {doc.type}</div>
                <div className="text-xs text-gray-500">Ajouté le {new Date(doc.created_at).toLocaleDateString()}</div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Télécharger</a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
