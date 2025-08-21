// src/components/layout/header/AuthSection.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMessagingNotification } from '@/context/MessagingNotificationContext';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";


const getInitials = (email) => {
  if (!email) return '??';
  const namePart = email.split('@')[0];
  return namePart.substring(0, 2).toUpperCase();
};

const AuthSection = ({ isScrolled }) => {
  const { user, signOut } = useAuth(); // Utilise signOut
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = window.location;
  const isHomePage = pathname === '/';
  
  const useLightButtons = isHomePage && !isScrolled;

  // Get unread counts from MessagingNotificationContext
  const { unreadCounts, isFirebaseAvailable } = useMessagingNotification() || { 
    unreadCounts: { messages: 0, notifications: 0 }, 
    isFirebaseAvailable: false 
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Déconnexion réussie" });
    navigate('/');
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {user ? (
        <>
          {/* Messages Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-10 w-10" 
            asChild
          >
            <Link to="/dashboard/messaging">
              <MessageSquare className="h-5 w-5" />
              {unreadCounts.messages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCounts.messages > 99 ? '99+' : unreadCounts.messages}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary">
                  <AvatarImage src={user.avatar_url || `https://avatar.vercel.sh/${user.email}.png`} alt={user.full_name || user.email} />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold truncate">{user.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground font-normal capitalize">{user.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/dashboard"><LayoutGrid className="mr-2 h-4 w-4" /> Tableau de Bord</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2 h-4 w-4" /> Mon Profil</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Paramétres</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Connexion</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
