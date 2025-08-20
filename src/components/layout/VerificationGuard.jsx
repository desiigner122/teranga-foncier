// src/components/layout/VerificationGuard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import VerificationRequired from '@/components/VerificationRequired';

/**
 * Composant de protection strict pour la v�rification d'identit�
 * Emp�che toute navigation si la v�rification n'est pas compl�te
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
  
  // Chemins autoris�s sans v�rification
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

  // Si pas authentifi�, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Administrateurs exempts de v�rification
  if (profile?.role === 'admin' || profile?.type === 'Administrateur') {
    return children;
  }

  // V�rifier si l'utilisateur existe encore dans Auth (s�curit� suppl�mentaire)
  if (user && !user.id) {
    console.warn('Session utilisateur corrompue - redirection vers login');
    return <Navigate to="/login" replace />;
  }

  // Si le chemin actuel est autoris�, laisser passer
  if (allAllowedPaths.some(path => currentPath.startsWith(path))) {
    return children;
  }

  // Si la v�rification est n�cessaire
  if (needsVerification) {
    console.log('V�rification requise - redirection vers /verification');
    return <Navigate to="/verification" replace />;
  }

  // Si en attente de v�rification, afficher le composant d'attente
  if (isPendingVerification) {
    return <VerificationRequired />;
  }

  // Si pas v�rifi� et pas admin, bloquer l'acc�s
  if (!isVerified) {
    console.log('Utilisateur non v�rifi� - acc�s bloqu�');
    return <Navigate to="/verification" replace />;
  }

  // Utilisateur v�rifi�, acc�s autoris�
  return children;
};

export default VerificationGuard;

