import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SupabaseDataService } from '@/services/supabaseDataService';
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
import { Home, MapPin, School, ShoppingCart, Hotel as Hospital, HeartHandshake as Handshake, Shield, User, Award, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useContext } from 'react';
import { ComparisonContext } from '@/context/ComparisonContext';
import { Helmet } from 'react-helmet-async';
import ParcelTimeline from '@/components/parcel-detail/ParcelTimeline';

const ParcelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { comparisonList, addToCompare, removeFromCompare } = useContext(ComparisonContext);
  
  const [parcel, setParcel] = useState(null);
  // Loading g�r� par le hook temps r�el
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewLogged, setViewLogged] = useState(false);
  const isParcelInCompare = comparisonList.includes(id);

  const loadParcel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseDataService.getParcelById(id);
      if (!data) {
        setError('Parcelle non trouv�e.');
        return;
      }
      // Normalisation minimale si les champs diff�rent
      const normalized = {
        id: data.id,
        reference: data.reference,
        owner_id: data.owner_id || null,
        name: data.name || data.title || `Parcelle ${data.reference}`,
        location_name: data.location_name || data.location || 'Localisation non sp�cifi�e',
        description: data.description || 'Description indisponible.',
        price: data.price,
        area: data.area_sqm || data.area || null,
        zone: data.zone || data.location_zone || '�',
        status: data.status,
        documents: data.documents || [],
        images: data.images || [],
        coordinates: data.coordinates ? (typeof data.coordinates === 'string' ? JSON.parse(data.coordinates) : data.coordinates) : null,
        ownerType: data.owner_type || 'Propri�taire',
        documentStatus: data.document_status || (data.verified ? 'V�rifi�' : 'En attente')
      };
      setParcel(normalized);
    } catch (e) {
      console.error('Erreur chargement parcelle:', e);
      setError('Erreur lors du chargement de la parcelle.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadParcel(); setViewLogged(false); }, [id]);

  // Log a parcel view & user activity once parcel is loaded and user present
  useEffect(() => {
    if (!parcel || !user || viewLogged) return;
    (async () => {
      try {
        await SupabaseDataService.logParcelView(parcel.id, user.id, { source: 'parcel_detail_page' });
        await SupabaseDataService.recordUserActivity({
          userId: user.id,
            activityType: 'parcel_view',
            entityType: 'parcel',
            entityId: parcel.id,
            description: `Consultation de la parcelle ${parcel.name}`,
            metadata: { zone: parcel.zone }
        });
      } catch (e) {
        // Non bloquant
        console.warn('Instrumentation parcel view failed', e.message||e);
      } finally {
        setViewLogged(true);
      }
    })();
  }, [parcel, user, viewLogged]);

  const handleInquiry = async (type, extra={}) => {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour effectuer cette action.' });
      navigate('/login', { state: { redirectTo: `/parcelles/${id}` }});
      return;
    }
    try {
      const messageMap = {
        info: `Demande d'information pour ${parcel.location_name}.`,
        visit: `Demande de visite pour ${parcel.location_name}.`,
        buy: `Initiation de la proc�dure d'achat pour ${parcel.location_name}.`
      };
      // Cr�er l'inquiry dans la base
      const inquiry = await SupabaseDataService.createParcelInquiry({
        parcelId: parcel.id,
        inquirerId: user.id,
        inquiryType: type,
        message: messageMap[type] || 'Demande',
        metadata: { ...extra }
      });
      // Enregistrer activit�
      await SupabaseDataService.recordUserActivity({
        userId: user.id,
        activityType: `parcel_inquiry_${type}`,
        entityType: 'parcel',
        entityId: parcel.id,
        description: messageMap[type]
      });
      // Notifier propri�taire (si diff�rent et disponible)
      if (parcel.owner_id && parcel.owner_id !== user.id) {
        SupabaseDataService.createNotification({
          userId: parcel.owner_id,
          type: 'parcel_inquiry',
          title: 'Nouvelle demande sur votre parcelle',
          body: `${user.email || 'Un utilisateur'} a envoy� une demande (${type}).`,
          data: { parcel_id: parcel.id, inquiry_id: inquiry?.id, inquiry_type: type }
        }).catch(()=>{});
      }
      toast({ title: 'Demande envoy�e', description: messageMap[type] });
      if (type === 'buy') {
        // Rediriger vers messagerie (conversation potentielle)
        navigate('/messaging', { state: { parcelId: parcel.id, parcelName: parcel.name } });
      }
    } catch (e) {
      console.error('Inquiry action failed', e);
      toast({ title: 'Erreur', description: "Impossible d'enregistrer la demande pour le moment.", variant: 'destructive' });
    }
  };

  const handleCompareChange = (checked) => {
     if(checked) {
       addToCompare(id);
        toast({ title: 'Ajout� au comparateur', description: `"${parcel.name}" a �t� ajout�.` });
     } else {
       removeFromCompare(id);
        toast({ title: 'Retir� du comparateur', description: `"${parcel.name}" a �t� retir�.` });
     }
  };
  
  const handleShare = () => {
    toast({
  title: "Partage",
      description: "Le lien de partage a �t� copi� dans le presse-papiers.",
    });
  };

  // Charger statut favori depuis backend
  useEffect(() => {
    (async () => {
      if (user && parcel) {
        try {
          const fav = await SupabaseDataService.isParcelFavorite(user.id, parcel.id);
          setIsFavorite(fav);
        } catch {/* silent */}
      }
    })();
  }, [user, parcel]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour g�rer vos favoris.' });
      navigate('/login', { state: { redirectTo: `/parcelles/${id}` }});
      return;
    }
    try {
      if (isFavorite) {
        await SupabaseDataService.removeFromFavorites(user.id, parcel.id);
        setIsFavorite(false);
        toast({ title: 'Retir� des favoris' });
        SupabaseDataService.recordUserActivity({ userId: user.id, activityType:'favorite_removed', entityType:'parcel', entityId:parcel.id, description:`Retrait favori ${parcel.name}` });
      } else {
        await SupabaseDataService.addToFavorites(user.id, parcel.id);
        setIsFavorite(true);
        toast({ title: 'Ajout� aux favoris' });
        SupabaseDataService.recordUserActivity({ userId: user.id, activityType:'favorite_added', entityType:'parcel', entityId:parcel.id, description:`Ajout favori ${parcel.name}` });
      }
    } catch (e) {
      console.error('Toggle favorite failed', e);
      toast({ title: 'Erreur', description: 'Impossible de mettre � jour le favori.', variant: 'destructive' });
    }
  };

  const nearbyPointsOfInterest = [
    { icon: School, name: "�cole Primaire (simul�)", distance: "500m" },
    { icon: ShoppingCart, name: "March� Local (simul�)", distance: "1.2km" },
    { icon: Hospital, name: "Centre de Sant� (simul�)", distance: "2km" },
    { icon: MapPin, name: "Arr�t de Bus (simul�)", distance: "300m" },
  ];

  const servicePacks = [
      { icon: Handshake, title: "Pack Diaspora", description: "Mandataire de confiance pour visites, d�marches et signatures.", link: "/contact?subject=Pack+Diaspora" },
      { icon: Shield, title: "Pack S�curit� Juridique", description: "Accompagnement complet par un notaire partenaire, de A � Z.", link: "/contact?subject=Pack+Securite" },
  ];

  if (loading) return <div className="container mx-auto py-8 px-2 sm:px-4"><ParcelDetailSkeleton /></div>;
  if (error) return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
      <Link to="/parcelles" className="text-primary hover:underline mt-4 inline-block">Retourner � la liste des parcelles</Link>
    </div>
  );
  if (!parcel) return null;

  return (
    <>
    <Helmet>
        <title>{`${parcel.name} - ${parcel.zone}`} | Teranga Foncier</title>
        <meta name="description" content={`D�tails pour la parcelle ${parcel.name} de ${parcel.area} m� situ�e � ${parcel.zone}. Prix: ${parcel.price} FCFA. Statut: ${parcel.status}.`} />
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
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={loadParcel} className="flex items-center"><RefreshCw className="h-4 w-4 mr-2"/>Rafra�chir</Button>
        </div>
        
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
                        <Badge variant={parcel.documentStatus === 'V�rifi�' ? 'success' : 'secondary'}>
                            {parcel.documentStatus === 'V�rifi�' ? "Vendeur Certifi�" : "V�rification en cours"}
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
                <MapPin className="mr-2 h-5 w-5" /> Points d'Int�r�t � Proximit� (Simul�)
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
            <ParcelTimeline parcelId={parcel.id} />
          </div>

          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
       <ParcelActionsCard 
        parcel={parcel}
        onRequestInfo={() => handleInquiry('info')}
        onInitiateBuy={() => handleInquiry('buy')}
        onRequestVisit={() => handleInquiry('visit')}
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
                <Link to="/parcelles"><Home className="mr-2 h-5 w-5"/> Retour � toutes les parcelles</Link>
            </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default ParcelDetailPage;
