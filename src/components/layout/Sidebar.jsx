import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
    ChevronDown, ChevronRight, ChevronLeft,
    LayoutDashboard, User, Settings, LogOut, Users, UserCheck, BarChart, FileSignature, FileCheck as FileCheckIcon,
    LifeBuoy, UploadCloud, Building, LandPlot, Heart, Bell, Banknote, TrendingUp, Leaf, Briefcase,
    MessageSquare, Home, PieChart, Globe, Palette, Package, ShoppingCart, Calendar, FileText, BookOpen, Layers,
    Handshake, Landmark, Gavel, Receipt, Archive, Activity, Scale, DollarSign, Store, Sprout, Shield, PlusCircle,
    MessageSquareText
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getSidebarConfig } from './sidebarConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const NavItem = ({ item, active, hasNotification }) => (
  <div className={cn(
    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-out",
    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )}>
    {item.icon && React.createElement(item.icon, { className: "mr-3 h-5 w-5" })}
    <span>{item.label}</span>
    {item.badge && <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>}
    {hasNotification && <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500" />}
  </div>
);

const SimpleNavItem = ({ item, hasNotification }) => {
  const location = useLocation();
  const isActive = item.end ? location.pathname === item.href : location.pathname.startsWith(item.href);

  return (
    <NavLink to={item.href} className="block">
      <NavItem item={item} active={isActive} hasNotification={hasNotification} />
    </NavLink>
  );
};

const CollapsibleNavItem = ({ item, hasNotification }) => {
  const location = useLocation();
  const isActive = item.subItems.some(subItem =>
    subItem.end ? location.pathname === subItem.href : location.pathname.startsWith(subItem.href)
  );
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-out",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center">
            {item.icon && React.createElement(item.icon, { className: "mr-3 h-5 w-5" })}
            <span>{item.label}</span>
            {hasNotification && <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500" />}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-4 space-y-1">
        {item.subItems.map(subItem => (
          <SimpleNavItem key={subItem.href} item={subItem} hasNotification={false} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarConfig = getSidebarConfig(user);

  // Simulation des notifications
  const notifications = {
    general: 5,
    requests: 2,
    messages: 3,
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Teranga Foncier Logo" className="h-8 w-auto" />
          <span className="text-lg">Teranga Foncier</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || user.email}`} />
              <AvatarFallback>{user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user.full_name || user.email}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.type || user.role}</span>
            </div>
          </div>
        )}
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {sidebarConfig.map(item => {
            if (item.isSeparator) return <div key={`separator-${item.label || Math.random()}`} className="my-2 border-t border-gray-200 dark:border-gray-700" />;
            if (item.isHeader) return <h3 key={item.label} className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">{item.label}</h3>;

            let itemHasNotification = false;
            if (item.label === 'Notifications' && notifications.general > 0) {
              itemHasNotification = true;
            } else if (item.label === 'Mes Demandes' && notifications.requests > 0) {
              itemHasNotification = true;
            } else if (item.label === 'Messagerie' && notifications.messages > 0) {
              itemHasNotification = true;
            }

            if (item.subItems) {
              return <CollapsibleNavItem key={item.label} item={item} hasNotification={itemHasNotification} />;
            }
            return <SimpleNavItem key={item.href} item={item} hasNotification={itemHasNotification} />;
        })}
      </nav>

        {/* Section du pied de page du sidebar (bouton et icône GitHub) */}
        <div className="p-3 mt-auto border-t border-gray-200 shrink-0 dark:border-gray-700">
            <Button asChild className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md mb-2">
                <Link to="/">Teranga Foncier <span className="ml-2 text-xs">V 1.0.0</span></Link>
            </Button>
            <div className="flex justify-center mt-2">
                <Link to="https://github.com/your-repo-link" target="_blank" rel="noopener noreferrer">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="h-6 w-6 opacity-75 hover:opacity-100 transition-opacity" />
                </Link>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
