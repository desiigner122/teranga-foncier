// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  LayoutDashboard, User, Settings, LogOut, Users, UserCheck, BarChart, FileSignature, FileCheck,
  LifeBuoy, UploadCloud, Building, LandPlot, Heart, Bell, Banknote, TrendingUp, Leaf, Briefcase,
  MessageSquare, Home, PieChart, Globe, Palette, Package, ShoppingCart, Calendar, FileText, BookOpen, Layers,
  Handshake, Landmark, Gavel, Receipt, Archive, Activity, Scale, DollarSign, Store, Sprout, Shield, PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
// import { useMessagingNotification } from '@/context/MessagingNotificationContext'; // Commenté car désactivé temporairement
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getSidebarConfig } from './sidebarConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const NavItem = ({ item, active, unreadCount }) => (
  <div className={cn(
    'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-out',
    active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  )}>
    {item.icon && React.createElement(item.icon, { className: 'mr-3 h-5 w-5' })}
    <span>{item.label}</span>
    {unreadCount > 0 && (
      <Badge variant="destructive" className="ml-auto">
        {unreadCount}
      </Badge>
    )}
  </div>
);

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, profile, logout } = useAuth(); // Récupérer le profil pour le type/rôle
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  
  // Passer l'objet user complet (qui inclut le rôle et le type du profil)
  const sidebarConfig = getSidebarConfig(user ? { ...user, ...profile } : null);

  // Les compteurs sont forcés à 0 car la fonctionnalité est désactivée temporairement
  const unreadNotifications = 0; 
  const unreadMessages = 0;     

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Effet pour ouvrir les sous-menus basés sur la route actuelle
  useEffect(() => {
    sidebarConfig.forEach(item => {
      if (item.subItems && item.subItems.some(subItem => location.pathname.startsWith(subItem.href))) {
        setOpenMenus(prev => ({ ...prev, [item.label]: true }));
      }
    });
  }, [location.pathname, sidebarConfig]);


  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen bg-background border-r transition-all duration-300 z-40',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Teranga Foncier" className="h-8 w-8" />
              <span className="text-lg font-semibold">Teranga Foncier</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {user && (
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || user.email} />
              <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-semibold truncate">{profile?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.type || profile?.role || 'Utilisateur'}</p>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarConfig.map((item, index) => {
            if (item.isSeparator) {
              return <hr key={index} className="my-2 mx-4 border-t border-muted" />;
            }
            if (item.isHeader) {
              return !isCollapsed && (
                <div key={index} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  {item.label}
                </div>
              );
            }
            if (item.subItems) {
              const isOpen = openMenus[item.label];
              return (
                <Collapsible key={item.label} open={isOpen} onOpenChange={() => toggleMenu(item.label)}>
                  <CollapsibleTrigger asChild>
                    <div className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md mx-2',
                      location.pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                    )}>
                      {item.icon && React.createElement(item.icon, { className: 'mr-3 h-5 w-5' })}
                      {!isCollapsed && <span>{item.label}</span>}
                      {!isCollapsed && (
                        <div className="ml-auto">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.href}
                        to={subItem.href}
                        end={subItem.end}
                        className={({ isActive }) => (
                          <NavItem
                            item={subItem}
                            active={isActive}
                            unreadCount={subItem.href === '/dashboard/notifications' ? unreadNotifications : subItem.href === '/dashboard/messaging' ? unreadMessages : 0}
                          />
                        )}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) => (
                  <NavItem
                    item={item}
                    active={isActive}
                    unreadCount={item.href === '/dashboard/notifications' ? unreadNotifications : item.href === '/dashboard/messaging' ? unreadMessages : 0}
                  />
                )}
              />
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" />
            {!isCollapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
