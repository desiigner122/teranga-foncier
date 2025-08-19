# Plan de Tests Manuels Notifications & Messagerie (2025-08-19)

## Pré-requis
1. Déployer les migrations incluant RLS + message_reads + trigger + RPC list_user_conversations.
2. Deux comptes utilisateurs (A = vendeur propriétaire d'une parcelle, B = acheteur) + un admin.
3. Au moins une parcelle appartenant à A (parcels.owner_id = A.id).

## Cas de Test
### 1. Favori -> Notification propriétaire
- Etant connecté en B, ouvrir la page de la parcelle de A.
- Cliquer "Ajouter aux favoris".
- Vérifier: notification créée pour A (cloche) type `favorite_added`.
- Supprimer favori: aucune *nouvelle* notification (log seulement).

### 2. Inquiry (info / visit / buy)
- Depuis compte B sur page parcelle A: envoyer demande (info, puis visit, puis buy).
- Vérifier: notifications distinctes pour A (type `parcel_inquiry`).
- Timeline événements (events) contient `parcel.inquiry`.

### 3. Demande (requests) statut
- En B: créer une demande (ex: request_type=visit) si UI disponible ou via insert SQL.
- En admin ou propriétaire/agent: changer le statut (pending -> approved -> completed) via interface ou RPC.
- Vérifier: chaque changement génère notification pour l'auteur (type `request_status`).

### 4. Transaction statut
- Créer transaction (buyer_id = B, seller_id = A).
- Appeler updateTransactionStatus pour passer à `processing` puis `completed`.
- Vérifier: notifications pour A et B (type `transaction_status`).

### 5. Messagerie Supabase
- Depuis B: initier conversation avec A à partir d'une parcelle (achat) ou via /messaging.
- Envoyer plusieurs messages bidirectionnels.
- Vérifier: trigger met à jour conversations.last_message & last_message_at.
- Conversation list triée par dernier message.

### 6. Read Receipts (message_reads)
- Sur conversation active, ouvrir avec B puis A.
- Implémentation prochaine: vérifier inserts manuels si pas encore UI (SELECT * FROM message_reads WHERE user_id = ...).

### 7. Politiques RLS Admin Override
- En admin: requête directe (SQL) sur parcel_views / parcel_inquiries / messages sans être participant -> rows visibles.
- En utilisateur normal non participant -> accès refusé (ou 0 rows). 

### 8. Notification Bell UX
- Ouvrir cloche: marquer lecture d'une notification -> badge décrémente.
- Vérifier que `markNotificationRead` met à jour read + read_at.

### 9. Performance (Smoke)
- Ouvrir /messaging avec >20 conversations: latence acceptable (<1.5s) liste.
- Ouvrir page vendeur: section "Demandes Reçues" s'affiche; pas d'erreurs console.

## Regressions à surveiller
- Accès pages protégées avec statut vérification `pending` (ne doit plus rediriger en boucle).
- Favoris: double insertion interdite (unique composite côté DB si non présent, sinon vérifier code).
- Notifications: Absence d'erreurs RLS (console supabase). 

## Données SQL Aide (exemples rapides)
```sql
-- Créer transaction test
insert into transactions (id, buyer_id, seller_id, amount, status) values (gen_random_uuid(), 'BUYER_UUID', 'SELLER_UUID', 1000000, 'initiated');

-- Forcer statut
update transactions set status='completed' where id='TRANSACTION_UUID';

-- Vérifier notifications
select * from notifications where user_id='SELLER_UUID' order by created_at desc limit 10;
```

## Prochaines améliorations
- UI pour afficher état lu/non-lu par message (bubble checkmark).
- Agrégation unreadCount conversation (count messages non lus via left join messages - message_reads).
- Pagination notifications (offset/limit) + bouton "Voir tout" (page dédiée déjà existante).
- Websocket dédié (replace polling 30s notifications par realtime). 
