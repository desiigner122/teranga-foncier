// src/pages/admin/AdminUsersPage.jsx
// Deprecated legacy page kept only as a redirect shim to the new advanced users admin route.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminUsersPage() {
  return <Navigate to="/dashboard/admin/users" replace />;
}
