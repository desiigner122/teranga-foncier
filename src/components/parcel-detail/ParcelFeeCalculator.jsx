import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'; // Assuming Slider component exists
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
};

// IMPORTANT: These rates are purely illustrative examples and MUST be validated
// by legal/financial professionals in Senegal. Do NOT use in production as is.
const NOTARY_FEE_RATE = 0.03; // Example: 3% notary fees
const REGISTRATION_DUTY_RATE = 0.05; // Example: 5% registration duties
const STAMP_DUTY_FIXED = 50000; // Example: Fixed stamp duty amount

const ParcelFeeCalculator = ({ price }) => {
  const [estimatedPrice, setEstimatedPrice] = useState(price);

  useEffect(() => {
     setEstimatedPrice(price); // Update if the base price prop changes
  }, [price]);

  const notaryFees = estimatedPrice * NOTARY_FEE_RATE;
  const registrationDuty = estimatedPrice * REGISTRATION_DUTY_RATE;
  const totalEstimatedFees = notaryFees + registrationDuty + STAMP_DUTY_FIXED;
  const totalEstimatedCost = estimatedPrice + totalEstimatedFees;

  // Handler for slider change if needed, though not strictly necessary for display-only
  // const handleSliderChange = (value) => {
  //   setEstimatedPrice(value[0]);
  // };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <Card>
        <CardHeader>
          <CardTitle>Estimation des Frais d'Acquisition</CardTitle>
          <CardDescription className="flex items-start text-xs text-muted-foreground pt-1">
            <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0"/>
            Ces montants sont indicatifs et basés sur des taux standards. Consultez un notaire pour une estimation précise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Optional Slider - could be used if user wants to simulate different prices */}
          {/* <div className="grid gap-2">
             <Label htmlFor="price-slider">Prix du bien (simulé)</Label>
             <Slider
               id="price-slider"
               min={price * 0.8}
               max={price * 1.2}
               step={100000}
               value={[estimatedPrice]}
               onValueChange={handleSliderChange}
             />
             <p className="text-sm text-center font-medium">{formatCurrency(estimatedPrice)}</p>
          </div> */}

          <div className="space-y-1 text-sm border-t pt-4">
             <div className="flex justify-between">
                 <span className="text-muted-foreground">Prix du bien :</span>
                 <span className="font-medium">{formatCurrency(estimatedPrice)}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-muted-foreground">Frais de notaire (estimés ~{NOTARY_FEE_RATE * 100}%) :</span>
                 <span className="font-medium">{formatCurrency(notaryFees)}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-muted-foreground">Droits d'enregistrement (estimés ~{REGISTRATION_DUTY_RATE * 100}%) :</span>
                 <span className="font-medium">{formatCurrency(registrationDuty)}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-muted-foreground">Timbres fiscaux (estimés) :</span>
                 <span className="font-medium">{formatCurrency(STAMP_DUTY_FIXED)}</span>
             </div>
          </div>
           <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-base font-semibold">
                 <span>Coût total estimé :</span>
                 <span className="text-accent_brand">{formatCurrency(totalEstimatedCost)}</span>
              </div>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ParcelFeeCalculator;