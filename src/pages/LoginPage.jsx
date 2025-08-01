// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [type, setType] = useState('Particulier'); // Exemple : menu déroulant pour type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Étape 1 : Créer le compte dans Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Étape 2 : Créer le profil dans la table users
      const { error: profileError } = await supabase.from('users').insert({
        id: user.id, // Utiliser l'ID de l'utilisateur Supabase
        email,
        full_name: fullName,
        type,
        verification_status: 'not_verified',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      toast({ title: "Inscription réussie !", description: "Veuillez vérifier votre email." });
      navigate('/verify'); // Rediriger vers la page de vérification

    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-screen px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
          <CardDescription>Créez votre compte Teranga Foncier</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de compte</Label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)} disabled={loading} className="w-full p-2 border rounded">
                <option value="Particulier">Particulier</option>
                <option value="Vendeur">Vendeur</option>
                <option value="Mairie">Mairie</option>
                <option value="Banque">Banque</option>
                <option value="Notaire">Notaire</option>
              </select>
            </div>
            {error && (
              <div className="flex items-center p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0"/>
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;