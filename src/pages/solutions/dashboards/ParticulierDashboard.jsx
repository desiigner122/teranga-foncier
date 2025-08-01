    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/context/AuthContext'; // <<< CORRECTION DU CHEMIN ICI
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, FileText, UserCheck, Briefcase, TrendingUp, Leaf, Info, CalendarDays } from 'lucide-react';
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

    const sampleAssignedAgent = {
      name: "Agent Foncier Alioune",
      email: "alioune.agent@teranga.sn",
      phone: "+221 77 123 45 67",
      avatarDesc: "Agent Alioune",
    };

    const sampleUserInvestments = [
      { id: 'dk-alm-002', name: 'Terrain Résidentiel Almadies', purchasePrice: 150000000, currentValue: 165000000, purchaseDate: '2023-01-15' },
      { id: 'sly-ngp-010', name: 'Parcelle Agricole Ngaparou', purchasePrice: 30000000, currentValue: 32000000, purchaseDate: '2024-03-01' },
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

      const [events, setEvents] = useState([
        { id: 1, title: 'Visite parcelle SLY-005', date: new Date(2025, 7, 10, 14, 0), status: 'Confirmée' },
        { id: 2, title: 'Rendez-vous Notaire', date: new Date(2025, 7, 15, 10, 30), status: 'En attente' },
        { id: 3, title: 'Échéance paiement impôt foncier', date: new Date(2025, 8, 1), status: 'À venir' },
      ]);

      const handleVisitFormChange = (e) => {
        const { name, value } = e.target;
        setVisitFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleRequestVisit = (e) => {
        e.preventDefault();
        toast({
          title: "Demande de visite envoyée !",
          description: `Visite pour la parcelle ${visitFormData.parcelId} le ${visitFormData.date} à ${visitFormData.time} a été demandée.`,
        });
        setIsVisitModalOpen(false);
        // Ici, vous enverriez la demande à votre backend (Supabase)
      };

      const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);

      if (!user) {
        return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <LoadingSpinner size="large" />
          </div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <UserCheck className="h-8 w-8 mr-3 text-green-600"/>
            Bienvenue, {user.full_name || user.email} !
          </h1>
          <p className="text-muted-foreground">Votre tableau de bord personnel pour la gestion de vos affaires foncières.</p>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Mes Informations Clés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5"/>Vos Informations</CardTitle>
                <CardDescription>Détails de votre profil et accès rapide.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                <p><span className="font-semibold">Téléphone:</span> {user.phone || 'Non renseigné'}</p>
                <p><span className="font-semibold">Type de compte:</span> {user.type}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="link">
                  <Link to="/profile">Gérer mon profil <ArrowRight className="ml-1 h-4 w-4"/></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Mes Demandes en Cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/>Mes Demandes en Cours</CardTitle>
                <CardDescription>Suivez l'état de vos requêtes.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sampleRequests.filter(req => req.user_id === user.id).slice(0, 3).map(req => (
                    <li key={req.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                       <div className="flex-shrink-0 pt-1">
                          {req.status === 'pending' ? <CalendarDays className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                       </div>
                       <div>
                          <p className="font-medium text-sm capitalize">{req.request_type}</p>
                          <p className="text-xs text-muted-foreground">Statut: <span className="font-semibold">{req.status}</span></p>
                       </div>
                    </li>
                  ))}
                  {sampleRequests.filter(req => req.user_id === user.id).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center">Aucune demande en cours.</p>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="link">
                  <Link to="/dashboard/my-requests">Voir toutes mes demandes <ArrowRight className="ml-1 h-4 w-4"/></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Mon Agent Attitré */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><UserCheck className="mr-2 h-5 w-5"/>Mon Agent Attitré</CardTitle>
                <CardDescription>Contactez votre agent dédié pour toute assistance.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${sampleAssignedAgent.avatarDesc}`} alt={sampleAssignedAgent.avatarDesc} />
                  <AvatarFallback>{sampleAssignedAgent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{sampleAssignedAgent.name}</p>
                  <p className="text-sm text-muted-foreground">{sampleAssignedAgent.email}</p>
                  <p className="text-sm text-muted-foreground">{sampleAssignedAgent.phone}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="link">
                  <Link to="/messaging?to=agent">Envoyer un message <ArrowRight className="ml-1 h-4 w-4"/></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Mes Investissements Fonciers (Simulés) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Mes Investissements Fonciers</CardTitle>
                <CardDescription>Aperçu de vos acquisitions et de leur valeur.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Parcelle</th>
                        <th className="text-left p-2 font-semibold">Prix Achat</th>
                        <th className="text-left p-2 font-semibold">Valeur Actuelle</th>
                        <th className="text-left p-2 font-semibold">Plus/Moins Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleUserInvestments.map(inv => (
                        <tr key={inv.id} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{inv.name}</td>
                          <td className="p-2">{formatPrice(inv.purchasePrice)}</td>
                          <td className="p-2">{formatPrice(inv.currentValue)}</td>
                          <td className="p-2">
                            <span className={`font-semibold ${inv.currentValue >= inv.purchasePrice ? 'text-green-500' : 'text-red-500'}`}>
                              {formatPrice(inv.currentValue - inv.purchasePrice)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="link">
                  <Link to="/dashboard/my-acquisitions">Voir toutes mes acquisitions <ArrowRight className="ml-1 h-4 w-4"/></Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Calendrier / Événements */}
            <Card id="calendar-card">
                <CardHeader>
                    <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5"/> Mes Événements</CardTitle>
                    <CardDescription>Vos prochains rendez-vous et échéances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {events.slice(0, 4).map(event => (
                            <li key={event.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                               <div className="flex-shrink-0 pt-1">
                                  <CalendarDays className="h-4 w-4 text-primary" />
                               </div>
                               <div>
                                  <p className="font-medium text-sm">{event.title}</p>
                                  <p className="text-xs text-muted-foreground">{event.date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} - <span className="font-semibold">{event.status}</span></p>
                               </div>
                            </li>
                        ))}
                    </ul>
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm">Voir tout</Button>
                </CardContent>
            </Card>
        </div>
        
        {/* Demander une Visite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Demander une Visite de Parcelle</CardTitle>
            <CardDescription>Planifiez une visite pour une parcelle qui vous intéresse.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsVisitModalOpen(true)}>Demander une Visite</Button>
          </CardContent>
        </Card>

        {/* Modal de Demande de Visite */}
        <Dialog open={isVisitModalOpen} onOpenChange={setIsVisitModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Demander une Visite</DialogTitle>
              <DialogDescription>
                Remplissez les détails pour planifier une visite de parcelle.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestVisit} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="parcelId">Parcelle</Label>
                <select
                  id="parcelId"
                  name="parcelId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
    