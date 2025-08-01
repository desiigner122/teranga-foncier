import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComparisonContext } from '@/context/ComparisonContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize, MapPin, Trash2, CheckCircle, AlertCircle, FileText, Droplets, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sampleParcels } from '@/data/sampleData';
import { useToast } from '@/components/ui/use-toast';

const formatPrice = (price) => {
   return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
}

const getStatusVariant = (status) => {
    switch (status) {
      case 'Disponible': return 'success';
      case 'Réservée': return 'warning';
      case 'Vendue': return 'destructive';
      default: return 'secondary';
    }
};

const ComparisonPage = () => {
  const { comparisonList, removeFromCompare, clearCompare } = useContext(ComparisonContext);
  const [parcelsToCompare, setParcelsToCompare] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const details = comparisonList.map(id => sampleParcels.find(p => p.id === id)).filter(Boolean);
    setParcelsToCompare(details);
  }, [comparisonList]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto py-16 px-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center md:text-left">Comparer les Parcelles</h1>
        {parcelsToCompare.length > 0 && (
           <Button variant="outline" onClick={clearCompare}>
             <Trash2 className="mr-2 h-4 w-4" /> Vider la comparaison ({parcelsToCompare.length})
           </Button>
        )}
      </div>

      {parcelsToCompare.length > 0 ? (
        <div className="overflow-x-auto">
          <div className={`inline-grid grid-flow-col auto-cols-max gap-6 md:gap-8 min-w-full`}>
            {/* Feature Column */}
            <motion.div variants={itemVariants} className="w-48 md:w-56 flex flex-col">
              <Card className="h-full flex flex-col border-transparent shadow-none bg-transparent">
                <CardHeader className="p-0 h-[200px] invisible">
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex-grow space-y-2 text-sm font-medium">
                  <div className="flex items-center h-10"><MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>Zone</div>
                  <div className="flex items-center h-10"><Maximize className="h-4 w-4 mr-2 text-muted-foreground"/>Surface</div>
                  <div className="flex items-center h-10"><FileText className="h-4 w-4 mr-2 text-muted-foreground"/>Statut Juridique</div>
                  <div className="flex items-center h-10"><Droplets className="h-4 w-4 mr-2 text-muted-foreground"/>Accès Eau</div>
                  <div className="flex items-center h-10"><Zap className="h-4 w-4 mr-2 text-muted-foreground"/>Accès Électricité</div>
                  <div className="flex items-center h-10"><CheckCircle className="h-4 w-4 mr-2 text-muted-foreground"/>Statut</div>
                  <div className="flex items-center h-10 pt-2 border-t mt-2">Prix</div>
                </CardContent>
                <CardFooter className="p-5 pt-0 h-[52px] invisible">
                  <Button>Voir Détails</Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Parcel Columns */}
            {parcelsToCompare.map((parcel) => (
              <motion.div key={parcel.id} variants={itemVariants} className="w-64 md:w-72">
                <Card className="h-full flex flex-col border shadow-sm relative overflow-hidden group">
                  <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-20 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromCompare(parcel.id)}
                      title="Retirer de la comparaison"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <CardHeader className="p-0 h-[200px]">
                    <div className="aspect-video bg-muted h-full">
                      <img 
                          className="w-full h-full object-cover"
                          alt={parcel.name} src="https://images.unsplash.com/photo-1694388001616-1176f534d72f" />
                    </div>
                    <CardTitle className="text-base font-semibold p-3 truncate">{parcel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 flex-grow space-y-2 text-sm text-center">
                    <div className="flex items-center justify-center h-10">{parcel.zone}</div>
                    <div className="flex items-center justify-center h-10">{parcel.area_sqm} m²</div>
                    <div className="flex items-center justify-center h-10">{parcel.titreFoncier?.split(' ')[0] || 'Non spécifié'}</div>
                    <div className="flex items-center justify-center h-10">{parcel.serviced?.water ? <CheckCircle className="text-green-500"/> : <AlertCircle className="text-yellow-500"/>}</div>
                    <div className="flex items-center justify-center h-10">{parcel.serviced?.electricity ? <CheckCircle className="text-green-500"/> : <AlertCircle className="text-yellow-500"/>}</div>
                    <div className="flex items-center justify-center h-10"><Badge variant={getStatusVariant(parcel.status)}>{parcel.status}</Badge></div>
                    <div className="flex items-center justify-center h-10 pt-2 border-t mt-2 text-lg font-bold text-primary">{formatPrice(parcel.price)}</div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button asChild className="w-full" size="sm">
                      <Link to={`/parcelles/${parcel.id}`}>Voir Détails <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-dashed rounded-lg bg-muted/30"
        >
          <p className="text-xl text-muted-foreground mb-4">Aucune parcelle sélectionnée pour la comparaison.</p>
          <p className="text-muted-foreground mb-6">Cochez la case sur les fiches des parcelles que vous souhaitez comparer.</p>
          <Button asChild>
            <Link to="/parcelles">Voir les parcelles</Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ComparisonPage;