import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleRequests } from '@/data/sampleData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, FileText, Home, User, AlertCircle, Banknote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const getStatusInfo = (status) => {
  switch (status) {
    case 'Nouvelle': return { icon: FileText, color: 'text-blue-500' };
    case 'En instruction': return { icon: Clock, color: 'text-yellow-500' };
    case 'Approuvée': case 'Traitée': return { icon: CheckCircle, color: 'text-green-500' };
    case 'Rejeté': return { icon: AlertCircle, color: 'text-red-500' };
    default: return { icon: FileText, color: 'text-gray-500' };
  }
};

const CaseTrackingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-6 w-1/2" />
    <Card>
      <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  </div>
);

const CaseTrackingPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundRequest = sampleRequests.find(r => r.id === id);
      setRequest(foundRequest);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return (
    <div className="container mx-auto py-8 px-4">
      <CaseTrackingSkeleton />
    </div>
  );

  if (!request) return (
    <div className="container mx-auto py-10 text-center">
      <h2 className="text-2xl font-semibold text-destructive">Demande non trouvée</h2>
      <Link to="/my-requests" className="text-primary hover:underline mt-4 inline-block">Retour à mes demandes</Link>
    </div>
  );
  
  const pendingPayments = request.payments?.filter(p => p.status === 'En attente') || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Suivi du Dossier : {request.id}</h1>
        <p className="text-muted-foreground">Historique complet et état actuel de votre demande.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chronologie du Dossier</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 dark:border-gray-700">
                {request.history.sort((a,b) => new Date(b.date) - new Date(a.date)).map((item, index) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="mb-10 ml-6"
                    >
                      <span className={`absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900`}>
                        <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {item.status}
                        {index === 0 && <Badge variant="success" className="ml-3">Statut Actuel</Badge>}
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        Le {formatDate(item.date)} par <span className="font-semibold">{item.updated_by}</span>
                      </time>
                      <p className="mb-4 text-base font-normal text-gray-600 dark:text-gray-400 p-3 bg-muted/50 rounded-md border border-dashed">
                        {item.note}
                      </p>
                    </motion.li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la Demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold capitalize">{request.request_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinataire</span>
                <span className="font-semibold">{request.recipient}</span>
              </div>
              {request.parcel_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parcelle</span>
                  <Link to={`/parcelles/${request.parcel_id}`} className="font-semibold text-primary hover:underline">{request.parcel_id}</Link>
                </div>
              )}
            </CardContent>
          </Card>

            {pendingPayments.length > 0 && (
                 <Card className="border-primary bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center text-primary"><Banknote className="mr-2"/>Action Requise : Paiement</CardTitle>
                        <CardDescription>Un ou plusieurs paiements sont nécessaires pour faire avancer votre dossier.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                           {pendingPayments.map(payment => (
                               <li key={payment.id} className="flex justify-between items-center text-sm">
                                   <span>{payment.description}</span>
                                   <span className="font-bold">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(payment.amount)}</span>
                               </li>
                           ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                       <Button asChild className="w-full">
                           <Link to={`/payment/${pendingPayments[0].id}`}>
                               Payer les frais requis <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                       </Button>
                    </CardFooter>
                 </Card>
            )}

          <div className="text-center">
            <Button asChild variant="outline">
              <Link to="/my-requests"><Home className="mr-2 h-4 w-4" /> Voir toutes mes demandes</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseTrackingPage;