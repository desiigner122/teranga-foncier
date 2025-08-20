// src/pages/solutions/dashboards/AgentDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  LandPlot, 
  ClipboardList, 
  TrendingUp, 
  CalendarDays, 
  Phone, 
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AgentDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 45,
    activeParcels: 23,
    pendingTasks: 8,
    completedDeals: 15
  });

  const [recentClients, setRecentClients] = useState([
    {
      id: 1,
      name: 'Aminata Diop',
      email: 'aminata.diop@email.com',
      phone: '+221 77 123 45 67',
      status: 'active',
      lastContact: '2024-01-20',
      interest: 'Achat terrain résidentiel'
    },
    {
      id: 2,
      name: 'Moussa Ba',
      email: 'moussa.ba@email.com',
      phone: '+221 76 987 65 43',
      status: 'pending',
      lastContact: '2024-01-18',
      interest: 'Vente propriété commerciale'
    },
    {
      id: 3,
      name: 'Fatou Seck',
      email: 'fatou.seck@email.com',
      phone: '+221 78 456 78 90',
      status: 'active',
      lastContact: '2024-01-22',
      interest: 'Investissement agricole'
    }
  ]);

  const [activeTasks, setActiveTasks] = useState([
    {
      id: 1,
      title: 'Visite terrain Dakar-Plateau',
      client: 'Aminata Diop',
      dueDate: '2024-01-25',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Finaliser dossier vente',
      client: 'Moussa Ba',
      dueDate: '2024-01-24',
      priority: 'urgent',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Rendez-vous banque',
      client: 'Fatou Seck',
      dueDate: '2024-01-26',
      priority: 'medium',
      status: 'pending'
    }
  ]);

  const [monthlyTargets, setMonthlyTargets] = useState({
    deals: { target: 10, current: 6 },
    revenue: { target: 5000000, current: 3200000 }, // En FCFA
    clients: { target: 20, current: 15 }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue, {user?.full_name || user?.email} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité d'agent foncier
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {stats.pendingTasks} tâches en attente
          </Badge>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <LandPlot className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Parcelles Actives</p>
                <p className="text-2xl font-bold">{stats.activeParcels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tâches en Cours</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ventes Réalisées</p>
                <p className="text-2xl font-bold">{stats.completedDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectifs mensuels */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs du Mois</CardTitle>
          <CardDescription>
            Votre progression vers les objectifs de janvier 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ventes réalisées</span>
              <span>{monthlyTargets.deals.current}/{monthlyTargets.deals.target}</span>
            </div>
            <Progress 
              value={(monthlyTargets.deals.current / monthlyTargets.deals.target) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Chiffre d'affaires</span>
              <span>{formatCurrency(monthlyTargets.revenue.current)} / {formatCurrency(monthlyTargets.revenue.target)}</span>
            </div>
            <Progress 
              value={(monthlyTargets.revenue.current / monthlyTargets.revenue.target) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nouveaux clients</span>
              <span>{monthlyTargets.clients.current}/{monthlyTargets.clients.target}</span>
            </div>
            <Progress 
              value={(monthlyTargets.clients.current / monthlyTargets.clients.target) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients récents */}
        <Card>
          <CardHeader>
            <CardTitle>Clients Récents</CardTitle>
            <CardDescription>
              Vos derniers clients et leurs statuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.interest}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(client.status)} text-white`}
                        >
                          {client.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {client.lastContact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tâches actives */}
        <Card>
          <CardHeader>
            <CardTitle>Tâches à Faire</CardTitle>
            <CardDescription>
              Vos prochaines tâches et rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : task.priority === 'urgent' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Nouveau Client</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <LandPlot className="h-6 w-6" />
              <span className="text-sm">Ajouter Parcelle</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <ClipboardList className="h-6 w-6" />
              <span className="text-sm">Nouvelle Tâche</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <CalendarDays className="h-6 w-6" />
              <span className="text-sm">Planifier RDV</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboardPage;
