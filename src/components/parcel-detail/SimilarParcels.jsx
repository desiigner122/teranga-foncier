import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sampleParcels } from '@/data/sampleData'; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
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

const SimilarParcelCard = ({ parcel }) => (
  <Card className="h-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="p-0 relative">
      <div className="aspect-video bg-muted overflow-hidden">
        <img  
          className="w-full h-full object-cover"
          alt={`Image pour ${parcel.location_name}`} src="https://images.unsplash.com/photo-1668409061470-ba250024d416" />
      </div>
      <Badge variant={getStatusVariant(parcel.status)} className="absolute top-2 right-2 text-xs">{parcel.status}</Badge>
    </CardHeader>
    <CardContent className="p-3 flex-grow">
      <CardTitle className="text-base mb-1 truncate">{parcel.location_name}</CardTitle>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {parcel.zone || 'N/A'}</p>
        <p className="flex items-center"><Maximize className="h-3 w-3 mr-1"/> {parcel.area_sqm ? `${parcel.area_sqm} m²` : 'N/A'}</p>
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t flex justify-between items-center">
      <p className="text-sm font-bold text-accent_brand">{formatPrice(parcel.price)}</p>
      <Button size="xs" variant="outline" asChild>
        <Link to={`/parcelles/${parcel.id}`}>Voir</Link>
      </Button>
    </CardFooter>
  </Card>
);

const SimilarParcelsSkeleton = () => (
   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
         <Card key={i}>
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-3 space-y-1">
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-3 w-1/2" />
               <Skeleton className="h-3 w-1/2" />
            </CardContent>
            <CardFooter className="p-3 border-t flex justify-between items-center">
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-7 w-1/4" />
            </CardFooter>
         </Card>
      ))}
   </div>
);


const SimilarParcels = ({ currentParcelId, currentParcelZone }) => {
  const [similarParcels, setSimilarParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const filtered = sampleParcels.filter(p =>
          p.id !== currentParcelId &&
          p.zone === currentParcelZone &&
          p.status === 'Disponible' 
        ).slice(0, 4); 
        setSimilarParcels(filtered);
      } catch (err) {
        console.error("Error finding similar parcels:", err);
        setSimilarParcels([]);
      } finally {
        setLoading(false);
      }
    }, 400); 

  }, [currentParcelId, currentParcelZone]);

  if (loading) {
     return (
        <div>
           <h2 className="text-2xl font-semibold mb-4">Parcelles Similaires</h2>
           <SimilarParcelsSkeleton />
        </div>
     );
  }

  if (similarParcels.length === 0) {
    return null; 
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Parcelles Similaires dans la Zone "{currentParcelZone}"</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarParcels.map(parcel => (
          <SimilarParcelCard key={parcel.id} parcel={parcel} />
        ))}
      </div>
    </div>
  );
};

export default SimilarParcels;