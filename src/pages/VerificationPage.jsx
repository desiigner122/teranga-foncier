// src/pages/VerificationPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerificationPage = () => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const bucketPublicUrl = supabase.storage.from('identity-documents').publicUrl; // Remplacez par l'URL publique correcte si nécessaire

  const handleFileUpload = async (file, type) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('identity-documents')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;
    return fileName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!frontFile || !backFile) {
        throw new Error('Veuillez fournir les deux côtés de votre carte d\'identité.');
      }

      // Étape 1 : Télécharger les fichiers
      const frontPath = await handleFileUpload(frontFile, 'front');
      const backPath = await handleFileUpload(backFile, 'back');

      // Étape 2 : Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          id_card_front_url: `${bucketPublicUrl}/${frontPath}`,
          id_card_back_url: `${bucketPublicUrl}/${backPath}`,
          verification_status: 'pending',
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Étape 3 : Rafraîchir l'état de l'utilisateur
      await refreshUser();

      toast({ title: "Documents envoyés !", description: "Votre demande est en attente de vérification." });
      navigate('/dashboard'); // Rediriger vers le tableau de bord

    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'envoi des documents.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  if (user.verification_status === 'verified') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Vérification Complète</CardTitle>
            <CardDescription>Votre compte est déjà vérifié.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
            <Button onClick={() => navigate('/dashboard')}>Aller au tableau de bord</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-screen px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Vérification d'Identité</CardTitle>
          <CardDescription>Veuillez soumettre les documents requis pour vérifier votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front">Recto de la carte d'identité</Label>
              <Input id="front" type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files[0])} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Verso de la carte d'identité</Label>
              <Input id="back" type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files[0])} disabled={loading} />
            </div>
            {error && (
              <div className="flex items-center p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0"/>
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !frontFile || !backFile}>
              {loading ? 'Envoi en cours...' : <><Upload className="mr-2 h-4 w-4"/>Envoyer les documents</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationPage;