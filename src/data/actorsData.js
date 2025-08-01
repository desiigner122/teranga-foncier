import { Landmark, Building, Briefcase, School as University, ShoppingCart, Hotel as Hospital, Bus, Ship, Plane } from 'lucide-react';

export const sampleMairies = [
  { id: 'mairie_dakar_plateau', name: 'Mairie de Dakar-Plateau', zone: 'Dakar', coordinates: { lat: 14.6739, lng: -17.4358 }, icon: Landmark },
  { id: 'mairie_almadies', name: 'Mairie des Almadies', zone: 'Dakar', coordinates: { lat: 14.7450, lng: -17.5200 }, icon: Landmark },
  { id: 'mairie_diamniadio', name: 'Mairie de Diamniadio', zone: 'Diamniadio', coordinates: { lat: 14.7167, lng: -17.2000 }, icon: Building },
  { id: 'mairie_saly', name: 'Mairie de Saly Portudal', zone: 'Saly', coordinates: { lat: 14.4417, lng: -17.0167 }, icon: Landmark },
  { id: 'mairie_thies', name: 'Mairie de Thiès', zone: 'Thiès', coordinates: { lat: 14.7917, lng: -16.9333 }, icon: Landmark },
  { id: 'mairie_ziguinchor', name: 'Mairie de Ziguinchor', zone: 'Ziguinchor', coordinates: { lat: 12.5833, lng: -16.2719 }, icon: Landmark },
  { id: 'mairie_saint_louis', name: 'Mairie de Saint-Louis', zone: 'Saint-Louis', coordinates: { lat: 16.0179, lng: -16.4896 }, icon: Landmark },
];

export const sampleNotaires = [
  { id: 'notaire_diop', name: 'Étude de Maître Diop', specialite: 'Transactions Immobilières', zone: 'Dakar', coordinates: { lat: 14.6850, lng: -17.4450 }, icon: Briefcase },
  { id: 'notaire_fall', name: 'Étude de Maître Fall', specialite: 'Droit des Affaires et Foncier', zone: 'Dakar', coordinates: { lat: 14.7000, lng: -17.4550 }, icon: Briefcase },
  { id: 'notaire_sow', name: 'Étude de Maître Sow', specialite: 'Successions et Baux', zone: 'Thiès', coordinates: { lat: 14.7950, lng: -16.9300 }, icon: Briefcase },
];

export const sampleBanques = [
  { id: 'banque_bds', name: 'Banque du Sénégal (BDS)', type: 'Partenaire Premium', zone: 'Dakar', coordinates: { lat: 14.6700, lng: -17.4300 }, icon: Landmark },
  { id: 'banque_cba', name: 'Crédit Bancaire Africain (CBA)', type: 'Partenaire Évaluation', zone: 'Dakar', coordinates: { lat: 14.6900, lng: -17.4500 }, icon: Landmark },
];

export const samplePointsOfInterest = [
  { id: 'poi_ucad', name: 'Université Cheikh Anta Diop', type: 'Éducation', coordinates: { lat: 14.6883, lng: -17.4642 }, icon: University },
  { id: 'poi_seaplaza', name: 'Sea Plaza', type: 'Commerce', coordinates: { lat: 14.6958, lng: -17.4783 }, icon: ShoppingCart },
  { id: 'poi_hopital_principal', name: 'Hôpital Principal de Dakar', type: 'Santé', coordinates: { lat: 14.6667, lng: -17.4333 }, icon: Hospital },
  { id: 'poi_gare_dakar', name: 'Gare de Dakar', type: 'Transport', coordinates: { lat: 14.6719, lng: -17.4344 }, icon: Bus },
  { id: 'poi_port_dakar', name: 'Port Autonome de Dakar', type: 'Transport', coordinates: { lat: 14.6639, lng: -17.4264 }, icon: Ship },
  { id: 'poi_aeroport_dss', name: 'Aéroport International Blaise Diagne', type: 'Transport', coordinates: { lat: 14.6725, lng: -17.0742 }, icon: Plane },
  { id: 'poi_marche_sandaga', name: 'Marché Sandaga', type: 'Commerce', coordinates: { lat: 14.6750, lng: -17.4380 }, icon: ShoppingCart },
  { id: 'poi_hopital_le_dantec', name: 'Hôpital Aristide Le Dantec', type: 'Santé', coordinates: { lat: 14.6700, lng: -17.4400 }, icon: Hospital },
];