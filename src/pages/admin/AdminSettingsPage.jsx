import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AdminSettingsPage = () => {
  const { toast } = useToast();

  // TODO: connecter aux vraies configs système

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres Administrateur</h1>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Accès & Rôles</CardTitle>
          <CardDescription>Configurer les rôles, droits et accès globaux à la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Intégrer la gestion des rôles et accès */}
          <Button variant="outline" onClick={() => toast({ title: 'Fonctionnalité à venir', description: 'Gestion avancée des rôles prochainement.' })}>
            Gérer les rôles et accès
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité & Journalisation</CardTitle>
          <CardDescription>Configurer la sécurité globale et consulter les logs d’activité.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Intégrer logs, 2FA admin, alertes sécurité */}
          <Button variant="outline" onClick={() => toast({ title: 'Fonctionnalité à venir', description: 'Logs et sécurité avancée prochainement.' })}>
            Voir les logs & options sécurité
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Système</CardTitle>
          <CardDescription>Paramétrer les options globales de la plateforme (notifications, intégrations, etc.).</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Intégrer la configuration système */}
          <Button variant="outline" onClick={() => toast({ title: 'Fonctionnalité à venir', description: 'Configuration système prochainement.' })}>
            Configurer le système
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
