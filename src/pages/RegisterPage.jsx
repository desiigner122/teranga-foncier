// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { Users as UsersIcon, Briefcase, Building, Sprout, Banknote, Landmark, LandPlot, Store } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // IMPORTANT

const accountTypes = [
  { value: 'Particulier', label: 'Particulier (Acheteur)', icon: UsersIcon },
  { value: 'Vendeur', label: 'Vendeur', icon: Store },
  // ... (les autres types de compte restent les mêmes)
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('Particulier');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("La création du compte a échoué, veuillez réessayer.");

      // 2. Insérer le profil dans la table 'public.users'
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: name,
          email: email,
          type: accountType,
          role: 'user', // Rôle par défaut
          verification_status: 'not_verified', // Statut initial
        });

      if (profileError) throw profileError;

      // 3. Simuler l'envoi de l'email de confirmation
      console.log(`SIMULATION: Envoi d'un email de confirmation à ${email}.`);
      toast({
        title: "Email de confirmation (simulation)",
        description: "Un email a été envoyé pour confirmer votre inscription. Consultez votre boîte de réception.",
        duration: 7000,
      });
      
      toast({
        title: "Inscription réussie !",
        description: "Veuillez confirmer votre email avant de vous connecter.",
      });

      navigate('/login'); // Rediriger vers la page de connexion après l'inscription

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un Compte</CardTitle>
          <CardDescription>Rejoignez Teranga Foncier et sécurisez vos transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            {/* ... Le reste du formulaire reste identique ... */}
            <div className="grid gap-2">
              <Label htmlFor="accountType">Je suis un(e)</Label>
               <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger id="accountType" className="w-full">
                  <SelectValue placeholder="Sélectionnez un type de compte" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet ou Raison sociale</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer un compte'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-start text-sm">
           <div className="text-center w-full">
             Déjà un compte?{' '}
             <Link to="/login" className="underline">
               Connectez-vous
             </Link>
           </div>
         </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;