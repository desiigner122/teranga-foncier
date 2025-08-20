import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';
import { User, Mail, Phone, KeyRound, Save, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Added phone state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || user.name || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || user.phone || ''); // Populate phone
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom et l'email ne peuvent pas �tre vides." });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      // Simulate updating user metadata which often includes name and phone.
      // Email update typically requires a separate flow with verification.
      const updatedUserData = { name, phone }; 
      await updateUserProfile({ data: updatedUserData }); // Supabase data update method for metadata

      toast({ title: "Profil mis � jour", description: "Vos informations ont �t� sauvegard�es avec succ�s." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: "Erreur de mise � jour", description: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }
    if (!newPassword) { // Current password check happens on backend
       toast({ variant: "destructive", title: "Erreur", description: "Le nouveau mot de passe ne peut pas �tre vide." });
       return;
    }
    setIsUpdatingPassword(true);
    try {
      await updateUserProfile({ password: newPassword }); // Supabase password update method
      toast({ title: "Mot de passe mis � jour", description: "Votre mot de passe a �t� chang� avec succ�s." });
      setCurrentPassword(''); // Clear current password for security if it was displayed/used
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      toast({ variant: "destructive", title: "Erreur de mise � jour du mot de passe", description: error.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    toast({ title: "D�connexion r�ussie", description: "Vous avez �t� d�connect�." });
    navigate('/');
  };
  
  const handleDeleteAccount = () => {
     // This is a sensitive operation. Usually involves more steps on backend.
     // For now, simulate and inform user.
     toast({
  title: "Suppression de Compte",
        description: "?? La suppression de compte n'est pas encore enti�rement fonctionnelle. Cette action sera irr�versible.",
        variant: "warning",
        duration: 5000,
     });
  }

  if (!user) {
    return <div className="container mx-auto py-12 text-center">Chargement du profil ou redirection...</div>;
  }
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4"
    >
      <motion.h1 variants={cardVariants} className="text-3xl md:text-4xl font-bold text-primary text-center">Mon Espace Personnel</motion.h1>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg hover:shadow-primary/10 transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Informations Personnelles</CardTitle>
            <CardDescription>Mettez � jour vos informations de profil.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Nom Complet</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isUpdatingProfile} placeholder="Votre nom complet" className="h-10"/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-email">Adresse Email</Label>
                <Input id="profile-email" type="email" value={email} disabled placeholder="Votre adresse email"/>
                <p className="text-xs text-muted-foreground">Pour changer d'email, veuillez contacter le support.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-phone">Num�ro de T�l�phone</Label>
                <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isUpdatingProfile} placeholder="+221 XX XXX XX XX" className="h-10"/>
              </div>
              <Button type="submit" disabled={isUpdatingProfile} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> {isUpdatingProfile ? 'Mise � jour en cours...' : 'Sauvegarder les Modifications'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg hover:shadow-primary/10 transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/>Changer le Mot de Passe</CardTitle>
            <CardDescription>Pour votre s�curit�, choisissez un mot de passe fort.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
               {/* For Supabase, current password is not needed on client if user is authenticated */}
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nouveau Mot de Passe</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isUpdatingPassword} required className="h-10" placeholder="Minimum 8 caract�res"/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-new-password">Confirmer le Nouveau Mot de Passe</Label>
                <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isUpdatingPassword} required className="h-10" placeholder="Retapez votre nouveau mot de passe"/>
              </div>
              <Button type="submit" disabled={isUpdatingPassword} className="w-full sm:w-auto">
                <ShieldCheck className="mr-2 h-4 w-4" /> {isUpdatingPassword ? 'Mise � jour en cours...' : 'Changer le Mot de Passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} className="space-y-4 pt-6 border-t">
         <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
           <LogOut className="mr-2 h-4 w-4" /> Se D�connecter
         </Button>
         
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto sm:ml-2">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon Compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>�tes-vous absolument s�r ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irr�versible et supprimera d�finitivement votre compte et toutes vos donn�es associ�es de Teranga Foncier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Oui, Supprimer mon Compte
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

    </motion.div>
  );
};

export default ProfilePage;
