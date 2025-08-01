import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize, Calendar, FileText, ShieldCheck, Info, ShoppingCart, CalendarPlus, Heart, Share2 } from 'lucide-react'; // Added Heart, Share2

const getStatusVariant = (status) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Réservée': return 'warning';
      case 'Vendue': return 'destructive';
      default: return 'secondary';
    }
};

const formatPrice = (price) => {
   return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

const ParcelInfoCard = ({ parcel, onRequestInfo, onInitiateBuy, onRequestVisit, onAddToFavorites }) => {

   const handleShare = () => {
       if (navigator.share) {
           navigator.share({
               title: parcel.name,
               text: `Découvrez cette parcelle sur Teranga Foncier: ${parcel.name}`,
               url: window.location.href,
           })
           .then(() => console.log('Successful share'))
           .catch((error) => console.log('Error sharing', error));
       } else {
           // Fallback for browsers that don't support navigator.share
           alert("La fonction de partage n'est pas supportée sur ce navigateur. Copiez le lien manuellement.");
       }
   };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{parcel.name}</CardTitle>
        <div className="flex items-center justify-between pt-2">
          <Badge variant={getStatusVariant(parcel.status)} className="text-sm px-3 py-1">{parcel.status}</Badge>
          <p className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1"/> Ajouté le: {parcel.dateAdded}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-bold text-accent_brand">{formatPrice(parcel.price)}</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center"><MapPin className="h-4 w-4 mr-2"/> Zone: <span className="font-medium text-foreground ml-1">{parcel.zone}</span></p>
          <p className="flex items-center"><Maximize className="h-4 w-4 mr-2"/> Surface: <span className="font-medium text-foreground ml-1">{parcel.area} m²</span></p>
          <p className="flex items-center"><FileText className="h-4 w-4 mr-2"/> Type: <span className="font-medium text-foreground ml-1">{parcel.type}</span></p>
          {parcel.titreFoncier && <p className="flex items-center"><ShieldCheck className="h-4 w-4 mr-2"/> Titre Foncier: <span className="font-medium text-foreground ml-1">{parcel.titreFoncier}</span></p>}
        </div>
         {/* Share and Favorite Buttons */}
         <div className="flex items-center space-x-2 pt-3 border-t mt-4">
             <Button variant="outline" size="icon" onClick={onAddToFavorites} title="Ajouter aux favoris">
                 <Heart className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" onClick={handleShare} title="Partager">
                 <Share2 className="h-4 w-4" />
             </Button>
         </div>
      </CardContent>
      {parcel.status === 'Disponible' && (
        <CardFooter className="flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={onRequestInfo}>
            <Info className="mr-2 h-4 w-4"/> Demander Infos
          </Button>
          <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-accent_brand text-white hover:opacity-90" onClick={onInitiateBuy}>
            <ShoppingCart className="mr-2 h-4 w-4"/> Initier Achat
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={onRequestVisit}>
            <CalendarPlus className="mr-2 h-4 w-4"/> Demander une Visite
          </Button>
        </CardFooter>
      )}
      {parcel.status === 'Réservée' && (
        <CardFooter>
          <p className="text-center text-yellow-600 font-medium w-full">Cette parcelle est actuellement réservée.</p>
        </CardFooter>
      )}
      {parcel.status === 'Vendue' && (
        <CardFooter>
          <p className="text-center text-destructive font-medium w-full">Cette parcelle a été vendue.</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ParcelInfoCard;