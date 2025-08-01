import { Smartphone, Mail, Settings, HelpCircle, Heart, Search, FileText, Bell, MessageSquare, LogOut, Lock, User, UserPlus } from 'lucide-react';

export const sampleUsers = [
    { id: 'user1', name: 'Moussa Diop', email: 'moussa.diop@email.com', role: 'particulier' },
    { id: 'user2', name: 'Vendeur de Test', email: 'vendeur.test@email.com', role: 'vendeur' },
    { id: 'user3', name: 'Mairie de Saly', email: 'contact@mairiedesaly.sn', role: 'mairie' },
    { id: 'user4', name: 'Notaire & Associés', email: 'etude@notaire-associes.sn', role: 'notaire' },
];

export const sampleRequests = [
    {
        id: 'REQ-2025-001',
        user_id: 'user1',
        parcel_id: 'sly-ngp-010',
        request_type: 'buy',
        status: 'En instruction',
        message: "Bonjour, je suis très intéressé par cette parcelle et souhaite initier la procédure d'achat. Merci.",
        created_at: '2025-07-10T10:00:00Z',
        recipient: 'Vendeur de Test',
        payments: [
          { id: 'TRN-001-2025', description: 'Acompte (1/4)', status: 'Payé', amount: 10312500 },
          { id: 'TRN-004-2025', description: 'Frais de Notaire', status: 'En attente', amount: 75000 },
        ],
        history: [
            { status: 'Nouvelle', date: '2025-07-10T10:00:00Z', updated_by: 'Moussa Diop', note: 'Demande soumise.' },
            { status: 'En instruction', date: '2025-07-11T14:20:00Z', updated_by: 'Vendeur de Test', note: 'Dossier reçu et en cours de vérification.' }
        ],
    },
    {
        id: 'REQ-2025-002',
        user_id: 'user1',
        parcel_id: null,
        request_type: 'acquisition',
        status: 'En instruction',
        message: "Je souhaiterais faire une demande d'attribution pour une parcelle à usage d'habitation dans la commune de Saly.",
        created_at: '2025-07-05T15:30:00Z',
        recipient: 'Mairie de Saly',
        payments: [
          { id: 'TRN-002-2025', description: 'Frais de dossier', status: 'Payé', amount: 50000 },
          { id: 'TRN-005-2025', description: 'Timbres fiscaux', status: 'En attente', amount: 15000 }
        ],
        history: [
            { status: 'Nouvelle', date: '2025-07-05T15:30:00Z', updated_by: 'Moussa Diop', note: 'Demande d\'attribution communale soumise.'},
            { status: 'En instruction', date: '2025-07-08T09:00:00Z', updated_by: 'Agent Mairie', note: 'Dossier en cours d\'étude. Paiement des timbres fiscaux requis pour continuer.'}
        ],
    },
    {
        id: 'REQ-2025-003',
        user_id: 'user1',
        parcel_id: 'dk-alm-002',
        request_type: 'info',
        status: 'Traitée',
        message: 'Pourriez-vous me donner plus de détails sur le potentiel de construction de ce terrain ?',
        created_at: '2025-06-28T11:00:00Z',
        recipient: 'Vendeur de Test',
        payments: [],
        history: [
             { status: 'Nouvelle', date: '2025-06-28T11:00:00Z', updated_by: 'Moussa Diop', note: 'Demande soumise.'},
             { status: 'Traitée', date: '2025-06-28T18:00:00Z', updated_by: 'Vendeur de Test', note: 'Réponse envoyée via la messagerie sécurisée.'}
        ],
    }
];

export const sampleNotifications = [
  { id: 1, type: 'message', content: 'Nouveau message de Vendeur de Test concernant SLY-NGP-010', date: '2025-07-11T14:25:00Z', read: false, link: '/messaging' },
  { id: 2, type: 'status_update', content: 'Le statut de votre demande REQ-2025-002 est passé à "En instruction"', date: '2025-07-08T09:00:00Z', read: false, link: '/case-tracking/REQ-2025-002' },
  { id: 3, type: 'payment_reminder', content: 'Rappel: Le paiement des frais de notaire pour REQ-2025-001 est en attente.', date: '2025-07-14T09:00:00Z', read: true, link: '/transactions' },
];

export const sampleSavedSearches = [
    { id: 1, name: "Terrains agricoles à Thiès", filters: { type: 'agricole', zone: 'thiès' }, new_results: 2, date: '2025-07-01' },
    { id: 2, name: "Lots viabilisés Diamniadio", filters: { viabilise: true, zone: 'diamniadio' }, new_results: 0, date: '2025-06-15' },
];

export const sampleFavorites = ['dk-alm-002', 'sly-ngp-010'];

export const sampleUserListings = [
    { id: 'p-user-01', name: "Terrain familial à Ngaparou", status: 'active', views: 125, inquiries: 4 },
];

export const sampleConversations = [
  { id: 'conv1', participants: ['user1', 'user2'], parcel_id: 'sly-ngp-010', last_message: 'Ok, je prépare les documents.', unread_count: 1, updated_at: '2025-07-11T14:25:00Z' },
  { id: 'conv2', participants: ['user1', 'user3'], parcel_id: null, last_message: 'Votre dossier est en cours d\'étude.', unread_count: 0, updated_at: '2025-07-08T09:00:00Z' },
  { id: 'conv3', participants: ['user1', 'user4'], parcel_id: 'sly-ngp-010', last_message: 'Veuillez nous fournir une copie de votre CNI.', unread_count: 0, updated_at: '2025-07-12T11:00:00Z' },
];

export const sampleMessages = {
  'conv1': [
    { id: 'msg1', conversation_id: 'conv1', sender_id: 'user1', content: "Bonjour, je suis intéressé par la parcelle SLY-NGP-010.", created_at: '2025-07-10T10:05:00Z' },
    { id: 'msg2', conversation_id: 'conv1', sender_id: 'user2', content: "Bonjour, excellente initiative. C'est un très bon emplacement. Que souhaitez-vous savoir?", created_at: '2025-07-10T10:10:00Z' },
    { id: 'msg3', conversation_id: 'conv1', sender_id: 'user1', content: "J'ai initié la procédure d'achat. Pouvez-vous me confirmer la réception?", created_at: '2025-07-11T14:20:00Z' },
    { id: 'msg4', conversation_id: 'conv1', sender_id: 'user2', content: "Bien reçu. Ok, je prépare les documents.", created_at: '2025-07-11T14:25:00Z' },
  ],
  'conv2': [
    { id: 'msg5', conversation_id: 'conv2', sender_id: 'user1', content: "Bonjour, j'ai soumis une demande d'attribution. Pouvez-vous me dire où en est le dossier?", created_at: '2025-07-08T08:30:00Z' },
    { id: 'msg6', conversation_id: 'conv2', sender_id: 'user3', content: "Bonjour, votre dossier est en cours d'étude. Nous vous notifierons de toute avancée.", created_at: '2025-07-08T09:00:00Z' },
  ],
  'conv3': [
    { id: 'msg7', conversation_id: 'conv3', sender_id: 'user4', content: "Bonjour, pour le dossier SLY-NGP-010, veuillez nous fournir une copie de votre CNI.", created_at: '2025-07-12T11:00:00Z' },
  ]
};

export const dashboardLinks = {
  particulier: [
    { name: 'Mes Demandes', path: '/my-requests', icon: FileText },
    { name: 'Transactions', path: '/transactions', icon: Smartphone },
    { name: 'Favoris', path: '/favorites', icon: Heart },
    { name: 'Recherches', path: '/saved-searches', icon: Search },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Messagerie', path: '/messaging', icon: MessageSquare },
    { name: 'Profil', path: '/profile', icon: User },
    { name: 'Paramètres', path: '/settings', icon: Settings },
  ],
  vendeur: [
    { name: 'Mes Biens', path: '/my-listings', icon: FileText },
    { name: 'Messagerie', path: '/messaging', icon: MessageSquare },
  ],
};

export const profileMenu = [
    { name: 'Tableau de bord', path: '/dashboard', icon: User },
    { name: 'Profil', path: '/profile', icon: Settings },
    { name: 'Aide', path: '/faq', icon: HelpCircle },
];