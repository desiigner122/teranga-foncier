// src/pages/common/MessagingPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const MessagingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 max-w-7xl mx-auto bg-white rounded-lg shadow-lg mt-10"
    >
      <h1 className="text-4xl font-extrabold text-green-800 mb-4 flex items-center">
        <MessageSquare className="mr-3 h-10 w-10 text-green-600" /> Votre Messagerie
      </h1>
      <p className="mt-4 text-xl text-gray-700">
        Ceci est la page de votre messagerie privée.
      </p>
      <p className="mt-2 text-md text-gray-600">
        Vous pourrez ici échanger des messages avec d'autres utilisateurs de la plateforme.
      </p>
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-700">
          **Statut :** En attente d'implémentation de la logique de messagerie en temps réel.
        </p>
      </div>
    </motion.div>
  );
};

export default MessagingPage;
