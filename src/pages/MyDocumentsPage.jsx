import React, { useEffect, useState } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { UploadCloud, FileText, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MyDocumentsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  // Loading géré par le hook temps réel
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const loadDocs = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const list = await SupabaseDataService.getUserDocuments(user.id);
    setDocs(list);
    setLoading(false);
  };

  useEffect(()=>{ loadDocs(); }, [isAuthenticated]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const uploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        try { await SupabaseDataService.uploadDocument(user.id, f); } catch (err) { /* individual failure logged */ }
      }
      toast({ title:'Upload terminé', description:'Documents ajoutés.' });
      setFiles([]);
      loadDocs();
    } catch (e) {
      toast({ title:'Erreur', description:'Echec upload global', variant:'destructive' });
    } finally { setUploading(false); }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Mes Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
            <p className="text-sm mb-2">Sélectionnez des documents à téléverser (PDF, JPG, PNG)</p>
            <Input type="file" multiple onChange={handleFileChange} />
            {files.length>0 && <p className="text-xs mt-2">{files.length} fichier(s) prêt(s).</p>}
            <Button className="mt-4" disabled={!files.length || uploading} onClick={uploadAll}>{uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Upload...</> : 'Téléverser'}</Button>
          </div>
          <hr />
          {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
            <div className="grid md:grid-cols-3 gap-4">
              {docs.map(d => (
                <div key={d.id} className="border rounded-md p-3 text-sm space-y-1 bg-card shadow-sm">
                  <p className="font-medium truncate" title={d.name}>{d.name}</p>
                  <p className="text-xs text-muted-foreground">{(d.file_size/1024).toFixed(1)} KB • {d.mime_type}</p>
                  <p className="text-xs">Catégorie: {d.category || 'N/A'}</p>
                  {d.verified && <p className="text-green-600 text-xs font-semibold">Vérifié</p>}
                </div>
              ))}
              {!docs.length && <p className="col-span-full text-xs text-muted-foreground">Aucun document.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDocumentsPage;

