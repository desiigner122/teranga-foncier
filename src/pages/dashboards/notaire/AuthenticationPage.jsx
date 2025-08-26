import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AuthenticationPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Exemple: vérifier le code d'authentification dans une table supabase
    const { data, error } = await supabase
      .from('notary_auth_codes')
      .select('*')
      .eq('code', code)
      .single();
    setLoading(false);
    if (error || !data) {
      toast({ title: 'Erreur', description: 'Code invalide ou expiré', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Authentification réussie' });
      // Logique métier à compléter ici
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentification Notariale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              placeholder="Code d'authentification notaire"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !code}>
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default AuthenticationPage;
