import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Users as UsersIcon, Briefcase, Building, Sprout, Banknote, Landmark, LandPlot, Store } from 'lucide-react';

const accountTypes = [
  { value: 'Particulier', label: 'Particulier (Acheteur)', icon: UsersIcon },
  { value: 'Vendeur', label: 'Vendeur', icon: Store },
  { value: 'Investisseur', label: 'Investisseur', icon: Briefcase },
  { value: 'Promoteur', label: 'Promoteur', icon: Building },
  { value: 'Agriculteur', label: 'Agriculteur', icon: Sprout },
  { value: 'Banque', label: 'Partenaire Bancaire', icon: Banknote },
  { value: 'Mairie', label: 'Représentant Mairie', icon: Landmark },
  { value: 'Notaire', label: 'Étude Notariale', icon: LandPlot },
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('Particulier');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setIsLoading(true);
    toast({
       title: "Inscription en cours...",
       description: "Création de votre compte.",
     });

    setTimeout(() => {
        const newUser = { 
          id: `usr_${Date.now()}`,
          email: email, 
          name: name, 
          role: "user", // Default role, can be refined later
          type: accountType,
        };
        login(newUser);

        toast({
          title: "Inscription réussie !",
          description: "Vous êtes maintenant connecté.",
        });
        setIsLoading(false);
        navigate('/dashboard');
     }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto flex items-center justify-center min-h-[calc(100vh-130px)] py-12 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-emerald-900/50"
    >
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un Compte</CardTitle>
          <CardDescription>Rejoignez Teranga Foncier et sécurisez vos transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
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