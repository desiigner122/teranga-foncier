import React, { useState, useEffect } from 'react';
import { useRealtimeTable, useRealtimeUsers, useRealtimeParcels, useRealtimeParcelSubmissions } from '@/hooks/useRealtimeTable';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Info, ShoppingCart, CalendarPlus, Clock, ArrowRight, Banknote } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getRequestTypeInfo = (type) => {
  switch (type) {
    case 'info': return { icon: Info, text: "Demande d'information" };
    case 'buy': return { icon: ShoppingCart, text: "Demande d'achat" };
    case 'visit': return { icon: CalendarPlus, text: "Demande de visite" };
    case 'acquisition': return { icon: FileText, text: "Demande d'attribution" };
    default: return { icon: FileText, text: "Demande" };
  }
};

const getRequestStatusVariant = (status) => {
  switch (status) {
    case 'Nouvelle': return 'info';
    case 'En instruction':
    case 'En cours': return 'warning';
    case 'Traitée': 
    case 'Approuvée': return 'success';
    case 'Annulée':
    case 'Rejeté': return 'destructive';
    default: return 'secondary';
  }
};

const RequestCard = ({ request, parcelDetails }) => {
    const requestTypeInfo = getRequestTypeInfo(request.request_type);
    const RequestIcon = requestTypeInfo.icon;
    const pendingPayment = request.payments?.find(p => p.status === 'En attente');

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg flex items-center mb-1">
                    <RequestIcon className="h-4 w-4 mr-2" />
                    {requestTypeInfo.text}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1"/> Soumise le: {formatDate(request.created_at)}
                    </CardDescription>
                </div>
                <Badge variant={getRequestStatusVariant(request.status)}>{request.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                {request.parcel_id && parcelDetails ? (
                <div className="mb-3 p-3 bg-muted/50 rounded border text-sm">
                    <p className="font-semibold mb-1">Concernant la parcelle :</p>
                    <Link to={`/parcelles/${request.parcel_id}`} className="text-primary hover:underline font-medium block truncate">{parcelDetails.name}</Link>
                    <p className="text-xs text-muted-foreground">{parcelDetails.zone} - {parcelDetails.area_sqm} m²</p>
                </div>
                ) : (
                <div className="mb-3 p-3 bg-muted/50 rounded border text-sm">
                     <p className="font-semibold mb-1">Demande auprès de : {request.recipient}</p>
                </div>
                )}
                
                {pendingPayment && (
                    <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 flex items-center justify-between">
                        <div className="flex items-center">
                            <Banknote className="h-5 w-5 mr-3"/>
                            <div>
                                <p className="font-bold text-sm">Paiement Requis</p>
                                <p className="text-xs">{pendingPayment.description}</p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="bg-white">
                           <Link to={`/payment/${pendingPayment.id}`}>Payer</Link>
                        </Button>
                    </div>
                )}

            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="default" size="sm" asChild>
                    <Link to={`/case-tracking/${request.id}`}>
                        Suivre le Dossier <ArrowRight className="h-4 w-4 ml-2"/>
                    </Link>
                </Button>
            </CardFooter>
            </Card>
        </motion.div>
    );
};

const RequestsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <Skeleton className="h-3 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="mb-3 p-3 bg-muted/50 rounded border">
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-1/4 mb-1" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-9 w-1/4" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const MyRequestsPage = () => {
  const { user } = useAuth();
  const { data: requests, loading: requestsLoading, error: requestsError, refetch } = useRealtimeRequests();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (requests) {
      setFilteredData(requests);
    }
  }, [requests]);
  
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError("Veuillez vous connecter pour voir vos demandes.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const userRequests = await SupabaseDataService.getRequestsByUser(user.id);
        setRequests(userRequests);
        // Build parcel id set
        const parcelIds = [...new Set(userRequests.filter(r => r.parcel_id).map(r => r.parcel_id))];
        if (parcelIds.length) {
          // Fetch parcels individually (could be optimized with RPC if needed)
          const map = {};
          for (const pid of parcelIds) {
            const p = await SupabaseDataService.getParcelById(pid);
            if (p) map[pid] = { id: p.id, name: p.name || p.title || p.reference, zone: p.zone, area_sqm: p.area_sqm };
          }
          setParcelsData(map);
        } else {
          setParcelsData({});
        }
      } catch (err) {
        console.error('Error loading requests:', err);
        setError('Impossible de charger vos demandes.');
        setRequests([]);
        setParcelsData({});
      } finally {
        setLoading(false);
      }
    })();

  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Mes Demandes</h1>
        <p className="text-muted-foreground">Suivez l'état de vos demandes d'information, d'achat ou de visite.</p>
      </div>

      {loading ? (
        <RequestsSkeleton />
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-md">
          <p>{error}</p>
          {!user && <Button asChild className="mt-4"><Link to="/login">Se Connecter</Link></Button>}
        </div>
      ) : requests.length > 0 ? (
        <motion.div layout className="space-y-6">
          {requests.map(request => (
            <RequestCard key={request.id} request={request} parcelDetails={parcelsData[request.parcel_id]} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-lg border border-dashed">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune demande trouvée</h2>
          <p className="text-muted-foreground mb-6">Vous n'avez pas encore soumis de demande. Explorez nos parcelles !</p>
          <Button asChild>
            <Link to="/parcelles">Voir les parcelles</Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyRequestsPage;
