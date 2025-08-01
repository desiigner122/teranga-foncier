import { Smartphone, Landmark, FileCheck2 } from 'lucide-react';

export const paymentMethods = [
  { id: 'mobile', name: 'Mobile Money', icon: Smartphone, providers: ['Wave', 'Orange Money'] },
  { id: 'transfer', name: 'Virement Bancaire', icon: Landmark },
  { id: 'check', name: 'Chèque de banque', icon: FileCheck2 },
];

export const partnerBanks = [
  { id: 'bds', name: 'Banque du Sénégal (BDS)' },
  { id: 'cba', name: 'Crédit Bancaire Africain (CBA)' },
  { id: 'sgbs', name: 'Société Générale Sénégal' },
  { id: 'bicis', name: 'BICIS (Groupe BNP Paribas)' },
  { id: 'boa', name: 'Bank of Africa' },
  { id: 'ecobank', name: 'Ecobank' },
];