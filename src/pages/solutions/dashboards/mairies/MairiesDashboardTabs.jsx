import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Map, Users, Download, Search, CheckCircle, XCircle } from 'lucide-react';

// Corrections des chemins des imports
import LandManagementPage from '@/pages/dashboards/mairie/LandManagementPage';
import UrbanPlanPage from '@/pages/dashboards/mairie/UrbanPlanPage';
import CadastrePage from '@/pages/dashboards/mairie/CadastrePage';
import DisputesPage from '@/pages/dashboards/mairie/DisputesPage';
import MairieRequestsPage from '@/pages/dashboards/mairie/MairieRequestsPage';


const CadastreMapSimulation = ({ onAction }) => (
  <div className="h-full bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 rounded-lg p-4 flex flex-col items-center justify-center shadow-inner">
    <Map className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Cadastre Numérique de la Commune</p>
    <p className="text-xs text-center mt-1 text-blue-700 dark:text-blue-300">Visualisation des parcelles, zones et plans d'urbanisme (simulation).</p>
    <img className="w-full h-auto mt-2 rounded" alt="Carte de cadastre simulée" src="https://placehold.co/600x400/E0F2F7/0288D1?text=Carte+Cadastrale+Simulée" />
    <Button onClick={() => onAction("Ouverture de la carte cadastrale.")} className="mt-4">
      Ouvrir la Carte
    </Button>
  </div>
);

const getStatusBadge = (status) => {
  switch (status) {
    case 'Disponible':
      return <Badge variant="success">{status}</Badge>;
    case 'En attente':
      return <Badge variant="warning">{status}</Badge>;
    case 'Vendu':
      return <Badge variant="destructive">{status}</Badge>;
    case 'Réservé':
      return <Badge variant="secondary">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const OverviewTab = ({ kpiData }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {kpiData.map((kpi, index) => (
      <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
          <kpi.icon className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpi.value} <span className="text-sm text-muted-foreground">{kpi.unit}</span></div>
          {kpi.trend && <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>}
        </CardContent>
      </Card>
    ))}
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Activités Récentes</CardTitle>
        <CardDescription>Vue d'overview des dernières actions et événements.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Demande de permis de construire pour parcelle SL042 - <span className="font-medium text-primary">Nouvelle</span></li>
          <li>• Attribution de parcelle TH015 à Client C - <span className="font-medium text-green-600">Complétée</span></li>
          <li>• Litige foncier DK-YOF-007 en médiation - <span className="font-medium text-orange-600">En cours</span></li>
          <li>• Nouvelle parcelle communale enregistrée - <span className="font-medium text-blue-600">Disponible</span></li>
        </ul>
      </CardContent>
    </Card>
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Statistiques des Demandes</CardTitle>
        <CardDescription>Répartition des types de demandes reçues.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { name: 'Permis', value: 12 },
            { name: 'Attribution', value: 8 },
            { name: 'Info', value: 5 },
            { name: 'Visite', value: 3 },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Cadastre Numérique (Simulation)</CardTitle>
        <CardDescription>Accédez à la carte interactive du cadastre communal.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <CadastreMapSimulation onAction={() => console.log('Action Cadastre')} />
      </CardContent>
    </Card>
  </div>
);

export const RequestsTab = ({ requests, onAction }) => (
    <Card>
      <CardHeader>
        <CardTitle>Demandes des Citoyens</CardTitle>
        <CardDescription>Gérez les demandes de permis, d'attribution, etc.</CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une demande..." className="pl-8" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvée</SelectItem>
              <SelectItem value="rejected">Rejetée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Demandeur</th>
                <th className="text-left p-2 font-semibold">Type de Demande</th>
                <th className="text-left p-2 font-semibold">Message</th>
                <th className="text-left p-2 font-semibold">Statut</th>
                <th className="text-right p-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => {
                const user = { name: req.userName || 'N/A', email: req.userEmail || 'N/A' }; // Placeholder for user data
                return (
                  <tr key={req.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-2 capitalize">{req.request_type}</td>
                    <td className="p-2 text-muted-foreground">{req.message.substring(0, 50)}...</td>
                    <td className="p-2">
                      <Badge variant={req.status === 'Nouvelle' ? 'warning' : 'secondary'}>{req.status}</Badge>
                    </td>
                    <td className="p-2 text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => onAction(`Instruire le dossier ${req.id}.`)}>Instruire</Button>
                      <Button variant="ghost" size="icon" onClick={() => onAction(`Approbation du dossier ${req.id}.`)}><CheckCircle className="h-4 w-4 text-green-500"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => onAction(`Rejet du dossier ${req.id}.`)}><XCircle className="h-4 w-4 text-red-500"/></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
);

export const LandManagementTab = ({ parcels }) => (
  <Card>
    <CardHeader>
      <CardTitle>Gestion du Foncier Communal</CardTitle>
      <CardDescription>Liste des terrains appartenant à la commune.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Référence</th>
              <th className="text-left p-2 font-semibold">Localisation</th>
              <th className="text-left p-2 font-semibold">Surface (m²)</th>
              <th className="text-left p-2 font-semibold">Statut</th>
              <th className="text-left p-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="p-2 font-medium">{p.id}</td>
                <td className="p-2">{p.location_name}</td>
                <td className="p-2">{p.area_sqm}</td>
                <td className="p-2">{getStatusBadge(p.status)}</td>
                <td className="p-2">
                  <Button asChild variant="link" size="sm" className="p-0 h-auto"><Link to={`/parcelles/${p.id}`}>Voir Détails</Link></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
