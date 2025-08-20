// src/pages/admin/AdminUsersPage.jsx
// Deprecated legacy page kept only as a redirect shim to the new advanced users admin route.
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminUsersPage() {
  return <Navigate to="/dashboard/admin/users" replace />;
}
