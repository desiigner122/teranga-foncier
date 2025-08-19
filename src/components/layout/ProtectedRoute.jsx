// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/spinner';

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { isAuthenticated, isVerified, needsVerification, loading, profile } = useAuth();
  
  if (loading) {
    // Affiche un spinner tant que l'authentification et le profil ne sont pas complètement chargés
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nouvelle logique : on autorise l'accès si statut pending; on ne bloque que si explicitement 'rejected' ou needsVerification (aucun dossier)
  const isAdminBypass = profile?.role === 'admin' || profile?.type === 'Administrateur';
  const status = profile?.verification_status;
  const isRejected = status === 'rejected' || status === 'failed';
  if (requireVerification && !isAdminBypass) {
    if (isRejected) return <Navigate to="/verification" replace />;
    if (needsVerification && status !== 'pending') return <Navigate to="/verification" replace />;
  }

  // La route est protégée, l'utilisateur est authentifié et vérifié, on rend le contenu
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
