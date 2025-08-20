// src/pages/MunicipalLandRequestInfoPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext'; // Pour vérifier l'authentification

const MunicipalLandRequestInfoPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProceedToRequest = () => {
    if (isAuthenticated) {
      navigate('/dashboard/mairie-requests'); // Ou la page spécifique de demande dans le dashboard
    } else {
      navigate('/login'); // Redirige vers la connexion
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-16 min-h-[calc(100vh-200px)]"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mb-12"
      >
        Demander un Terrain en Mairie : Le Processus
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-lg shadow-md"
        >
          <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">1. Comprendre vos Besoins</h3>
          <p className="text-gray-600 dark:text-gray-300">Identifiez le type de terrain, la localisation et la surface souhaités. Notre plateforme vous aide à affiner votre recherche.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-lg shadow-md"
        >
          <LogIn className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">2. Connectez-vous ou Inscrivez-vous</h3>
          <p className="text-gray-600 dark:text-gray-300">Pour soumettre une demande officielle, vous devez être un utilisateur enregistré sur Teranga Foncier.</p>
          {!isAuthenticated && (
            <div className="flex gap-4 mt-4">
              <Button asChild variant="default">
                <Link to="/login">Se Connecter</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-lg shadow-md"
        >
          <UserPlus className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">3. Soumettez votre Demande</h3>
          <p className="text-gray-600 dark:text-gray-300">Accédez à votre tableau de bord et remplissez le formulaire de demande de terrain auprès de la mairie de votre choix.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center bg-blue-50 dark:bg-blue-950 p-8 rounded-lg shadow-inner max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Prêt à faire votre demande ?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Cliquez ci-dessous pour accéder au formulaire de demande de terrain en mairie. Vous serez redirigé vers la page de connexion si vous n'êtes pas déjà authentifié.
        </p>
        <Button size="lg" onClick={handleProceedToRequest} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
          Accéder au Formulaire de Demande <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MunicipalLandRequestInfoPage;
