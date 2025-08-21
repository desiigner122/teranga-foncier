// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import GlobalAIChat from '@/components/ui/GlobalAIChat';
import DashboardAIAssistant from '@/components/ui/DashboardAIAssistant';
import { useToast } from "@/components/ui/use-toast";

const DashboardLayout = ({ children }) => {
  // Renommé pour plus de clarté, `false` = ouvert, `true` = réduit
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const { profile } = useAuth();
  const location = useLocation();

  // Déterminer le réle de l'utilisateur et le contexte du dashboard
  const getUserRole = () => {
    return profile?.role || profile?.type || 'user';
  };

  const getDashboardContext = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return { role: 'admin', section: 'administration' };
    if (path.includes('/notaire')) return { role: 'notaire', section: 'notarial' };
    if (path.includes('/particulier')) return { role: 'particulier', section: 'personal' };
    if (path.includes('/vendeur')) return { role: 'vendeur', section: 'sales' };
    if (path.includes('/banque')) return { role: 'banque', section: 'banking' };
    if (path.includes('/agent')) return { role: 'agent', section: 'agency' };
    if (path.includes('/mairie')) return { role: 'mairie', section: 'municipal' };
    return { role: getUserRole(), section: 'general' };
  }; 

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Main content area */}
      {/* md:pl-64 ou md:pl-20 selon l'état de la sidebar */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        {/* Header */}
        <Header>
          {/* Le bouton pour la version mobile est maintenant dans le Header */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="md:hidden mr-2"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Header>

        {/* Main content - pt-16 pour compenser la hauteur du header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16">
          <div className="max-w-full mx-auto p-4 sm:px-6 md:p-8">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>

      {/* Assistants IA */}
      {/* Assistant spécialisé dashboard é gauche */}
      <DashboardAIAssistant 
        userRole={getDashboardContext().role}
        dashboardContext={getDashboardContext()}
        onAction={(actionType, result) => {
        }}
      />

      {/* Chat IA global é droite */}
      <GlobalAIChat />
    </div>
  );
};

export default DashboardLayout;
