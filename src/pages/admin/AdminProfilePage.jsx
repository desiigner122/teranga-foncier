import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const AdminProfilePage = () => {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Profil Administrateur</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations du Super Admin</CardTitle>
          <CardDescription>Identité, email, rôle, dernière connexion, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Nom :</strong> {profile?.full_name || user?.user_metadata?.full_name || '---'}</div>
            <div><strong>Email :</strong> {user?.email}</div>
            <div><strong>Rôle :</strong> {profile?.role || 'admin'}</div>
            <div><strong>Dernière connexion :</strong> {profile?.last_login || '---'}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sécurité du Compte</CardTitle>
          <CardDescription>Modifier le mot de passe administrateur.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>Changer le mot de passe (à implémenter)</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Logs de Connexion</CardTitle>
          <CardDescription>Historique des connexions admin (à venir).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>Voir les logs (à implémenter)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
