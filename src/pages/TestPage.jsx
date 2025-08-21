import React, { useState, useEffect } from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import supabase from "../../lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const TestPage = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('admin@terangafoncier.com');
  const [testPassword, setTestPassword] = useState('admin123456');
  const [connectionTest, setConnectionTest] = useState(null);
  const navigate = useNavigate();
  
  const { 
    user, 
    profile, 
    loading: authLoading, 
    isAuthenticated, 
    isAdmin, 
    isVerified,
    signOut
  } = useAuth();

  const { demoMode, enableDemoMode, disableDemoMode } = useDemo();

  // Test de connexion Supabase
  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (error) throw error;

      setConnectionTest({
        status: 'success',
        message: `? Connexion réussie - ${users.length} utilisateurs trouvés`,
        data: users
      });
    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: `? Erreur de connexion: ${error.message}`,
        error
      });
    }
    setLoading(false);
  };

  // Test de connexion utilisateur
  const testUserLogin = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (authError) throw authError;

      setTestResults(prev => ({
        ...prev,
        login: {
          status: 'success',
          message: '? Connexion utilisateur réussie',
          user: authData.user,
          session: authData.session
        }
      }));

      // Test de récupération du profil
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          setTestResults(prev => ({
            ...prev,
            profile: {
              status: 'error',
              message: `?? Erreur profil: ${profileError.message}`,
              error: profileError
            }
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            profile: {
              status: 'success',
              message: '? Profil récupéré avec succés',
              data: profileData
            }
          }));
        }
      }

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        login: {
          status: 'error',
          message: `? Erreur de connexion: ${error.message}`,
          error
        }
      }));
    }
    setLoading(false);
  };

  // Test de déconnexion
  const testLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setTestResults({});
      setConnectionTest(null);
    } catch (error) {    }
  };

  // Activer le mode démo et naviguer
  const startDemo = (userType) => {
    enableDemoMode(userType);
    navigate('/dashboard');
  };

  useEffect(() => {
    // Test automatique de la connexion Supabase au chargement
    testSupabaseConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">?? Page de Test - Diagnostic Teranga Foncier</h1>
        <p className="text-muted-foreground">
          Cette page permet de diagnostiquer les problémes d'authentification et de tester les dashboards.
        </p>
      </div>

      {/* Mode Démonstration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Mode Démonstration
          </CardTitle>
          <CardDescription>
            Testez tous les dashboards sans authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoMode ? (
            <div className="space-y-4">
              <Badge variant="secondary" className="text-green-600">
                Mode Démo Actif - {profile?.type}
              </Badge>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/dashboard')} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Aller au Dashboard
                </Button>
                <Button onClick={disableDemoMode} variant="outline">
                  Désactiver le Mode Démo
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Choisissez un type d'utilisateur pour tester le dashboard correspondant :
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { type: 'admin', label: 'Administrateur', color: 'bg-red-500' },
                  { type: 'particulier', label: 'Particulier', color: 'bg-blue-500' },
                  { type: 'banque', label: 'Banque', color: 'bg-green-500' },
                  { type: 'notaire', label: 'Notaire', color: 'bg-purple-500' },
                  { type: 'mairie', label: 'Mairie', color: 'bg-orange-500' }
                ].map((userType) => (
                  <Button
                    key={userType.type}
                    onClick={() => startDemo(userType.type)}
                    className={`${userType.color} hover:opacity-90 text-white`}
                    size="sm"
                  >
                    {userType.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* état du Contexte d'Authentification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              état du Contexte Auth
            </CardTitle>
            <CardDescription>
              état actuel de l'authentification dans l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mode Démo</Label>
                <Badge variant={demoMode ? "default" : "outline"}>
                  {demoMode ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div>
                <Label>Chargement Auth</Label>
                <Badge variant={authLoading ? "secondary" : "outline"}>
                  {authLoading ? "Oui" : "Non"}
                </Badge>
              </div>
              <div>
                <Label>Authentifié</Label>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "Oui" : "Non"}
                </Badge>
              </div>
              <div>
                <Label>Admin</Label>
                <Badge variant={isAdmin ? "default" : "outline"}>
                  {isAdmin ? "Oui" : "Non"}
                </Badge>
              </div>
              <div>
                <Label>Vérifié</Label>
                <Badge variant={isVerified ? "default" : "secondary"}>
                  {isVerified ? "Oui" : "Non"}
                </Badge>
              </div>
            </div>
            
            {user && (
              <div>
                <Label>Utilisateur Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}
            
            {profile && (
              <div>
                <Label>Profil</Label>
                <div className="text-sm text-muted-foreground">
                  <p>Nom: {profile.full_name}</p>
                  <p>Type: {profile.type}</p>
                  <p>Réle: {profile.role}</p>
                  <p>Statut: {profile.verification_status}</p>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <Button onClick={signOut} variant="outline" size="sm">
                Se Déconnecter
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Test de Connexion Supabase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Connexion Supabase
            </CardTitle>
            <CardDescription>
              Vérification de la connectivité avec la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testSupabaseConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Test en cours..." : "Tester la Connexion"}
            </Button>
            
            {connectionTest && (
              <div className={`p-3 rounded-md border ${
                connectionTest.status === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {connectionTest.status === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {connectionTest.message}
                  </span>
                </div>
                
                {connectionTest.data && connectionTest.data.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p>Premiers utilisateurs:</p>
                    {connectionTest.data.slice(0, 3).map((user, index) => (
                      <p key={index}>é {user.email} ({user.role || 'user'})</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test de Connexion Utilisateur */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Test de Connexion Utilisateur
            </CardTitle>
            <CardDescription>
              Test de connexion avec un compte spécifique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test-email">Email de test</Label>
                <Input
                  id="test-email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="test-password">Mot de passe</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="motdepasse"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={testUserLogin} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Test en cours..." : "Tester Connexion"}
                </Button>
              </div>
            </div>

            {/* Comptes de test rapide */}
            <div>
              <Label>Comptes de test rapide</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { email: 'admin@terangafoncier.com', password: 'admin123456', label: 'Admin' },
                  { email: 'test@terangafoncier.com', password: 'test123456', label: 'Test' }
                ].map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestEmail(account.email);
                      setTestPassword(account.password);
                    }}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Résultats des tests */}
            {(testResults.login || testResults.profile) && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-medium">Résultats des tests</h4>
                
                {testResults.login && (
                  <div className={`p-3 rounded-md border ${
                    testResults.login.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-sm font-medium">{testResults.login.message}</p>
                    {testResults.login.user && (
                      <p className="text-xs mt-1">ID: {testResults.login.user.id}</p>
                    )}
                  </div>
                )}

                {testResults.profile && (
                  <div className={`p-3 rounded-md border ${
                    testResults.profile.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-sm font-medium">{testResults.profile.message}</p>
                    {testResults.profile.data && (
                      <div className="text-xs mt-1">
                        <p>Nom: {testResults.profile.data.full_name}</p>
                        <p>Type: {testResults.profile.data.type}</p>
                        <p>Réle: {testResults.profile.data.role}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={testLogout} variant="outline" size="sm">
                  Nettoyer les Tests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>?? Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Mode Démonstration :</strong> Testez tous les dashboards immédiatement sans authentification.</p>
          <p><strong>Test Connexion :</strong> Vérifiez la connectivité avec Supabase.</p>
          <p><strong>Test Auth :</strong> Testez la connexion avec des comptes réels (nécessite résolution du probléme email).</p>
          <p><strong>Probléme actuel :</strong> Les emails Supabase nécessitent une confirmation. Utilisez le mode démo pour tester.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;

