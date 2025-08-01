import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Maximize, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const featuredParcels = [
  { id: 'DK001', name: 'Terrain Almadies', area: 600, status: 'Disponible', zone: 'Dakar', imageDesc: 'Terrain vue mer Almadies Dakar Sénégal', price: 150000000 },
  { id: 'MB099', name: 'Site Mbour Plage', area: 800, status: 'Disponible', zone: 'Mbour', imageDesc: 'Site proche plage Saly Mbour Sénégal', price: 75000000 },
  { id: 'TH015', name: 'Parcelle Thiès Centre', area: 1000, status: 'Réservée', zone: 'Thiès', imageDesc: 'Parcelle cloturée Thiès centre ville Sénégal', price: 40000000 },
];

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

const FeaturedParcels = () => {
  return (
    <section className="container mx-auto py-12 md:py-16 px-4"> {/* Reduced padding */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary" // Reduced margin bottom
      >
        Nos Parcelles à la Une
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {featuredParcels.map((parcel, index) => (
          <motion.div
            key={parcel.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full flex flex-col bg-card shadow-md hover:shadow-xl hover:shadow-card-hover transition-all duration-300 border border-border rounded-xl group">
              <CardHeader className="p-0 relative">
                 <div className="aspect-[16/10] bg-muted overflow-hidden">
                   <img 
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" alt={parcel.imageDesc} src="https://images.unsplash.com/photo-1697256200022-f61abccad430" />
                 </div>
                  <Badge variant={getStatusVariant(parcel.status)} className="absolute top-3 right-3 shadow-sm">
                    {parcel.status}
                  </Badge>
              </CardHeader>
              <CardContent className="p-5 flex-grow">
                <CardTitle className="text-xl lg:text-2xl mb-2 font-semibold text-foreground group-hover:text-primary transition-colors">{parcel.name} ({parcel.id})</CardTitle>
                 <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3 text-muted-foreground">
                     <span className="flex items-center">
                       <MapPin className="h-4 w-4 mr-1.5" /> {parcel.zone}
                     </span>
                     <span className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1.5" /> {parcel.area} m²
                     </span>
                 </div>
                <p className="text-xl font-bold text-accent_brand">{formatPrice(parcel.price)}</p>
              </CardContent>
              <CardFooter className="p-5 pt-0 mt-auto">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-[1.02] transition-transform">
                  <Link to={`/parcelles/${parcel.id}`}>Voir les détails <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12"> {/* Reduced margin top */}
          <Button variant="outline" size="lg" asChild className="hover:bg-primary/5 hover:border-primary transition-colors">
              <Link to="/parcelles">Découvrir Toutes les Parcelles <ArrowRight className="ml-2 h-4 w-4"/></Link>
          </Button>
      </div>
    </section>
  );
};

export default FeaturedParcels;