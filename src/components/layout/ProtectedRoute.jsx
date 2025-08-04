// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/spinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth(); // Récupérer l'état de chargement et l'utilisateur
  
  if (loading) {
    // Affiche un spinner tant que l'authentification et le profil ne sont pas complètement chargés
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié (donc user ou profile est null)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // La route est protégée, l'utilisateur est authentifié, on rend le contenu
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
