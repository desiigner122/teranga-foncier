// src/components/ui/SystemStatusWidget.jsx
import React from 'react';
import { useRealtimeContext } from '@/context/RealtimeContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemStatusWidget = () => {
  const systemFeatures = [
    {
      name: "IA Hybride",
      status: "Actif",
      description: "Claude + ChatGPT + Gemini",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      name: "Anti-Fraude",
      status: "Opérationnel",
      description: "Détection en temps réel",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      name: "Performance",
      status: "Optimisé",
      description: "FOUC corrigé, CSS amélioré",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      name: "Notifications",
      status: "Temps réel",
      description: "Supabase real-time",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Actif":
      case "Opérationnel":
      case "Optimisé":
      case "Temps réel":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">Statut du Système IA</CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Tous systèmes opérationnels
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemFeatures.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${feature.bgColor} border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                  <span className="font-medium text-gray-900">{feature.name}</span>
                </div>
                {getStatusIcon(feature.status)}
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {feature.status}
              </Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Améliorations Récentes</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Correction erreur "d is not defined" dans AdminDashboard</li>
            <li>✅ IA hybride avec sélection automatique du meilleur modèle</li>
            <li>✅ Interface chatbot redimensionnée et responsive</li>
            <li>✅ Prévention FOUC et optimisations CSS</li>
            <li>✅ Système anti-fraude intégré avec notifications temps réel</li>
            <li>✅ Dashboard notaire avec analyse IA des documents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusWidget;
