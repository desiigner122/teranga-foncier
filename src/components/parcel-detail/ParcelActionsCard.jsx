import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ShoppingCart, CalendarPlus, PercentSquare } from 'lucide-react';
import InstallmentPaymentModal from '@/components/parcel-detail/InstallmentPaymentModal';

const ParcelActionsCard = ({ parcel, onRequestInfo, onInitiateBuy, onRequestVisit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEligibleForInstallments = parcel.ownerType !== 'Mairie';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Interagissez avec cette parcelle.</CardDescription>
        </CardHeader>
        <CardContent>
          {parcel.status === 'Disponible' ? (
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={onRequestInfo}>
                <Info className="mr-2 h-4 w-4"/> Demander Plus d'Infos
              </Button>
              <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-accent_brand text-white hover:opacity-90" onClick={onInitiateBuy}>
                <ShoppingCart className="mr-2 h-4 w-4"/> Initier l'Achat
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={onRequestVisit}>
                <CalendarPlus className="mr-2 h-4 w-4"/> Demander une Visite
              </Button>
              {isEligibleForInstallments && (
                <Button size="lg" variant="secondary" className="w-full" onClick={() => setIsModalOpen(true)}>
                  <PercentSquare className="mr-2 h-4 w-4"/> Payer en plusieurs fois
                </Button>
              )}
            </div>
          ) : parcel.status === 'Réservée' ? (
             <p className="text-center text-yellow-600 font-medium w-full py-4">Cette parcelle est actuellement réservée. Vous pouvez toujours demander des informations.</p>
          ) : (
             <p className="text-center text-destructive font-medium w-full py-4">Cette parcelle a été vendue.</p>
          )}
        </CardContent>
      </Card>
      
      {isEligibleForInstallments && (
        <InstallmentPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          parcelPrice={parcel.price}
          parcelName={parcel.name}
        />
      )}
    </>
  );
};

export default ParcelActionsCard;