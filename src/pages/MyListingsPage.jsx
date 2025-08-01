import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, LandPlot, Clock, CheckCircle, AlertTriangle, ArrowRight, Edit, Trash2, UploadCloud, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';
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
import { useToast } from "@/components/ui/use-toast";

// Placeholder data
const sampleListings = [
  { id: 'PROP001', name: 'Terrain viabilisé Diamniadio', type: 'terrain', status: 'En vérification', dateSubmitted: '2025-05-01', price: 30000000 },
  { id: 'PROP002', name: 'Villa R+1 Sacré Coeur', type: 'immeuble', status: 'Publié', dateSubmitted: '2025-04-20', price: 120000000, parcelLink: '/parcelles/DK015' },
  { id: 'PROP003', name: 'Terrain agricole proche Thiès', type: 'terrain', status: 'Action requise', dateSubmitted: '2025-04-10', price: 15000000, message: "Document 'Titre Foncier' illisible. Veuillez re-soumettre." },
  { id: 'PROP004', name: 'Appartement Saly', type: 'immeuble', status: 'Vendu (Paiement en cours)', dateSubmitted: '2025-03-15', price: 55000000, paymentProgress: 40, totalPaid: 22000000 },
];

const getStatusInfo = (status) => {
    switch (status) {
      case 'En vérification': return { variant: 'warning', icon: Clock, text: 'En cours de vérification' };
      case 'Publié': return { variant: 'success', icon: CheckCircle, text: 'Publié' };
      case 'Action requise': return { variant: 'destructive', icon: AlertTriangle, text: 'Action requise' };
      case 'Vendu (Paiement en cours)': return { variant: 'info', icon: Banknote, text: 'Paiement en cours' };
      default: return { variant: 'secondary', icon: Clock, text: 'Inconnu' };
    }
};

const getTypeIcon = (type) => {
    return type === 'terrain' ? <LandPlot className="mr-1.5 h-4 w-4" /> : <Building className="mr-1.5 h-4 w-4" />;
};

const formatPrice = (price) => {
   return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

const MyListingsPage = () => {
   const [isLoading, setIsLoading] = useState(true);
   const [listings, setListings] = useState([]);
   const { toast } = useToast();

   useEffect(() => {
      const timer = setTimeout(() => {
          setListings(sampleListings);
          setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
   }, []);

   const handleDelete = (listingId) => {
       console.log("Deleting listing:", listingId);
       setListings(prev => prev.filter(l => l.id !== listingId));
       toast({
           title: "Bien supprimé",
           description: `Votre bien ${listingId} a été retiré.`,
       });
   };

   const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
   const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Mes Biens en Vente</h1>

      {isLoading ? (
         <div className="flex justify-center items-center py-20"><LoadingSpinner size="lg" /></div>
      ) : listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing) => {
             const statusInfo = getStatusInfo(listing.status);
             const StatusIcon = statusInfo.icon;
             return (
                <motion.div key={listing.id} variants={itemVariants}>
                   <Card className="hover:shadow-md transition-shadow border">
                      <CardHeader className="pb-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <CardTitle className="text-lg flex items-center">
                                 {getTypeIcon(listing.type)} {listing.name}
                              </CardTitle>
                              <Badge variant={statusInfo.variant} className="whitespace-nowrap w-fit">
                                 <StatusIcon className="mr-1.5 h-4 w-4" />
                                 {statusInfo.text}
                              </Badge>
                          </div>
                          <CardDescription>
                             ID: {listing.id} | Soumis le: {listing.dateSubmitted} | Prix: {formatPrice(listing.price)}
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          {listing.status === 'Action requise' && (
                              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{listing.message}</p>
                          )}
                          {listing.status === 'Vendu (Paiement en cours)' && (
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span>Progression du paiement</span>
                                    <span>{listing.paymentProgress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${listing.paymentProgress}%` }}></div>
                                </div>
                                <p className="text-sm text-muted-foreground">Montant perçu: {formatPrice(listing.totalPaid)}</p>
                            </div>
                          )}
                      </CardContent>
                      <CardFooter className="pt-4 flex flex-wrap gap-2 justify-end">
                         {listing.status === 'Publié' && listing.parcelLink && (
                             <Button variant="link" size="sm" asChild>
                                <Link to={listing.parcelLink}>Voir l'annonce <ArrowRight className="ml-1 h-3 w-3"/></Link>
                             </Button>
                         )}
                         <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4"/> Modifier
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                               <Trash2 className="mr-2 h-4 w-4"/> Supprimer
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Êtes-vous sûr de vouloir supprimer définitivement ce bien ({listing.name}) ? Cette action est irréversible.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Annuler</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDelete(listing.id)}>Supprimer</AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </CardFooter>
                   </Card>
                </motion.div>
             );
          })}
        </div>
      ) : (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center py-16 bg-card border rounded-lg shadow-sm"
         >
             <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
             <h2 className="text-xl font-semibold mb-2">Aucun bien soumis</h2>
             <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Vous n'avez pas encore proposé de bien à la vente sur notre plateforme.
             </p>
             <Button asChild>
                 <Link to="/sell-property">
                    <UploadCloud className="mr-2 h-4 w-4"/> Proposer un Bien
                 </Link>
             </Button>
         </motion.div>
      )}
    </motion.div>
  );
};

export default MyListingsPage;