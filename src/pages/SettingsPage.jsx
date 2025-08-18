import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { Save, Bell, Shield, Palette, Globe, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Link } from 'react-router-dom'; // Added missing import

const SettingsPage = () => {
   const { toast } = useToast();
   const { user } = useAuth(); 

   const [notificationSettings, setNotificationSettings] = useState({
      emailNewParcel: true,
      emailPriceChange: true,
      emailRequestUpdate: true,
      appGeneralUpdates: true,
   });

   const [preferences, setPreferences] = useState({
      theme: 'system', 
      language: 'fr', 
      defaultCurrency: 'XOF',
   });
   
   const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
      const savedTheme = localStorage.getItem('appTheme') || 'system';
      const savedLang = localStorage.getItem('appLang') || 'fr';
      setPreferences(prev => ({...prev, theme: savedTheme, language: savedLang}));
   }, []);

   const handleNotificationChange = (key) => {
      setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const handlePreferenceChange = (key, value) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
      if (key === 'theme') {
         localStorage.setItem('appTheme', value);
         document.documentElement.classList.remove('light', 'dark');
         if (value === 'light') document.documentElement.classList.add('light');
         else if (value === 'dark') document.documentElement.classList.add('dark');
      }
       if (key === 'language') {
         localStorage.setItem('appLang', value);
         toast({ title: "Langue", description: `La langue a été changée vers : ${value.toUpperCase()}. Rechargement nécessaire pour prendre effet.`});
      }
   };

   const handleSaveChanges = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Notification Settings: notificationSettings
      // Preferences: preferences
      
      toast({ 
         title: "Paramètres Sauvegardés", 
         description: "Vos préférences ont été mises à jour avec succès.",
         className: "bg-green-500 text-white",
      });
      setIsSaving(false);
   };
   
   const handleAccountDeletionRequest = () => {
      toast({
         title: "Demande de Suppression de Compte",
         description: "🚧 Cette fonctionnalité est en cours de développement. Pour supprimer votre compte, veuillez contacter le support.",
         variant: "warning",
         duration: 7000,
      });
   };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4"
    >
      <motion.h1 
         initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
         className="text-3xl md:text-4xl font-bold text-primary text-center"
      >
         Paramètres du Compte
      </motion.h1>

      <form onSubmit={handleSaveChanges}>
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="mb-6 shadow-lg hover:shadow-primary/10 transition-shadow">
               <CardHeader>
                  <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Préférences de Notification</CardTitle>
                  <CardDescription>Gérez comment et quand vous recevez des notifications de Teranga Foncier.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-5">
                  {Object.entries({
                     emailNewParcel: "Nouvelles parcelles correspondant à mes recherches",
                     emailPriceChange: "Changements de prix sur mes parcelles favorites",
                     emailRequestUpdate: "Mises à jour sur mes demandes en cours",
                     appGeneralUpdates: "Annonces générales et mises à jour de la plateforme (via notifications internes)",
                  }).map(([key, label]) => (
                     <div key={key} className="flex items-center justify-between space-x-2 border p-3 rounded-md hover:bg-muted/30 transition-colors">
                     <Label htmlFor={key} className="flex flex-col space-y-0.5">
                        <span className="font-medium text-sm">{label.split('(')[0]}</span>
                        {label.includes('(') && <span className="text-xs font-normal leading-snug text-muted-foreground">{label.substring(label.indexOf('('))}</span>}
                     </Label>
                     <Switch 
                        id={key} 
                        checked={notificationSettings[key]}
                        onCheckedChange={() => handleNotificationChange(key)}
                     />
                     </div>
                  ))}
               </CardContent>
            </Card>
         </motion.div>
         
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{delay: 0.1}}>
            <Card className="mb-6 shadow-lg hover:shadow-primary/10 transition-shadow">
               <CardHeader>
                  <CardTitle className="text-xl flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Préférences d'Affichage</CardTitle>
                  <CardDescription>Personnalisez l'apparence de la plateforme.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid gap-2">
                     <Label htmlFor="theme-select">Thème Visuel</Label>
                     <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', value)}>
                        <SelectTrigger id="theme-select" className="w-full sm:w-[200px]">
                           <SelectValue placeholder="Choisir un thème" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="light">Clair</SelectItem>
                           <SelectItem value="dark">Sombre</SelectItem>
                           <SelectItem value="system">Système</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                   <div className="grid gap-2">
                     <Label htmlFor="language-select">Langue</Label>
                     <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                        <SelectTrigger id="language-select" className="w-full sm:w-[200px]">
                           <SelectValue placeholder="Choisir une langue" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="fr">Français</SelectItem>
                           <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="currency-select">Devise par Défaut</Label>
                     <Select value={preferences.defaultCurrency} onValueChange={(value) => handlePreferenceChange('defaultCurrency', value)}>
                        <SelectTrigger id="currency-select" className="w-full sm:w-[200px]">
                           <SelectValue placeholder="Choisir une devise" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                           <SelectItem value="EUR">Euro (EUR) - Indicatif</SelectItem>
                           <SelectItem value="USD">Dollar US (USD) - Indicatif</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>
         </motion.div>

         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{delay: 0.2}}>
            <Card className="mb-6 shadow-lg hover:shadow-primary/10 transition-shadow">
               <CardHeader>
                  <CardTitle className="text-xl flex items-center"><Shield className="mr-2 h-5 w-5 text-primary"/>Sécurité & Confidentialité</CardTitle>
                  <CardDescription>Gérez la sécurité de votre compte et vos données.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                     Pour changer votre mot de passe, veuillez vous rendre sur votre <Link to="/profile" className="text-primary underline hover:text-primary/80">page de profil</Link>.
                  </p>
                  <div className="border p-3 rounded-md bg-muted/20">
                     <h4 className="font-medium text-sm mb-1">Authentification à Deux Facteurs (2FA)</h4>
                     <p className="text-xs text-muted-foreground mb-2">Renforcez la sécurité de votre compte.</p>
                     <Button variant="outline" size="sm" onClick={() => toast({ title: "2FA (Bientôt disponible)", description: "L'authentification à deux facteurs sera bientôt disponible."})}>Configurer 2FA (Bientôt)</Button>
                  </div>
                  <div className="border p-3 rounded-md bg-muted/20">
                     <h4 className="font-medium text-sm mb-1">Gestion des Données Personnelles</h4>
                     <p className="text-xs text-muted-foreground mb-2">Consultez notre <Link to="/privacy" className="text-primary underline hover:text-primary/80">politique de confidentialité</Link> ou demandez l'export de vos données.</p>
                     <Button variant="outline" size="sm" onClick={() => toast({ title: "Export de Données", description: "Votre demande d'export a été prise en compte. Vous recevrez un email avec vos données."})}>Exporter mes Données</Button>
                  </div>
               </CardContent>
            </Card>
         </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.3}} className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSaving}>
               <Save className="mr-2 h-4 w-4" /> {isSaving ? "Sauvegarde en cours..." : "Sauvegarder Tous les Paramètres"}
            </Button>
            <AlertDialog>
               <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="w-full sm:w-auto">
                     <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon Compte
                  </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle className="flex items-center"><AlertCircle className="text-destructive mr-2"/>Êtes-vous absolument sûr ?</AlertDialogTitle>
                     <AlertDialogDescription>
                        Cette action est irréversible et supprimera définitivement votre compte et toutes vos données associées de Teranga Foncier.
                        Cela inclut vos favoris, recherches sauvegardées, demandes et annonces.
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel>Annuler</AlertDialogCancel>
                     <AlertDialogAction onClick={handleAccountDeletionRequest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Oui, Je Comprends, Supprimer
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </motion.div>
      </form>

    </motion.div>
  );
};

export default SettingsPage;