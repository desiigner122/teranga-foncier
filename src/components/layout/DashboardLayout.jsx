// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardLayout = ({ children }) => {
  // Renommé pour plus de clarté, `false` = ouvert, `true` = réduit
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

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
    </div>
  );
};

export default DashboardLayout;