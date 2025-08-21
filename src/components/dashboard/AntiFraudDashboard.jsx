import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const AntiFraudDashboard = ({ userRole = 'user', data = null }) => {
  const [fraudScore, setFraudScore] = useState(0);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [securityLevel, setSecurityLevel] = useState('normal');

  useEffect(() => {
    // Simuler le chargement des données anti-fraude
    const timer = setTimeout(() => {
      // Scores différents selon le rôle
      const score = userRole === 'admin' ? 92 : 
                    userRole === 'notaire' ? 88 : 
                    userRole === 'mairie' ? 85 : 
                    userRole === 'investisseur' ? 78 : 75;
      
      setFraudScore(score);
      
      // Événements de sécurité spécifiques au rôle
      const events = generateSecurityEvents(userRole);
      setSecurityEvents(events);
      
      // Niveau de sécurité
      setSecurityLevel(score > 85 ? 'high' : score > 70 ? 'normal' : 'warning');
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [userRole]);

  const generateSecurityEvents = (role) => {
    const baseEvents = [
      { 
        id: 1, 
        type: 'info', 
        message: 'Dernière vérification de sécurité effectuée il y a 3 jours', 
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        icon: Info
      },
      { 
        id: 2, 
        type: 'success', 
        message: 'Aucune tentative d\'accès non autorisée détectée', 
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        icon: CheckCircle
      }
    ];
    
    // Ajouter des événements spécifiques au rôle
    switch(role) {
      case 'admin':
        return [
          ...baseEvents,
          { 
            id: 3, 
            type: 'warning', 
            message: 'Activité inhabituelle sur les droits administrateur', 
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            icon: AlertTriangle
          }
        ];
      case 'notaire':
        return [
          ...baseEvents,
          { 
            id: 3, 
            type: 'pending', 
            message: 'Vérification des signatures électroniques en attente', 
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            icon: Clock
          }
        ];
      case 'mairie':
        return [
          ...baseEvents,
          { 
            id: 3, 
            type: 'warning', 
            message: 'Accès aux documents sensibles depuis une nouvelle adresse IP', 
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            icon: AlertTriangle
          }
        ];
      case 'investisseur':
        return [
          ...baseEvents,
          { 
            id: 3, 
            type: 'warning', 
            message: 'Tentative d\'accès non autorisée détectée et bloquée', 
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            icon: AlertTriangle
          }
        ];
      default:
        return baseEvents;
    }
  };

  const getEventTypeStyles = (type) => {
    switch(type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSecurityLevelStyles = (level) => {
    switch(level) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (score) => {
    if (score > 85) return 'bg-green-500';
    if (score > 70) return 'bg-blue-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité Anti-Fraude
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité Anti-Fraude
            <Badge className={getSecurityLevelStyles(securityLevel)}>
              {securityLevel === 'high' ? 'Sécurisé' : 
               securityLevel === 'normal' ? 'Normal' : 
               securityLevel === 'warning' ? 'Attention' : 'Critique'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Score de protection</span>
                <span className="text-sm font-medium">{fraudScore}/100</span>
              </div>
              <Progress value={fraudScore} className={getProgressColor(fraudScore)} />
            </div>
            
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div 
                  key={event.id}
                  className={`p-3 rounded-lg border ${getEventTypeStyles(event.type)}`}
                >
                  <div className="flex gap-2">
                    <event.icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs opacity-70">{formatDate(event.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              Analyse de sécurité complète
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AntiFraudDashboard;
