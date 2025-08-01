import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, UserCheck, Briefcase, TrendingUp, Leaf, Info, CalendarDays, MessageSquare } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sampleParcels, sampleUserListings, sampleRequests } from '@/data/index.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Données simulées pour les événements du calendrier
const sampleEvents = [
  {
    id: 1,
    title: 'Visite parcelle Saly',
    start: new Date(2025, 7, 10, 10, 0), // Août est le mois 7 (0-indexé)
    end: new Date(2025, 7, 10, 11, 0),
    status: 'Confirmée',
  },
  {
    id: 2,
    title: 'Rendez-vous Notaire Diop',
    start: new Date(2025, 7, 15, 14, 30),
    end: new Date(2025, 7, 15, 15, 30),
    status: 'En attente',
  },
  {
    id: 3,
    title: 'Échéance paiement terrain',
    start: new Date(2025, 7, 20, 9, 0),
    end: new Date(2025, 7, 20, 9, 0),
    status: 'À venir',
  },
];

const sampleAssignedAgent = {
  name: "Agent Foncier Alioune",
  email: "alioune.agent@teranga.sn",
  phone: "+221 77 123 45 67",
  avatarDesc: "Agent Alioune",
};

const sampleUserInvestments = [
  { id: 'dk-alm-002', name: 'Terrain Résidentiel Almadies', purchasePrice: 150000000, currentValue: 165000000, purchaseDate: '2023-01-15', status: 'Actif' },
  { id: 'sly-ngp-010', name: 'Parcelle Agricole Ngor', purchasePrice: 50000000, currentValue: 52000000, purchaseDate: '2024-03-01', status: 'Actif' },
];

const ParticulierDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitFormData, setVisitFormData] = useState({
    parcelId: '',
    date: '',
    time: '',
    notes: '',
  });
  const [events, setEvents] = useState(sampleEvents); // État pour les événements du calendrier

  const handleVisitFormChange = (e) => {
    const { name, value } = e.target;
    setVisitFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleVisit = (e) => {
    e.preventDefault();
    // Ici, vous enverriez les données à votre backend (Supabase)
    console.log("Demande de visite soumise:", visitFormData);
    toast({
      title: "Demande de visite envoyée",
      description: `Votre demande pour la parcelle ${visitFormData.parcelId} le ${visitFormData.date} à ${visitFormData.time} a été enregistrée.`,
    });
    setIsVisitModalOpen(false);
    setVisitFormData({ parcelId: '', date: '', time: '', notes: '' }); // Réinitialiser le formulaire

    // Ajouter l'événement au calendrier simulé
    const newEvent = {
      id: Date.now(),
      title: `Visite parcelle ${visitFormData.parcelId}`,
      start: new Date(`${visitFormData.date}T${visitFormData.time}:00`),
      end: new Date(`${visitFormData.date}T${visitFormData.time}:00`), // Pour un point dans le temps
      status: 'En attente',
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Filtrer les annonces de l'utilisateur connecté
  const userListings = sampleUserListings.filter(listing => listing.userId === user?.id);
  // Filtrer les demandes de l'utilisateur connecté
  const userRequests = sampleRequests.filter(req => req.user_id === user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <User className="h-8 w-8 mr-3 text-blue-600"/>
            Bienvenue, {user?.full_name || 'Particulier'} !
          </h1>
          <p className="text-muted-foreground">Votre tableau de bord personnalisé pour gérer vos biens et vos demandes.</p>
        </div>
        <Button onClick={() => setIsVisitModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
          <CalendarDays className="mr-2 h-4 w-4" /> Planifier une Visite
        </Button>
      </div>

      {/* Section des Statistiques Clés */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Annonces Actives</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userListings.length} <span className="text-sm text-muted-foreground">annonces</span></div>
            <p className="text-xs text-muted-foreground">Dernière mise à jour: Aujourd'hui</p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/my-listings" className="text-sm font-medium text-blue-600 hover:underline flex items-center">
              Voir mes annonces <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Demandes en Cours</CardTitle>
            <Briefcase className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRequests.filter(req => req.status === 'En cours' || req.status === 'Nouvelle').length} <span className="text-sm text-muted-foreground">demandes</span></div>
            <p className="text-xs text-muted-foreground">Total: {userRequests.length} demandes</p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/my-requests" className="text-sm font-medium text-purple-600 hover:underline flex items-center">
              Suivre mes demandes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Investissements Fonciers</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleUserInvestments.length} <span className="text-sm text-muted-foreground">biens</span></div>
            <p className="text-xs text-muted-foreground">Valeur estimée: {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(sampleUserInvestments.reduce((sum, inv) => sum + inv.currentValue, 0))}</p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/my-acquisitions" className="text-sm font-medium text-green-600 hover:underline flex items-center">
              Voir mes acquisitions <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Section Agent Attribué */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><UserCheck className="mr-2 h-5 w-5"/> Mon Agent Dédié</CardTitle>
            <CardDescription>Contactez votre agent pour toute assistance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${sampleAssignedAgent.avatarDesc}`} alt={sampleAssignedAgent.avatarDesc} />
                <AvatarFallback>{sampleAssignedAgent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{sampleAssignedAgent.name}</p>
                <p className="text-sm text-muted-foreground">{sampleAssignedAgent.email}</p>
                <p className="text-sm text-muted-foreground">{sampleAssignedAgent.phone}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full">
              <MessageSquare className="mr-2 h-4 w-4" /> Envoyer un message
            </Button>
          </CardContent>
        </Card>

        {/* Section Calendrier / Événements */}
        <div className="lg:col-span-2 space-y-6">
            <Card id="calendar-card">
                <CardHeader>
                    <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5"/> Mes Événements</CardTitle>
                    <CardDescription>Vos prochains rendez-vous et échéances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        messages={{
                            next: "Suivant",
                            previous: "Précédent",
                            today: "Aujourd'hui",
                            month: "Mois",
                            week: "Semaine",
                            day: "Jour",
                            agenda: "Agenda",
                            date: "Date",
                            time: "Heure",
                            event: "Événement",
                            noEventsInRange: "Aucun événement dans cette période.",
                            showMore: total => `+ ${total} de plus`,
                        }}
                        formats={{
                            dateFormat: 'dd/MM',
                            dayFormat: 'dd/MM',
                            monthHeaderFormat: 'MMMM yyyy',
                            dayHeaderFormat: 'EEEE dd MMMM',
                            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                                localizer.format(start, 'DD MMM', culture) + ' - ' + localizer.format(end, 'DD MMM', culture),
                            timeGutterFormat: 'HH:mm',
                            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                                localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
                        }}
                        culture="fr"
                    />
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Modale de planification de visite */}
      <Dialog open={isVisitModalOpen} onOpenChange={setIsVisitModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Planifier une Visite de Parcelle</DialogTitle>
            <DialogDescription>
              Remplissez les détails pour demander une visite.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleVisit} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="parcelId" className="text-right">
                Référence Parcelle
              </Label>
              <select
                id="parcelId"
                name="parcelId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={visitFormData.parcelId}
                onChange={handleVisitFormChange}
                required
              >
                <option value="" disabled>Sélectionnez une parcelle</option>
                {sampleParcels.filter(p => p.status === 'Disponible').map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.location_name} ({p.reference})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" name="date" value={visitFormData.date} onChange={handleVisitFormChange} required />
              </div>
              <div>
                <Label htmlFor="time">Heure</Label>
                <Input type="time" id="time" name="time" value={visitFormData.time} onChange={handleVisitFormChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea id="notes" name="notes" placeholder="Préférences, questions spécifiques..." value={visitFormData.notes} onChange={handleVisitFormChange} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsVisitModalOpen(false)}>Annuler</Button>
              <Button type="submit">Envoyer la Demande</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default ParticulierDashboard;
