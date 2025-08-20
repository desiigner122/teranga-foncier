// src/components/layout/VerificationGuard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import VerificationRequired from '@/components/VerificationRequired';

/**
 * Composant de protection strict pour la vérification d'identité
 * Empêche toute navigation si la vérification n'est pas complète
 */
const VerificationGuard = ({ children, allowedPaths = [] }) => {
  const { 
    isAuthenticated, 
    needsVerification, 
    isPendingVerification,
    isVerified,
    loading, 
    profile,
    user 
  } = useAuth();

  // Chemin actuel
  const currentPath = window.location.pathname;
  
  // Chemins autorisés sans vérification
  const defaultAllowedPaths = [
    '/verification',
    '/identity-verification',
    '/login',
    '/logout',
    '/profile/settings'
  ];
  
  const allAllowedPaths = [...defaultAllowedPaths, ...allowedPaths];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Administrateurs exempts de vérification
  if (profile?.role === 'admin' || profile?.type === 'Administrateur') {
    return children;
  }

  // Vérifier si l'utilisateur existe encore dans Auth (sécurité supplémentaire)
  if (user && !user.id) {
    console.warn('Session utilisateur corrompue - redirection vers login');
    return <Navigate to="/login" replace />;
  }

  // Si le chemin actuel est autorisé, laisser passer
  if (allAllowedPaths.some(path => currentPath.startsWith(path))) {
    return children;
  }

  // Si la vérification est nécessaire
  if (needsVerification) {
    console.log('Vérification requise - redirection vers /verification');
    return <Navigate to="/verification" replace />;
  }

  // Si en attente de vérification, afficher le composant d'attente
  if (isPendingVerification) {
    return <VerificationRequired />;
  }

  // Si pas vérifié et pas admin, bloquer l'accès
  if (!isVerified) {
    console.log('Utilisateur non vérifié - accès bloqué');
    return <Navigate to="/verification" replace />;
  }

  // Utilisateur vérifié, accès autorisé
  return children;
};

export default VerificationGuard;

