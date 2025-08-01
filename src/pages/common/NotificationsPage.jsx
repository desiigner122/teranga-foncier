// src/pages/common/NotificationsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 max-w-7xl mx-auto bg-white rounded-lg shadow-lg mt-10"
    >
      <h1 className="text-4xl font-extrabold text-blue-800 mb-4 flex items-center">
        <Bell className="mr-3 h-10 w-10 text-blue-600" /> Vos Notifications
      </h1>
      <p className="mt-4 text-xl text-gray-700">
        Ceci est la page de gestion des notifications.
      </p>
      <p className="mt-2 text-md text-gray-600">
        Les notifications s'afficheront ici une fois la fonctionnalité complète implémentée.
      </p>
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700">
          **Statut :** En attente d'implémentation des données réelles et de la logique de notification.
        </p>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
