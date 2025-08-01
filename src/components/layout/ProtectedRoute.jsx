// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.verification_status !== 'verified') {
    return <Navigate to="/verification" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;