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
import { supabase } from '@/lib/supabaseClient';

const accountTypes = [
  { value: 'Particulier', label: 'Particulier (Acheteur)', icon: UsersIcon },
  { value: 'Vendeur', label: 'Vendeur', icon: Store }
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
      // ÉTAPE 1: Créer l'utilisateur dans le système d'authentification de Supabase.
      const normalizedEmail = email.trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            full_name: name,
            type: accountType,
            role: accountType === 'Vendeur' ? 'seller' : 'user'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // ÉTAPE 2: Insérer le profil de l'utilisateur dans notre table publique `users`.
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
              id: authData.user.id,
              full_name: name,
              email: normalizedEmail,
              type: accountType,
              role: accountType === 'Vendeur' ? 'seller' : 'user',
              verification_status: 'not_verified'
            }, { onConflict: 'id', ignoreDuplicates: false });
        
        if (profileError) {
          throw profileError;
        }
      }
      
      toast({
        title: "Inscription presque terminée !",
        description: "Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception pour activer votre compte.",
        duration: 8000
      });

      navigate('/login');

    } catch (error) {
      if (error.message.includes("User already registered")) {
        toast({ variant: "destructive", title: "Erreur d'inscription", description: "Un utilisateur avec cet email existe déjà." });
      } else {
        toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-2xl">Créer un Compte</CardTitle><CardDescription>Rejoignez Teranga Foncier.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="accountType">Je suis un(e)</Label>
               <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger id="accountType"><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                <SelectContent>
                  {accountTypes.map(({ value, label, icon: Icon }) => ( <SelectItem key={value} value={value}><div className="flex items-center"><Icon className="h-4 w-4 mr-2 text-muted-foreground" /><span>{label}</span></div></SelectItem> ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label htmlFor="name">Nom complet</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} /></div>
            <div className="grid gap-2"><Label htmlFor="password">Mot de passe</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} /></div>
            <div className="grid gap-2"><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} /></div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Création...' : 'Créer un compte'}</Button>
          </form>
        </CardContent>
        <CardFooter><div className="text-center w-full text-sm">Déjà un compte?{' '}<Link to="/login" className="underline">Connectez-vous</Link></div></CardFooter>
      </Card>
    </motion.div>
  );
};
export default RegisterPage;
