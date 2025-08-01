// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isSolutionDashboard = location.pathname.startsWith('/solutions/') && location.pathname.endsWith('/dashboard');

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSolutionDashboard={isSolutionDashboard} />

      {/* Overlay pour mobile lorsque le sidebar est ouvert */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content area */}
      {/* md:pl-64 pour laisser de la place au sidebar fixe sur desktop */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Header - passe le toggleSidebar via children */}
        {/* Le header est fixe en haut */}
        <Header isDashboard={true} isSolutionDashboard={isSolutionDashboard}>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden mr-2"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </Header>

        {/* Main content - pt-16 pour compenser la hauteur du header fixe (h-20 = 80px, donc pt-20) */}
        {/* Utilisation de p-4 pour un padding général, sm:px-6 pour les écrans plus grands, md:p-8 pour les très grands */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-20"> {/* Ajusté à pt-20 pour h-20 header */}
          <div className="max-w-full mx-auto p-4 sm:px-6 md:p-8">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
