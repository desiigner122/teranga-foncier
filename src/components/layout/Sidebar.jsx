// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
// Ce composant est maintenant juste pour l'affichage, il ne reéoit plus `active`
const NavItemContent = ({ item, unreadCount }) => (
  <>
    {item.icon && React.createElement(item.icon, { className: 'mr-3 h-5 w-5 flex-shrink-0' })}
    <span className="flex-grow">{item.label}</span>
    {unreadCount > 0 && (
      <Badge variant="destructive" className="ml-auto">
        {unreadCount}
      </Badge>
    )}
  </>
);

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, profile, signOut } = useAuth(); // signOut a été renommé dans AuthContext
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  
  // Utilise profile pour obtenir les informations de réle et type
  const sidebarConfig = getSidebarConfig(profile);

  // Get unread counts from MessagingNotificationContext
  const { unreadCounts } = useMessagingNotification() || { 
    unreadCounts: { messages: 0, notifications: 0 } 
  };     

  const toggleMenu = (label) => {
    if (!isCollapsed) {
      setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    }
  };

  useEffect(() => {
    if (isCollapsed) {
      setOpenMenus({}); // Ferme tous les menus si la sidebar est réduite
    }
  }, [isCollapsed]);

  // Ouvre le menu parent de la page active au chargement
  useEffect(() => {
    const activeParent = sidebarConfig.find(item => 
      item.subItems?.some(sub => location.pathname === sub.href)
    );
    if (activeParent) {
      setOpenMenus(prev => ({ ...prev, [activeParent.label]: true }));
    }
  }, [location.pathname, sidebarConfig]);

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen bg-card text-card-foreground border-r transition-all duration-300 z-40 flex flex-col',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex items-center p-4 border-b h-16">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 flex-shrink-0" />
          {!isCollapsed && <span className="text-lg font-bold whitespace-nowrap">Teranga Foncier</span>}
        </Link>
        <Button variant="ghost" size="icon" className="ml-auto hidden md:flex" onClick={toggleSidebar}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {profile && (
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || `https://avatar.vercel.sh/${profile.email}.png`} alt={profile.full_name || profile.email} />
            <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase() || profile.email?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{profile.full_name || profile.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.type || profile.role || 'Utilisateur'}</p>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {sidebarConfig.map((item, index) => {
          if (item.isSeparator) {
            return <hr key={`sep-${index}`} className="my-2 border-t border-border" />;
          }
          if (item.isHeader && !isCollapsed) {
            return (
              <div key={`head-${index}`} className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </div>
            );
          }
          if (item.subItems) {
            const isOpen = openMenus[item.label] || false;
            return (
              <Collapsible key={item.label} open={!isCollapsed && isOpen} onOpenChange={() => toggleMenu(item.label)}>
                <CollapsibleTrigger className="w-full">
                   <div className={cn(
                      'flex items-center p-3 text-sm font-medium rounded-md transition-colors w-full',
                      'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}>
                      {item.icon && React.createElement(item.icon, { className: 'mr-3 h-5 w-5 flex-shrink-0' })}
                      {!isCollapsed && <span className="flex-grow text-left">{item.label}</span>}
                      {!isCollapsed && <ChevronDown className={cn('h-4 w-4 ml-auto transition-transform', isOpen && 'rotate-180')} />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className={cn("overflow-hidden transition-all", isCollapsed ? "pl-0" : "pl-4")}>
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.href}
                      to={subItem.href}
                      end={subItem.end}
                      className={({ isActive }) => cn(
                        'flex items-center p-3 text-sm font-medium rounded-md transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <NavItemContent item={subItem} unreadCount={0} />
                    </NavLink>
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
              className={({ isActive }) => cn(
                'flex items-center p-3 text-sm font-medium rounded-md transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <NavItemContent 
                item={item} 
                unreadCount={item.href.includes('notifications') ? unreadCounts.notifications : item.href.includes('messaging') ? unreadCounts.messages : 0} 
              />
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start p-3" onClick={signOut}>
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
