import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authentification via Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      const user = data.user;

      // 2. Récupérer les informations de profil (rôle, type) depuis la table public.users
      // Déclarer profileData avec 'let' pour pouvoir le réassigner
      let { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('role, type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn("Profil utilisateur non trouvé dans public.users, utilisant des valeurs par défaut:", profileError.message);
        // Réassigner profileData ici car il est déclaré avec 'let'
        profileData = { role: 'user', type: 'Particulier' };
      }

      // Construire l'objet userData à passer au contexte d'authentification
      const userData = {
        id: user.id,
        email: user.email,
        role: profileData.role,
        type: profileData.type,
      };

      // 3. Appeler la fonction login du AuthContext avec les données réelles
      login(userData);

      toast({
        title: "Connexion réussie !",
        description: `Bienvenue ${userData.email}. Vous êtes connecté en tant que ${userData.type}.`,
      });
      
      // 4. Redirection basée sur le rôle
      let destination = from;
      if (userData.role === 'admin' && from === '/dashboard') {
          destination = '/admin';
      } else if (userData.role === 'agent' && from === '/dashboard') {
          destination = '/agent';
      }
      
      navigate(destination, { replace: true });

    } catch (err) {
      console.error("Erreur de connexion:", err);
      let errorMessage = "Une erreur inattendue est survenue lors de la connexion.";
      if (err.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (err.message.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre adresse email.";
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast({
        title: "Échec de la Connexion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-emerald-900/50 px-4 py-12"
    >
      <Card className="w-full max-w-md shadow-xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace Teranga Foncier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700">
             <h4 className="font-semibold mb-1">Connexion</h4>
             <p>Utilisez les identifiants de vos comptes Supabase.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link to="#" className="text-sm text-primary hover:underline" onClick={(e) => {e.preventDefault(); toast({title:"Fonctionnalité à venir", description: "La récupération de mot de passe n'est pas encore implémentée."})}}>Mot de passe oublié ?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="flex items-center p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/30">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0"/>
                  <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-600 hover:opacity-90 text-white" disabled={loading}>
              {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </>
              ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Se Connecter
                  </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
