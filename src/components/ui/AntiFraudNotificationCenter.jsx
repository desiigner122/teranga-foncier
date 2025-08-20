import React, { useState, useEffect } from 'react';
const AntiFraudNotificationCenter = ({ userRole, userId }) => {
  const { toast } = useToast();
  const { data: notifications, loading: notificationsLoading, error: notificationsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (notifications) {
      setFilteredData(notifications);
    }
  }, [notifications]);
  
  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
    loadUserSettings();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const { data: notifications, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          parcels(reference, location),
          profiles(full_name, email)
        `)
        .or(getRoleFilter())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedNotifications = notifications?.map(alert => ({
        id: alert.id,
        type: 'fraud_alert',
        title: getAlertTitle(alert.alert_type),
        message: alert.description || generateAlertMessage(alert),
        severity: alert.risk_level,
        timestamp: alert.created_at,
        read: alert.status === 'resolved' || alert.status === 'dismissed',
        data: alert
      })) || [];

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.read).length);

    } catch (error) {    }
  };

  const setupRealtimeSubscription = () => {
    // Subscription aux nouvelles alertes de fraude
    const alertsSubscription = supabase
      .channel('fraud_alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'fraud_alerts',
        filter: getRoleFilter()
      }, (payload) => {
        handleNewAlert(payload.new);
      })
      .subscribe();

    return () => {
      alertsSubscription.unsubscribe();
    };
  };

  const handleNewAlert = async (alertData) => {
    // Analyser la sévérité et décider des actions
    const severity = alertData.risk_level;
    const alertType = alertData.alert_type;

    const newNotification = {
      id: alertData.id,
      type: 'fraud_alert',
      title: getAlertTitle(alertType),
      message: alertData.description || generateAlertMessage(alertData),
      severity: severity,
      timestamp: alertData.created_at,
      read: false,
      data: alertData
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Actions automatiques selon la sévérité
    if (severity === 'critical') {
      // Son d'alerte critique
      if (soundEnabled) {
        playAlertSound('critical');
      }

      // Notification toast persistante
      toast({
        variant: "destructive",
        title: "🚨 ALERTE CRITIQUE DE SÉCURITÉ",
        description: newNotification.message,
        duration: 10000,
      });

      // Auto-ouvrir le centre de notifications
      setIsOpen(true);

      // Exécuter des actions de sécurité automatiques
      await executeAutomaticSecurityActions(alertData);

    } else if (severity === 'high') {
      if (soundEnabled) {
        playAlertSound('high');
      }

      toast({
        variant: "destructive",
        title: "⚠️ Alerte de Sécurité",
        description: newNotification.message,
        duration: 7000,
      });
    } else {
      toast({
        title: "🔒 Nouvelle alerte",
        description: newNotification.message,
        duration: 5000,
      });
    }
  };

  const executeAutomaticSecurityActions = async (alertData) => {
    try {
      // Actions automatiques selon le type d'alerte
      switch (alertData.alert_type) {
        case 'user_fraud':
          // Suspension temporaire du compte
          await supabase
            .from('users')
            .update({ 
              account_status: 'suspended',
              suspension_reason: `Alerte fraude automatique: ${alertData.id}`,
              suspended_at: new Date().toISOString()
            })
            .eq('id', alertData.target_id);
          break;

        case 'transaction_fraud':
          // Blocage de la transaction
          await supabase
            .from('transactions')
            .update({ 
              status: 'blocked',
              blocked_reason: `Fraude détectée: ${alertData.id}`,
              blocked_at: new Date().toISOString()
            })
            .eq('id', alertData.target_id);
          break;

        case 'document_fraud':
          // Marquer les documents comme suspects
          await supabase
            .from('documents')
            .update({ 
              verification_status: 'rejected',
              rejection_reason: `Document frauduleux détecté: ${alertData.id}`
            })
            .eq('id', alertData.target_id);
          break;
      }

      // Notifier les admins
      if (userRole !== 'admin') {
        await notifyAdministrators(alertData);
      }

    } catch (error) {    }
  };

  const notifyAdministrators = async (alertData) => {
    try {
      // Créer une notification pour tous les admins
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'critical_fraud_alert',
          title: 'Action Immédiate Requise',
          message: `Alerte critique: ${getAlertTitle(alertData.alert_type)} - Score: ${Math.round(alertData.risk_score * 100)}%`,
          severity: 'critical',
          data: alertData
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);
      }
    } catch (error) {    }
  };

  const playAlertSound = (severity) => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      switch (severity) {
        case 'critical':
          // Son d'alerte critique - fréquence élevée
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAXBDGS2e/MeSsFJYDJ8NyPRAkWhLPl6KVSFQ1Xn+Hx';
          break;
        case 'high':
          // Son d'alerte élevée
          audio.src = 'data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAXBDGS2e/MeSsFJYDJ8NyPRAkWhLPl6KVSFQ1Xn+Hx';
          break;
        default:
          // Son de notification standard
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAXBDGS2e/MeSsFJYDJ8NyPRAkWhLPl6KVSFQ1Xn+Hx';
      }
      audio.play();
    } catch (error) {    }
  };

  const loadUserSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('user_preferences')
        .select('notification_settings')
        .eq('user_id', userId)
        .single();

      if (settings?.notification_settings) {
        setNotificationSettings(settings.notification_settings);
        setSoundEnabled(settings.notification_settings.soundEnabled !== false);
      }
    } catch (error) {    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('fraud_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('fraud_alerts')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {    }
  };

  const getRoleFilter = () => {
    switch (userRole) {
      case 'admin':
        return 'alert_type.in.(document_fraud,transaction_fraud,user_fraud,parcel_fraud,network_fraud)';
      case 'notaire':
        return 'alert_type.in.(document_fraud,signature_fraud)';
      case 'agent':
        return 'alert_type.in.(transaction_fraud,user_fraud)';
      case 'banque':
        return 'alert_type.in.(transaction_fraud,user_fraud)';
      case 'mairie':
        return 'alert_type.in.(parcel_fraud,document_fraud)';
      default:
        return 'alert_type.eq.user_fraud';
    }
  };

  const getAlertTitle = (alertType) => {
    switch (alertType) {
      case 'document_fraud': return 'Fraude Documentaire';
      case 'transaction_fraud': return 'Transaction Suspecte';
      case 'user_fraud': return 'Utilisateur Suspect';
      case 'parcel_fraud': return 'Parcelle Frauduleuse';
      case 'network_fraud': return 'Réseau de Fraude';
      case 'signature_fraud': return 'Signature Falsifiée';
      default: return 'Alerte de Sécurité';
    }
  };

  const generateAlertMessage = (alert) => {
    const score = Math.round(alert.risk_score * 100);
    return `Activité suspecte détectée avec un score de risque de ${score}%. Vérification immédiate recommandée.`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return Shield;
      case 'medium': return Eye;
      default: return Bell;
    }
  };

  return (
    <>
      {/* Bouton de notification avec badge */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </div>

      {/* Centre de notifications */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Centre de Notifications Anti-Fraude
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Tout marquer comme lu
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              {unreadCount > 0 ? 
                `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} alerte${unreadCount > 1 ? 's' : ''} de sécurité` :
                'Aucune nouvelle alerte'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-gray-500">Aucune alerte de sécurité</p>
                <p className="text-sm text-green-600">Votre système est sécurisé</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {notifications.map((notification) => {
                    const SeverityIcon = getSeverityIcon(notification.severity);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetails(true);
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full ${getSeverityColor(notification.severity)}`}>
                              <SeverityIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Badge className={getSeverityColor(notification.severity)}>
                                  {notification.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(notification.timestamp).toLocaleString('fr-FR')}
                                </span>
                                {notification.data?.risk_score && (
                                  <span>Score: {Math.round(notification.data.risk_score * 100)}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Actions rapides
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détails notification */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Alerte</DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div>Type: {selectedNotification.title}</div>
                    <div>Sévérité: {selectedNotification.severity}</div>
                    <div>Horodatage: {new Date(selectedNotification.timestamp).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Score de Risque</h4>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      selectedNotification.data?.risk_score > 0.7 ? 'text-red-600' :
                      selectedNotification.data?.risk_score > 0.4 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {selectedNotification.data?.risk_score ? 
                        Math.round(selectedNotification.data.risk_score * 100) : 'N/A'}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.data?.indicators && (
                <div>
                  <h4 className="font-medium mb-2">Indicateurs Détectés</h4>
                  <div className="space-y-2">
                    {selectedNotification.data.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>{indicator.type}: {indicator.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AntiFraudNotificationCenter;
