import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useMessagingNotification } from '@/context/MessagingNotificationContext';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL_MS = 15000;

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { markAllNotificationsAsRead } = useMessagingNotification() || {};
  const navigate = useNavigate();

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await SupabaseDataService.listNotifications(user.id, { unreadOnly:false, limit:20 });
      setNotifications(list);
      setUnreadCount(list.filter(n=>!n.read).length);
    } catch(e) { /* silent */ }
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [user]);
  useEffect(()=>{ if (!user) return; const id = setInterval(load, POLL_INTERVAL_MS); return ()=>clearInterval(id); }, [user]);

  const markRead = async (id) => {
    await SupabaseDataService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read:true, read_at:new Date().toISOString() } : n));
    setUnreadCount(c => Math.max(0, c-1));
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-auto">
        <DropdownMenuLabel className="flex justify-between items-center gap-2">
          <span>Notifications</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="xs" className="h-6 px-2 text-[10px]" disabled={unreadCount===0} onClick={(e)=>{ e.stopPropagation(); markAllNotificationsAsRead && markAllNotificationsAsRead(); setUnreadCount(0); }}>
              <CheckCheck className="h-3 w-3 mr-1" /> Tout lu
            </Button>
            <Button variant="ghost" size="xs" className="h-6 px-2 text-[10px]" onClick={(e)=>{ e.stopPropagation(); navigate('/dashboard/notifications'); }}>
              <ExternalLink className="h-3 w-3 mr-1" /> Voir tout
            </Button>
          </div>
          {loading && <span className="text-[10px] text-muted-foreground ml-2">Maj...</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">Aucune notification</div>
        )}
        {notifications.map(n => (
          <DropdownMenuItem key={n.id} className="whitespace-normal flex flex-col items-start space-y-1" onClick={() => !n.read && markRead(n.id)}>
            <div className="flex w-full items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-primary font-medium">{n.type}</span>
              {!n.read && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Nouveau</span>}
            </div>
            <p className="text-sm font-medium leading-tight">{n.title}</p>
            {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

