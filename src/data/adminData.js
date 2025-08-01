import { addDays, subDays, subHours, formatISO } from 'date-fns';
import { sampleParcels } from './parcelsData';
import { sampleRequests } from './userData';
import { sampleUserListings } from './userData';

const now = new Date();

export const sampleAdminDashboardData = {
  stats: {
    totalParcels: sampleParcels.length,
    availableParcels: sampleParcels.filter(p => p.status === 'Disponible').length,
    soldParcels: sampleParcels.filter(p => p.status === 'Vendue').length,
    pendingRequests: sampleRequests.filter(r => r.status === 'Nouvelle' || r.status === 'En attente').length,
    totalUsers: 532, 
    activeAgents: 7, 
    parcelsInLitigation: 2, 
    upcomingVisits: 8, 
    docsForAIReview: 23, 
  },
  recentActivities: [
    { id: 1, user: 'Admin', action: 'a mis à jour la parcelle DK-ALM-002', time: 'il y a 5 min', type: 'parcel_update' },
    { id: 2, user: 'Agent Fatou Diop', action: 'a validé la demande #REQ1022', time: 'il y a 1 heure', type: 'request_approved' },
    { id: 3, user: 'Nouveau User (user3@example.com)', action: 's\'est inscrit', time: 'il y a 3 heures', type: 'user_signup' },
    { id: 4, user: 'Admin', action: 'a ajouté Agent Ousmane Fall', time: 'hier', type: 'agent_added' },
    { id: 5, user: 'Agent Moussa Sarr', action: 'a programmé une visite pour SLY-NGP-010', time: 'hier', type: 'visit_scheduled' },
  ],
  adminEvents: [
    {
      id: 'adminVisit1', title: 'Visite DK-ALM-002 (Client M. Diallo) - Agent Diop',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0, 0),
      resource: { agent: 'Fatou Diop', status: 'Confirmée', type: 'client_visit' }
    },
    {
      id: 'adminMeeting1', title: 'Réunion équipe Agents - Stratégie Q3',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30, 0),
      resource: { type: 'team_meeting' }
    },
    {
      id: 'docReviewDeadline', title: 'Deadline Vérification Docs LSL-IND-001',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      allDay: true,
      resource: { type: 'deadline', priority: 'high' }
    },
  ],
  bailleurStats: {
    parcellesEnVente: sampleUserListings.filter(l => l.status === 'active').length,
    offresRecuesTotal: sampleUserListings.reduce((sum, l) => sum + l.offersReceived, 0),
    visitesDemandeesTotal: sampleUserListings.reduce((sum, l) => sum + l.visitsRequested, 0),
    tauxSuccesMoyen: '75%', 
  },
  promoteurStats: {
    projetsSuivis: 3, 
    terrainsIdentifies: 8, 
    etudesFaisabiliteEnCours: 2, 
  },
  investisseurStats: {
    investissementsActifs: 5, 
    rendementMoyenEstime: '12%', 
    zonePrivilegiee: 'Diamniadio', 
  },
  agriculteurStats: {
    demandesTerresAgricoles: 12, 
    surfacesRechercheesMoy: '5 Ha', 
    culturesDominantes: 'Mangue, Anacarde', 
  },
  banqueStats: {
    garantiesEvaluees: 25, 
    montantTotalGaranties: '2 Milliards XOF', 
    pretsLiesParcelles: 10, 
  },
};

export const sampleAgentData = {
  clients: [
    { id: 'CLI001', name: 'Moussa Diop', type: 'Acheteur', lastContact: '2025-07-15', status: 'Actif', assignedParcels: ['DK-ALM-002'] },
    { id: 'CLI002', name: 'Fatou Ndiaye', type: 'Vendeur', lastContact: '2025-07-10', status: 'Actif', assignedParcels: ['THS-EXT-021'] },
    { id: 'CLI003', name: 'Ibrahima Fall', type: 'Investisseur', lastContact: '2025-06-20', status: 'En attente', assignedParcels: [] },
  ],
  parcels: [
    { id: 'DK-ALM-002', name: 'Terrain Almadies', status: 'Visite programmée', client: 'Moussa Diop' },
    { id: 'SLY-NGP-010', name: 'Villa Saly', status: 'Offre reçue', client: 'Aïssatou Gueye' },
    { id: 'DMN-CIT-005', name: 'Parcelle Diamniadio', status: 'Disponible', client: null },
  ],
  tasks: [
    { id: 'TSK001', title: 'Contacter Moussa Diop pour visite', priority: 'Haute', dueDate: '2025-07-18', completed: false },
    { id: 'TSK002', title: 'Préparer dossier pour SLY-NGP-010', priority: 'Moyenne', dueDate: '2025-07-20', completed: false },
    { id: 'TSK003', title: 'Finaliser la vente de THS-EXT-021', priority: 'Haute', dueDate: '2025-07-16', completed: true },
  ]
};