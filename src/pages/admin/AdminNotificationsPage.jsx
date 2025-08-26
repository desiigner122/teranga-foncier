import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminNotificationsPage = () => {
  // TODO: connecter aux vraies notifications système/alertes
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Notifications Administrateur</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alertes Système</CardTitle>
          <CardDescription>Notifications critiques, alertes sécurité, logs importants.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Afficher la liste des notifications système */}
          <Button variant="outline" disabled>Aucune alerte critique (exemple)</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications Générales</CardTitle>
          <CardDescription>Événements, mises à jour, informations importantes pour l’admin.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Afficher la liste des notifications générales */}
          <Button variant="outline" disabled>Aucune notification générale (exemple)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
