import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Settings, Filter } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const AlertsNotificationsPage = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-001',
      type: 'price_alert',
      title: 'Alerte Prix - Zone Almadies',
      message: 'Le prix moyen dans votre zone de recherche a augmenté de 8% ce mois.',
      priority: 'high',
      status: 'unread',
      timestamp: '2025-01-15T10:30:00Z',
      action: 'Voir les détails',
      category: 'market'
    },
    {
      id: 'NOTIF-002',
      type: 'document',
      title: 'Signature Requise',
      message: 'Le contrat pour la parcelle DK-ALM-002 attend votre signature.',
      priority: 'urgent',
      status: 'unread',
      timestamp: '2025-01-15T09:15:00Z',
      action: 'Signer maintenant',
      category: 'transaction'
    },
    {
      id: 'NOTIF-003',
      type: 'payment',
      title: 'Échéance de Paiement',
      message: 'Votre prochaine échéance de 850 000 FCFA est due dans 3 jours.',
      priority: 'medium',
      status: 'read',
      timestamp: '2025-01-14T16:45:00Z',
      action: 'Effectuer le paiement',
      category: 'payment'
    },
    {
      id: 'NOTIF-004',
      type: 'regulatory',
      title: 'Nouvelle Réglementation',
      message: 'Nouvelles règles fiscales pour les transactions immobilières à Dakar.',
      priority: 'low',
      status: 'read',
      timestamp: '2025-01-13T14:20:00Z',
      action: 'Lire l\'article',
      category: 'legal'
    },
    {
      id: 'NOTIF-005',
      type: 'opportunity',
      title: 'Nouvelle Opportunité',
      message: 'Une parcelle correspondant à vos critères est disponible à Ngor.',
      priority: 'medium',
      status: 'unread',
      timestamp: '2025-01-12T11:30:00Z',
      action: 'Voir la parcelle',
      category: 'opportunity'
    }
  ]);

  const [alertSettings, setAlertSettings] = useState({
    priceAlerts: true,
    documentAlerts: true,
    paymentReminders: true,
    marketUpdates: false,
    promotionalOffers: false,
    systemMaintenance: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    frequency: 'immediate'
  });

  const alertCategories = [
    { value: 'all', label: 'Toutes les notifications', count: notifications.length },
    { value: 'transaction', label: 'Transactions', count: notifications.filter(n => n.category === 'transaction').length },
    { value: 'payment', label: 'Paiements', count: notifications.filter(n => n.category === 'payment').length },
    { value: 'market', label: 'Marché', count: notifications.filter(n => n.category === 'market').length },
    { value: 'legal', label: 'Légal', count: notifications.filter(n => n.category === 'legal').length },
    { value: 'opportunity', label: 'Opportunités', count: notifications.filter(n => n.category === 'opportunity').length }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority] || colors.medium;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      price_alert: TrendingUp,
      document: CheckCircle,
      payment: Calendar,
      regulatory: AlertTriangle,
      opportunity: Bell
    };
    return icons[type] || Bell;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'read' }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, status: 'read' }))
    );
    toast({
      title: "Notifications marquées comme lues",
      description: "Toutes les notifications ont été marquées comme lues.",
    });
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filter);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const updateAlertSetting = (key, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Paramètres mis à jour",
      description: "Vos préférences de notification ont été sauvegardées.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertes & Notifications</h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et paramétrez vos alertes personnalisées
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(!settingsOpen)}>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertes Actives</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar des catégories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alertCategories.map((category) => (
                <Button
                  key={category.value}
                  variant={filter === category.value ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setFilter(category.value)}
                >
                  <span>{category.label}</span>
                  <Badge variant="secondary">{category.count}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Paramètres d'alertes */}
          {settingsOpen && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Paramètres d'Alertes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="price-alerts">Alertes prix</Label>
                    <Switch
                      id="price-alerts"
                      checked={alertSettings.priceAlerts}
                      onCheckedChange={(checked) => updateAlertSetting('priceAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="document-alerts">Documents</Label>
                    <Switch
                      id="document-alerts"
                      checked={alertSettings.documentAlerts}
                      onCheckedChange={(checked) => updateAlertSetting('documentAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-alerts">Paiements</Label>
                    <Switch
                      id="payment-alerts"
                      checked={alertSettings.paymentReminders}
                      onCheckedChange={(checked) => updateAlertSetting('paymentReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="market-alerts">Marché</Label>
                    <Switch
                      id="market-alerts"
                      checked={alertSettings.marketUpdates}
                      onCheckedChange={(checked) => updateAlertSetting('marketUpdates', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fréquence des notifications</Label>
                  <Select
                    value={alertSettings.frequency}
                    onValueChange={(value) => updateAlertSetting('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiate</SelectItem>
                      <SelectItem value="hourly">Chaque heure</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Canaux de notification</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={alertSettings.emailNotifications}
                      onCheckedChange={(checked) => updateAlertSetting('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={alertSettings.smsNotifications}
                      onCheckedChange={(checked) => updateAlertSetting('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Push</span>
                    </div>
                    <Switch
                      checked={alertSettings.pushNotifications}
                      onCheckedChange={(checked) => updateAlertSetting('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Récentes</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification(s) 
                {filter !== 'all' && ` dans la catégorie ${alertCategories.find(c => c.value === filter)?.label}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        notification.status === 'unread' 
                          ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <IconComponent className={`h-5 w-5 ${
                              notification.status === 'unread' ? 'text-blue-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${
                                notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {notification.status === 'unread' && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  {notification.action}
                                </Button>
                                {notification.status === 'unread' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Marquer comme lu
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertsNotificationsPage;
