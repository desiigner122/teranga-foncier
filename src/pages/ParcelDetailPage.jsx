import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SupabaseDataService from '@/services/supabaseDataService';
import ParcelImageGallery from '@/components/parcel-detail/ParcelImageGallery';
import ParcelHeaderSection from '@/components/parcel-detail/ParcelHeaderSection';
import ParcelDescriptionCard from '@/components/parcel-detail/ParcelDescriptionCard';
import ParcelLocationCard from '@/components/parcel-detail/ParcelLocationCard';
import ParcelDocumentsCard from '@/components/parcel-detail/ParcelDocumentsCard';
import ParcelActionsCard from '@/components/parcel-detail/ParcelActionsCard';
import SimilarParcels from '@/components/parcel-detail/SimilarParcels';
import ParcelDetailSkeleton from '@/components/parcel-detail/ParcelDetailSkeleton';
import ParcelFeeCalculator from '@/components/parcel-detail/ParcelFeeCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home, MapPin, School, ShoppingCart, Hotel as Hospital, HeartHandshake as Handshake, Shield, User, Award } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useContext } from 'react';
import { ComparisonContext } from '@/context/ComparisonContext';
import { Helmet } from 'react-helmet-async';

const ParcelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { comparisonList, addToCompare, removeFromCompare } = useContext(ComparisonContext);
  
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const isParcelInCompare = comparisonList.includes(id);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const foundParcel = sampleParcels.find(p => p.id === id);
      if (foundParcel) {
        setParcel(foundParcel);
      } else {
        setError("Parcelle non trouvée.");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAction = (message, details) => {
    toast({
      title: "Action Simulée",
      description: message,
    });
    if (details?.action === 'initiateBuy') {
       navigate('/messaging', { state: { parcelId: parcel.id, parcelName: parcel.name, contactUser: 'user2' }});
    }
  };

  const handleCompareChange = (checked) => {
     if(checked) {
       addToCompare(id);
        toast({ title: 'Ajouté au comparateur', description: `"${parcel.name}" a été ajouté.` });
     } else {
       removeFromCompare(id);
        toast({ title: 'Retiré du comparateur', description: `"${parcel.name}" a été retiré.` });
     }
  };
  
  const handleShare = () => {
    toast({
      title: "Partage (Simulation)",
      description: "Le lien de partage a été copié dans le presse-papiers.",
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
    });
  };

  const nearbyPointsOfInterest = [
    { icon: School, name: "École Primaire (simulé)", distance: "500m" },
    { icon: ShoppingCart, name: "Marché Local (simulé)", distance: "1.2km" },
    { icon: Hospital, name: "Centre de Santé (simulé)", distance: "2km" },
    { icon: MapPin, name: "Arrêt de Bus (simulé)", distance: "300m" },
  ];

  const servicePacks = [
      { icon: Handshake, title: "Pack Diaspora", description: "Mandataire de confiance pour visites, démarches et signatures.", link: "/contact?subject=Pack+Diaspora" },
      { icon: Shield, title: "Pack Sécurité Juridique", description: "Accompagnement complet par un notaire partenaire, de A à Z.", link: "/contact?subject=Pack+Securite" },
  ];

  if (loading) return <div className="container mx-auto py-8 px-2 sm:px-4"><ParcelDetailSkeleton /></div>;
  if (error) return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
      <Link to="/parcelles" className="text-primary hover:underline mt-4 inline-block">Retourner à la liste des parcelles</Link>
    </div>
  );
  if (!parcel) return null;

  return (
    <>
    <Helmet>
        <title>{`${parcel.name} - ${parcel.zone}`} | Teranga Foncier</title>
        <meta name="description" content={`Détails pour la parcelle ${parcel.name} de ${parcel.area} m² située à ${parcel.zone}. Prix: ${parcel.price} FCFA. Statut: ${parcel.status}.`} />
        <meta property="og:title" content={`${parcel.name} | Teranga Foncier`} />
        <meta property="og:description" content={parcel.description} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1542364041-2cada653f4ee" />
        <link rel="canonical" href={`https://www.terangafoncier.com/parcelles/${parcel.id}`} />
    </Helmet>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-muted/30"
    >
      <div className="container mx-auto py-8 px-2 sm:px-4">
        <ParcelHeaderSection 
          parcel={parcel}
          isFavorite={isFavorite}
          isParcelInCompare={isParcelInCompare}
          user={user}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
          onCompareChange={handleCompareChange}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <ParcelImageGallery images={parcel.images || []} parcelName={parcel.location_name} parcelId={parcel.id} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Award className="h-5 w-5 mr-2 text-primary"/> Vendeur & Confiance</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-4">
                    <User className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">{parcel.ownerType}</p>
                        <Badge variant={parcel.documentStatus === 'Vérifié' ? 'success' : 'secondary'}>
                            {parcel.documentStatus === 'Vérifié' ? "Vendeur Certifié" : "Vérification en cours"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <ParcelDescriptionCard description={parcel.description} />
            <ParcelDocumentsCard documents={parcel.documents || []} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-card p-6 rounded-lg shadow border"
            >
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Points d'Intérêt à Proximité (Simulé)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {nearbyPointsOfInterest.map((poi, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-md border border-dashed">
                    <poi.icon className="h-7 w-7 mb-1.5 text-primary/80" />
                    <p className="text-xs font-medium text-foreground">{poi.name}</p>
                    <p className="text-xs text-muted-foreground">{poi.distance}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <ParcelLocationCard coordinates={parcel.coordinates} locationName={parcel.location_name} />
          </div>

          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
             <ParcelActionsCard 
                parcel={parcel}
                onRequestInfo={() => handleAction(`Demande d'information pour ${parcel.location_name}.`)}
                onInitiateBuy={() => handleAction(`Initiation de la procédure d'achat pour ${parcel.location_name}.`, { action: 'initiateBuy' })}
                onRequestVisit={() => handleAction(`Demande de visite pour ${parcel.location_name}.`)}
            />
            <ParcelFeeCalculator price={parcel.price} />
             <Card>
                <CardHeader>
                    <CardTitle>Services d'Accompagnement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {servicePacks.map(pack => (
                        <div key={pack.title} className="flex items-start">
                            <pack.icon className="h-8 w-8 mr-3 text-primary flex-shrink-0 mt-1"/>
                            <div>
                                <h4 className="font-semibold">{pack.title}</h4>
                                <p className="text-sm text-muted-foreground">{pack.description}</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                    <Link to={pack.link}>En savoir plus</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12">
          <SimilarParcels currentParcelId={parcel.id} currentParcelZone={parcel.zone} />
        </div>
        
        <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
                <Link to="/parcelles"><Home className="mr-2 h-5 w-5"/> Retour à toutes les parcelles</Link>
            </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default ParcelDetailPage;