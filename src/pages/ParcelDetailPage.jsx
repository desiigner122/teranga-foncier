import React, { useState, useEffect, useContext } from 'react';
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
  // Loading géré par le hook temps réel
  const [loading, setLoading] = useState(false);
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
        setError('Parcelle non trouvée.');
        return;
      }
      // Normalisation minimale si les champs différent
      const normalized = {
        id: data.id,
        reference: data.reference,
        owner_id: data.owner_id || null,
        name: data.name || data.title || `Parcelle ${data.reference}`,
        location_name: data.location_name || data.location || 'Localisation non spécifiée',
        description: data.description || 'Description indisponible.',
        price: data.price,
        area: data.area_sqm || data.area || null,
        zone: data.zone || data.location_zone || 'é',
        status: data.status,
        documents: data.documents || [],
        images: data.images || [],
        coordinates: data.coordinates ? (typeof data.coordinates === 'string' ? JSON.parse(data.coordinates) : data.coordinates) : null,
        ownerType: data.owner_type || 'Propriétaire',
        documentStatus: data.document_status || (data.verified ? 'Vérifié' : 'En attente')
      };
      setParcel(normalized);
    } catch (e) {
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
        buy: `Initiation de la procédure d'achat pour ${parcel.location_name}.`
      };
      // Créer l'inquiry dans la base
      const inquiry = await SupabaseDataService.createParcelInquiry({
        parcelId: parcel.id,
        inquirerId: user.id,
        inquiryType: type,
        message: messageMap[type] || 'Demande',
        metadata: { ...extra }
      });
      // Enregistrer activité
      await SupabaseDataService.recordUserActivity({
        userId: user.id,
        activityType: `parcel_inquiry_${type}`,
        entityType: 'parcel',
        entityId: parcel.id,
        description: messageMap[type]
      });
      // Notifier propriétaire (si différent et disponible)
      if (parcel.owner_id && parcel.owner_id !== user.id) {
        SupabaseDataService.createNotification({
          userId: parcel.owner_id,
          type: 'parcel_inquiry',
          title: 'Nouvelle demande sur votre parcelle',
          body: `${user.email || 'Un utilisateur'} a envoyé une demande (${type}).`,
          data: { parcel_id: parcel.id, inquiry_id: inquiry?.id, inquiry_type: type }
        }).catch(()=>{});
      }
      toast({ title: 'Demande envoyée', description: messageMap[type] });
      if (type === 'buy') {
        // Rediriger vers messagerie (conversation potentielle)
        navigate('/messaging', { state: { parcelId: parcel.id, parcelName: parcel.name } });
      }
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer la demande pour le moment.", variant: 'destructive' });
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
  title: "Partage",
      description: "Le lien de partage a été copié dans le presse-papiers.",
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
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour gérer vos favoris.' });
      navigate('/login', { state: { redirectTo: `/parcelles/${id}` }});
      return;
    }
    try {
      if (isFavorite) {
        await SupabaseDataService.removeFromFavorites(user.id, parcel.id);
        setIsFavorite(false);
        toast({ title: 'Retiré des favoris' });
        SupabaseDataService.recordUserActivity({ userId: user.id, activityType:'favorite_removed', entityType:'parcel', entityId:parcel.id, description:`Retrait favori ${parcel.name}` });
      } else {
        await SupabaseDataService.addToFavorites(user.id, parcel.id);
        setIsFavorite(true);
        toast({ title: 'Ajouté aux favoris' });
        SupabaseDataService.recordUserActivity({ userId: user.id, activityType:'favorite_added', entityType:'parcel', entityId:parcel.id, description:`Ajout favori ${parcel.name}` });
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de mettre é jour le favori.', variant: 'destructive' });
    }
  };

  const nearbyPointsOfInterest = [
    { icon: School, name: "école Primaire (simulé)", distance: "500m" },
    { icon: ShoppingCart, name: "Marché Local (simulé)", distance: "1.2km" },
    { icon: Hospital, name: "Centre de Santé (simulé)", distance: "2km" },
    { icon: MapPin, name: "Arrét de Bus (simulé)", distance: "300m" },
  ];

  const servicePacks = [
      { icon: Handshake, title: "Pack Diaspora", description: "Mandataire de confiance pour visites, démarches et signatures.", link: "/contact?subject=Pack+Diaspora" },
      { icon: Shield, title: "Pack Sécurité Juridique", description: "Accompagnement complet par un notaire partenaire, de A é Z.", link: "/contact?subject=Pack+Securite" },
  ];

  if (loading) return <div className="container mx-auto py-8 px-2 sm:px-4"><ParcelDetailSkeleton /></div>;
  if (error) return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
      <Link to="/parcelles" className="text-primary hover:underline mt-4 inline-block">Retourner é la liste des parcelles</Link>
    </div>
  );
  if (!parcel) return null;

  return (
    <>
    <Helmet>
        <title>{`${parcel.name} - ${parcel.zone}`} | Teranga Foncier</title>
        <meta name="description" content={`Détails pour la parcelle ${parcel.name} de ${parcel.area} mé située é ${parcel.zone}. Prix: ${parcel.price} FCFA. Statut: ${parcel.status}.`} />
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
          <Button variant="outline" size="sm" onClick={loadParcel} className="flex items-center"><RefreshCw className="h-4 w-4 mr-2"/>Rafraéchir</Button>
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
                <MapPin className="mr-2 h-5 w-5" /> Points d'Intérét é Proximité (Simulé)
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
                <Link to="/parcelles"><Home className="mr-2 h-5 w-5"/> Retour é toutes les parcelles</Link>
            </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default ParcelDetailPage;
