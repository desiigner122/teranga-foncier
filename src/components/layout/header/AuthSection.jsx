// src/components/layout/header/AuthSection.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importer useNavigate
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutGrid, User, LogOut, Settings, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast"; // Importer useToast
import { cn } from '@/lib/utils';
import { sampleNotifications, sampleConversations } from '@/data';

const getInitials = (email) => {
  if (!email) return '??';
  const namePart = email.split('@')[0];
  return namePart.substring(0, 2).toUpperCase();
};

const AuthSection = ({ isScrolled }) => {
  // --- CORRECTION 1 : Utiliser signOut au lieu de logout ---
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = window.location;
  const isHomePage = pathname === '/';
  
  const useLightButtons = isHomePage && !isScrolled;

  // Simulation data fetching
  const unreadNotifications = user ? sampleNotifications.filter(n => n.user_id === user?.id && !n.is_read).length : 0;
  const unreadMessages = user ? sampleConversations.filter(c => c.participants.includes(user?.id) && c.unread_count > 0).length : 0;

  // --- CORRECTION 2 : Créer une fonction pour gérer la déconnexion ---
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/'); // Rediriger vers la page d'accueil
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {user ? (
        <>
          <Button variant="ghost" size="icon" className="relative h-10 w-10" asChild>
            <Link to="/messaging">
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative h-10 w-10" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
                  <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} alt={user.full_name || user.email} />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold truncate">{user.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground font-normal capitalize">{user.type || user.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard"><LayoutGrid className="mr-2 h-4 w-4" /> Tableau de Bord</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile"><User className="mr-2 h-4 w-4" /> Mon Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Paramètres</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* --- CORRECTION 3 : Appeler notre nouvelle fonction handleLogout --- */}
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40">
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className={cn(
                "hover:bg-primary/10",
                useLightButtons ? 'text-white hover:text-white hover:bg-white/20' : 'text-foreground'
            )}
            size="sm"
            asChild
          >
            <Link to="/login">Connexion</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthSection;