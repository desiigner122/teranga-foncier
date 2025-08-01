import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Maximize, CheckCircle, AlertCircle, Clock, Share2, Heart, MessageSquare } from 'lucide-react';

const formatPrice = (price) => {
   if (typeof price !== 'number' || isNaN(price)) {
     return 'Prix non disponible';
   }
   return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
};

const getStatusVariant = (status) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Réservée': return 'warning';
      case 'Vendue': return 'destructive';
      default: return 'secondary';
    }
};

const getDocumentStatusVariant = (status) => {
     switch (status) {
      case 'Vérifié': return 'success';
      case 'Partiellement Vérifié': return 'warning';
      case 'En attente': return 'warning';
      case 'Info Manquante': return 'destructive';
      default: return 'secondary';
     }
};

const getDocumentStatusIcon = (status) => {
     switch (status) {
      case 'Vérifié': return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'Partiellement Vérifié': return <AlertCircle className="h-4 w-4 mr-1.5" />;
      case 'En attente': return <Clock className="h-4 w-4 mr-1.5" />;
      case 'Info Manquante': return <AlertCircle className="h-4 w-4 mr-1.5" />;
      default: return <Clock className="h-4 w-4 mr-1.5" />;
     }
};

const ParcelHeaderSection = ({
  parcel,
  isFavorite,
  isParcelInCompare,
  user,
  onToggleFavorite,
  onShare,
  onCompareChange
}) => {
  if (!parcel) return null; // Return nothing if parcel data is not yet available

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
       <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">{parcel.name} ({parcel.id})</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mb-3">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {parcel.zone}</span>
            <span className="flex items-center"><Maximize className="h-4 w-4 mr-1.5" /> {parcel.area} m²</span>
            <Badge variant={getStatusVariant(parcel.status)}>{parcel.status}</Badge>
            <Badge variant={getDocumentStatusVariant(parcel.documentStatus)} className="items-center">
              {getDocumentStatusIcon(parcel.documentStatus)} Statut Docs: {parcel.documentStatus}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-primary">{formatPrice(parcel.price)}</p>
       </div>
       <div className="flex items-center gap-2 flex-shrink-0 pt-2">
          <Button variant="outline" size="icon" onClick={onToggleFavorite} title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={onShare} title="Partager">
            <Share2 className="h-5 w-5" />
          </Button>
          {user && (
             <Button variant="outline" size="icon" asChild title="Contacter l'agent">
               <Link to="/messaging" state={{ parcelId: parcel.id, parcelName: parcel.name }}>
                  <MessageSquare className="h-5 w-5"/>
               </Link>
             </Button>
          )}
          <label htmlFor={`compare-detail-${parcel.id}`} className="flex items-center gap-2 cursor-pointer p-2 border rounded-md bg-background hover:bg-muted transition-colors">
            <Checkbox
              id={`compare-detail-${parcel.id}`}
              checked={isParcelInCompare}
              onCheckedChange={onCompareChange}
              className="h-5 w-5"
              aria-label="Comparer cette parcelle"
            />
            <span className="text-sm font-medium">Comparer</span>
          </label>
       </div>
    </div>
  );
};

export default ParcelHeaderSection;