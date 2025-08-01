// src/pages/VerificationPage.jsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/spinner';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const UploadForm = ({ onFileChange, onSubmit, loading }) => (
    <Card className="w-full max-w-md"><CardHeader><CardTitle>Vérification de votre compte</CardTitle><CardDescription>Pour activer votre compte, veuillez soumettre une copie de votre carte d'identité (recto et verso).</CardDescription></CardHeader><CardContent className="space-y-6"><div className="space-y-2"><Label htmlFor="front-id">Recto de la carte d'identité</Label><Input id="front-id" type="file" onChange={(e) => onFileChange(e, 'front')} required /></div><div className="space-y-2"><Label htmlFor="back-id">Verso de la carte d'identité</Label><Input id="back-id" type="file" onChange={(e) => onFileChange(e, 'back')} required /></div><Button onClick={onSubmit} disabled={loading} className="w-full">{loading ? <LoadingSpinner size="small" /> : 'Soumettre pour vérification'}</Button></CardContent></Card>
);

const VerificationPage = () => {
  const { user, refreshUser } = useAuth(); // Utilise refreshUser
  const { toast } = useToast();
  const [frontIdFile, setFrontIdFile] = useState(null);
  const [backIdFile, setBackIdFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, side) => {
    if (e.target.files && e.target.files[0]) {
      if (side === 'front') setFrontIdFile(e.target.files[0]);
      else setBackIdFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!frontIdFile || !backIdFile || !user) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner les deux fichiers." });
      return;
    }
    setLoading(true);
    try {
      const frontFilePath = `${user.id}/${Date.now()}_front.png`;
      await supabase.storage.from('verification_documents').upload(frontFilePath, frontIdFile);
      const { data: { publicUrl: frontPublicUrl } } = supabase.storage.from('verification_documents').getPublicUrl(frontFilePath);

      const backFilePath = `${user.id}/${Date.now()}_back.png`;
      await supabase.storage.from('verification_documents').upload(backFilePath, backIdFile);
      const { data: { publicUrl: backPublicUrl } } = supabase.storage.from('verification_documents').getPublicUrl(backFilePath);

      await supabase.from('users').update({
          id_card_front_url: frontPublicUrl,
          id_card_back_url: backPublicUrl,
          verification_status: 'pending',
      }).eq('id', user.id);
      
      toast({ title: "Documents soumis", description: "Votre compte est en cours de vérification." });
      
      if (refreshUser) {
        await refreshUser(); // Force la mise à jour de l'état de l'utilisateur
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Erreur d'envoi", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (user?.verification_status) {
      case 'pending': return ( <Card className="w-full max-w-md text-center p-8"><CardHeader><ShieldCheck className="mx-auto h-12 w-12 text-yellow-500" /><CardTitle className="mt-4">Vérification en cours</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Vos documents sont en cours d'examen. Vous recevrez un e-mail une fois la vérification terminée.</p></CardContent></Card> );
      case 'rejected': return ( <div className="w-full max-w-md space-y-4"><div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"><div className="flex items-center"><AlertTriangle className="h-6 w-6 mr-3" /><div><p className="font-bold">Vérification Rejetée</p><p className="text-sm">Veuillez réessayer avec des images claires.</p></div></div></div><UploadForm onFileChange={handleFileChange} onSubmit={handleUpload} loading={loading} /></div> );
      default: return <UploadForm onFileChange={handleFileChange} onSubmit={handleUpload} loading={loading} />;
    }
  };

  return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">{renderContent()}</div>;
};
export default VerificationPage;