// src/pages/DashboardPage.jsx - Dashboard Dispatcher
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';
import VerificationRequired from '@/components/VerificationRequired';

/**
 * DashboardPage Component - Dashboard Dispatcher
 * 
 * This component acts as a centralized dispatcher for authenticated users.
 * When a user accesses /dashboard, this component reads their role and type
 * from AuthContext and redirects them to their specific dashboard entry point.
 * 
 * Routing Philosophy:
 * - /dashboard/admin - Administrator dashboard
 * - /dashboard/agent - Agent dashboard  
 * - /dashboard/vendeur - Seller dashboard
 * - /dashboard/mairie - Municipality dashboard
 * - /dashboard/banque - Bank dashboard
 * - /dashboard/notaire - Notary dashboard
 * - /dashboard/promoteur - Developer dashboard
 * - /dashboard/agriculteur - Farmer dashboard
 * - /dashboard/investisseur - Investor dashboard
 * - /dashboard/particulier - Individual dashboard
 */
const DashboardPage = () => {
  const { 
    isAuthenticated, 
    user, 
    profile, 
    loading: authLoading,
    needsVerification,
    isPendingVerification,
    isVerified,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      // Si l'utilisateur nécessite une vérification (sauf admin), on affiche le composant de vérification
      if (!isAdmin && (needsVerification || isPendingVerification)) {
        return; // Le composant VerificationRequired sera affiché
      }

      let dashboardPath = '/dashboard/particulier'; // Default fallback

      // Determine dashboard path based on user role and type
      if (profile.role === 'admin' || profile.type === 'Administrateur') {
        dashboardPath = '/dashboard/admin';
      } else if (profile.role === 'agent' || profile.type === 'Agent') {
        dashboardPath = '/dashboard/agent';
      } else {
        // Route based on user type
        switch (profile.type) {
          case 'Vendeur':
            dashboardPath = '/dashboard/vendeur';
            break;
          case 'Mairie':
            dashboardPath = '/dashboard/mairie';
            break;
          case 'Banque':
            dashboardPath = '/dashboard/banque';
            break;
          case 'Notaire':
            dashboardPath = '/dashboard/notaire';
            break;
          case 'Promoteur':
            dashboardPath = '/dashboard/promoteur';
            break;
          case 'Agriculteur':
            dashboardPath = '/dashboard/agriculteur';
            break;
          case 'Investisseur':
            dashboardPath = '/dashboard/investisseur';
            break;
          case 'Particulier':
          default:
            dashboardPath = '/dashboard/particulier';
            break;
        }
      }

      // Redirect to the appropriate dashboard
      navigate(dashboardPath, { replace: true });
    }
  }, [authLoading, isAuthenticated, profile, navigate, needsVerification, isPendingVerification, isAdmin]);

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show verification component if user needs verification or is pending (but not admin)
  if (!isAdmin && (needsVerification || isPendingVerification)) {
    return <VerificationRequired />;
  }

  // Show loading state while redirect is happening
  return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <LoadingSpinner size="large" />
      <p className="ml-4 text-muted-foreground">Redirection vers votre tableau de bord...</p>
    </div>
  );
};

export default DashboardPage;
